import { useCallback, useEffect, useRef, useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { track } from '../analytics'

// Off the clock: a drum machine.
//
// About says he drums with friends, so the page keeps a kit. Sixteen steps,
// four voices, and nothing recorded: every hit is built on the spot from an
// oscillator or a burst of noise, shaped by an envelope. That is the same
// signal chain as the rest of this site in miniature, a clock driving logic
// driving something you can hear.
//
// Timing is the part worth getting right. A setTimeout is good to about ten
// milliseconds on a quiet day, and a drummer hears ten milliseconds. So the
// timer here never plays anything: it only looks a tenth of a second ahead and
// hands the audio clock a list of exact times, which the audio hardware then
// keeps to the sample. The playhead on screen is drawn from the same list.
//
// Nothing makes a sound until Play is pressed, and a pattern is one copyable
// link.

const STEPS = 16

type Hit = (ctx: AudioContext, at: number, out: AudioNode, noise: AudioBuffer) => void

// An envelope that starts at `peak` and dies away over `secs`.
function fade(ctx: AudioContext, at: number, peak: number, secs: number) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(peak, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + secs)
  return gain
}

// A tone whose pitch falls: the skin of a drum relaxing after it is struck.
function thump(ctx: AudioContext, at: number, out: AudioNode, from: number, to: number, fall: number, peak: number, ring: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(from, at)
  osc.frequency.exponentialRampToValueAtTime(to, at + fall)
  osc.connect(fade(ctx, at, peak, ring)).connect(out)
  osc.start(at)
  osc.stop(at + ring + 0.02)
}

// Filtered noise: everything on a kit that is not a note.
function hiss(ctx: AudioContext, at: number, out: AudioNode, noise: AudioBuffer, above: number, peak: number, ring: number) {
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = above
  src.connect(filter).connect(fade(ctx, at, peak, ring)).connect(out)
  src.start(at)
  src.stop(at + ring + 0.02)
}

const VOICES: { id: string; name: string; hit: Hit; steps: number[] }[] = [
  { id: 'hat', name: 'Hat', hit: (ctx, at, out, noise) => hiss(ctx, at, out, noise, 7400, 0.3, 0.05), steps: [0, 2, 4, 6, 8, 10, 12, 14, 15] },
  { id: 'tom', name: 'Tom', hit: (ctx, at, out) => thump(ctx, at, out, 196, 104, 0.2, 0.75, 0.3), steps: [13] },
  {
    id: 'snare', name: 'Snare',
    hit: (ctx, at, out, noise) => { hiss(ctx, at, out, noise, 1500, 0.7, 0.17); thump(ctx, at, out, 215, 140, 0.08, 0.45, 0.11, 'triangle') },
    steps: [4, 12],
  },
  {
    id: 'kick', name: 'Kick',
    hit: (ctx, at, out, noise) => { thump(ctx, at, out, 158, 46, 0.11, 1, 0.36); hiss(ctx, at, out, noise, 2500, 0.18, 0.012) },
    steps: [0, 7, 10],
  },
]

const groove = () => VOICES.map((v) => Array.from({ length: STEPS }, (_, i) => v.steps.includes(i)))
const empty = () => VOICES.map(() => Array<boolean>(STEPS).fill(false))

// A pattern as sixteen hex digits, one per step, a bit per voice: short enough
// to sit in a link.
const encode = (grid: boolean[][], bpm: number, swing: number) =>
  `${Array.from({ length: STEPS }, (_, i) => grid.reduce((n, row, v) => n | (row[i] ? 1 << v : 0), 0).toString(16)).join('')}-${bpm}-${swing}`

function decode(text: string | null) {
  const m = text?.match(/^([0-9a-f]{16})-(\d{2,3})-(\d{1,2})$/)
  if (!m) return null
  return {
    grid: VOICES.map((_, v) => Array.from({ length: STEPS }, (_, i) => Boolean(parseInt(m[1][i], 16) & (1 << v)))),
    bpm: Math.max(60, Math.min(170, Number(m[2]))),
    swing: Math.max(0, Math.min(60, Number(m[3]))),
  }
}

export default function Drums() {
  // a pattern from a shared link, if this page was opened with one
  const [shared] = useState(() => decode(new URLSearchParams(window.location.search).get('beat')))
  const [grid, setGrid] = useState(() => shared?.grid ?? groove())
  const [bpm, setBpm] = useState(shared?.bpm ?? 96)
  const [swing, setSwing] = useState(shared?.swing ?? 18)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(-1)
  const [copied, setCopied] = useState(false)

  // what the scheduler reads: it runs on a timer, outside React's renders
  const live = useRef({ grid, bpm, swing })
  live.current = { grid, bpm, swing }
  const audio = useRef<{ ctx: AudioContext; out: AudioNode; noise: AudioBuffer } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const kit = useCallback(() => {
    if (audio.current) return audio.current
    const ctx = new AudioContext()
    // one second of white noise, reused by every hat and snare
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    // a compressor on the way out, so four voices landing together do not clip
    const out = ctx.createGain()
    out.gain.value = 0.72
    const squash = ctx.createDynamicsCompressor()
    out.connect(squash).connect(ctx.destination)
    audio.current = { ctx, out, noise }
    return audio.current
  }, [])

  useEffect(() => {
    if (!playing) return
    const { ctx, out, noise } = kit()
    void ctx.resume()
    let step = 0
    let next = ctx.currentTime + 0.06
    // steps already handed to the audio clock, waiting for their moment so
    // the playhead can light with the sound rather than with the timer
    const due: { step: number; time: number }[] = []

    const timer = window.setInterval(() => {
      const { grid, bpm, swing } = live.current
      const sixteenth = 60 / bpm / 4
      while (next < ctx.currentTime + 0.1) {
        VOICES.forEach((voice, v) => { if (grid[v][step]) voice.hit(ctx, next, out, noise) })
        due.push({ step, time: next })
        // swing: every other sixteenth arrives late, and the one after makes it up
        const lean = (swing / 100) * 0.66
        next += sixteenth * (step % 2 === 0 ? 1 + lean : 1 - lean)
        step = (step + 1) % STEPS
      }
    }, 25)

    let raf = 0
    const follow = () => {
      raf = requestAnimationFrame(follow)
      let now = -1
      while (due.length && due[0].time <= ctx.currentTime) now = due.shift()!.step
      if (now >= 0) setAt(now)
    }
    raf = requestAnimationFrame(follow)

    return () => {
      window.clearInterval(timer)
      cancelAnimationFrame(raf)
      setAt(-1)
    }
  }, [playing, kit])

  useEffect(() => () => { void audio.current?.ctx.close() }, [])

  const toggle = (v: number, i: number) => {
    setGrid((g) => g.map((row, r) => (r === v ? row.map((on, c) => (c === i ? !on : on)) : row)))
    // hear what was just added, unless the loop is about to play it anyway
    if (!grid[v][i] && !playing) { const { ctx, out, noise } = kit(); void ctx.resume(); VOICES[v].hit(ctx, ctx.currentTime + 0.01, out, noise) }
  }

  const audition = (v: number) => { const { ctx, out, noise } = kit(); void ctx.resume(); VOICES[v].hit(ctx, ctx.currentTime + 0.01, out, noise) }

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?beat=${encode(grid, bpm, swing)}#offclock`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      track('drums-share')
    } catch { /* clipboard blocked: nothing to say */ }
  }

  // One tab stop for the whole grid, arrows to move about in it: sixty-four
  // buttons in the tab order would be a wall between the reader and the footer.
  const [cursor, setCursor] = useState<[number, number]>([VOICES.length - 1, 0])
  const onKey = (e: React.KeyboardEvent) => {
    const move: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    const d = move[e.key]
    if (!d) return
    e.preventDefault()
    const v = (cursor[0] + d[0] + VOICES.length) % VOICES.length
    const i = (cursor[1] + d[1] + STEPS) % STEPS
    setCursor([v, i])
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${v}-${i}"]`)?.focus()
  }

  const hits = grid.flat().filter(Boolean).length

  return (
    <Section
      id="offclock"
      kicker="Off the clock"
      title="I also play the drums"
      subtitle="So this page keeps a kit. Every sound is made in your browser as it plays."
    >
      <Reveal className="card !p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          <div
            ref={gridRef}
            role="grid"
            aria-label="Drum pattern: four voices by sixteen steps"
            onKeyDown={onKey}
            className="grid min-w-[36rem] gap-y-2 p-5 sm:min-w-0"
          >
            {VOICES.map((voice, v) => (
              <div key={voice.id} role="row" className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                <button
                  type="button"
                  onClick={() => audition(v)}
                  title={`Hear the ${voice.name.toLowerCase()}`}
                  className="group flex flex-col items-start rounded-md py-0.5 text-left"
                >
                  <span className="text-[13px] font-semibold text-grey-900 transition-colors group-hover:text-accent-deep">{voice.name}</span>
                </button>
                <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1">
                  {grid[v].map((on, i) => (
                    <button
                      key={i}
                      type="button"
                      role="gridcell"
                      data-cell={`${v}-${i}`}
                      tabIndex={cursor[0] === v && cursor[1] === i ? 0 : -1}
                      aria-pressed={on}
                      aria-label={`${voice.name}, step ${i + 1}`}
                      onClick={() => { setCursor([v, i]); toggle(v, i) }}
                      onFocus={() => setCursor([v, i])}
                      className={`h-9 rounded-md border transition-[background-color,border-color,box-shadow,transform] duration-100 ${i % 4 === 0 && i ? 'ml-1' : ''} ${
                        on
                          ? `border-accent bg-accent ${at === i ? 'scale-[1.06] shadow-[0_0_0_3px_rgba(15,118,110,0.22)]' : ''}`
                          : `${i % 4 === 0 ? 'bg-grey-200/70' : 'bg-grey-100'} ${at === i ? 'border-accent/60' : 'border-grey-200 hover:border-grey-400'}`
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
            {/* the count, under the steps: where the beats fall */}
            <div aria-hidden="true" className="grid grid-cols-[5.5rem_1fr] gap-3">
              <span />
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 font-mono text-[9px] text-grey-400">
                {Array.from({ length: STEPS }, (_, i) => (
                  <span key={i} className={`text-center ${i % 4 === 0 && i ? 'ml-1' : ''} ${at === i ? 'font-semibold text-accent-deep' : ''}`}>
                    {i % 4 === 0 ? i / 4 + 1 : i % 2 === 0 ? '&' : '·'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-grey-200 px-5 py-4">
          <button
            type="button"
            onClick={() => { setPlaying((p) => !p); if (!playing) track('drums-play') }}
            aria-pressed={playing}
            className="btn-primary h-9 min-w-[5.5rem] justify-center"
          >
            {playing ? <StopIcon /> : <PlayIcon />}
            {playing ? 'Stop' : 'Play'}
          </button>
          <Knob label="Tempo" value={bpm} unit="bpm" min={60} max={170} onChange={setBpm} />
          <Knob label="Swing" value={swing} unit="%" min={0} max={60} onChange={setSwing} />
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setGrid(empty())} disabled={!hits} className="btn-secondary h-9 disabled:opacity-50">Clear</button>
            <button type="button" onClick={() => { setGrid(groove()); setBpm(96); setSwing(18) }} className="btn-secondary h-9">Reset</button>
            <button type="button" onClick={share} className="btn-secondary h-9" title="Copy a link that opens this page with this pattern">
              {copied ? 'Link copied' : 'Copy beat'}
            </button>
          </div>
        </div>
      </Reveal>
      <p className="mt-4 text-center font-mono text-[11px] tracking-wide text-grey-400">
        {shared ? 'Someone sent you this beat. ' : ''}Click a step to add a hit.
      </p>
    </Section>
  )
}

function Knob({ label, value, unit, min, max, onChange }: { label: string; value: number; unit: string; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-xs text-grey-600">
      <span className="font-medium text-grey-700">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="speed-range"
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
      <span className="w-14 font-mono tabular-nums text-grey-800">{value} {unit}</span>
    </label>
  )
}

function PlayIcon() {
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.5v15a1 1 0 0 0 1.5.86l13-7.5a1 1 0 0 0 0-1.72l-13-7.5A1 1 0 0 0 6 4.5Z" /></svg>
}

function StopIcon() {
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
}
