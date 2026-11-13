import { useEffect, useRef } from 'react'
import { SandWord, sandHeight, sandInset } from '../sand'

// A wordmark that changes from one word to the other as sand (see ../sand.ts
// for how). This is the part that keeps time: `show` says which word should be
// up, and the mark gets there.
//
// It can be turned round halfway. Hover a club and move off again before the
// sand has landed, and the grains go back the way they came instead of
// finishing a change nobody is waiting for and then starting another.
//
// Nothing runs while the word is at rest: the frame loop starts when a change
// does and stops when it lands.

const SIZE = 40
const WEIGHT = 800
// one change, start to finish
export const SAND_MS = 1900
// grey-900, and the two teals: most grains keep the ink, the rest fly in the accent
const INK = '#1c1917'
const TINTS = ['#0f766e', '#0d9488']

const stillOnly = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface SandMarkProps {
  words: [string, string]
  // which of the two to show
  show: 0 | 1
  onClick: () => void
  label: string
}

export default function SandMark({ words, show, onClick, label }: SandMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // `from` is the word at rest when p is 0; `dir` is which way p is moving
  const run = useRef({ sand: null as SandWord | null, from: show, want: show, p: 0, dir: 0, raf: 0, last: 0 })
  // "head for the word that is wanted, from wherever the sand is now"
  const steer = useRef(() => {})
  const [first, second] = words

  // The pixels are read off the real glyphs, so the font has to be there
  // first. If it never arrives the browser's fallback is measured instead,
  // which is still a word turning to sand.
  useEffect(() => {
    const s = run.current
    let live = true

    const tick = (now: number) => {
      if (!s.sand) return
      // a frame after the tab was hidden would otherwise skip the whole change
      const dt = s.last ? Math.min(now - s.last, 50) : 0
      s.last = now
      s.p += (s.dir * dt) / SAND_MS
      if (s.p >= 1) Object.assign(s, { from: 1 - s.from, p: 0, dir: 0 })
      else if (s.p <= 0 && s.dir < 0) Object.assign(s, { p: 0, dir: 0 })
      s.sand.render(s.from, s.p)
      if (s.dir) s.raf = requestAnimationFrame(tick)
    }

    steer.current = () => {
      if (!s.sand) return
      if (stillOnly()) {
        // no sand for anyone who asked for less motion: the word just changes
        cancelAnimationFrame(s.raf)
        Object.assign(s, { from: s.want, p: 0, dir: 0 })
        s.sand.render(s.from, 0)
      } else if (s.dir) {
        // already in the air: carry on, or turn round
        s.dir = s.want === s.from ? -1 : 1
      } else if (s.want !== s.from) {
        s.dir = 1
        s.last = 0
        s.raf = requestAnimationFrame(tick)
      }
    }

    const font = `${WEIGHT} ${SIZE}px Inter`
    document.fonts.load(font, first + second).catch(() => undefined).then(() => {
      if (!live || !canvasRef.current) return
      s.sand = new SandWord(canvasRef.current, [first, second], {
        size: SIZE, weight: WEIGHT, family: 'Inter, system-ui, sans-serif', ink: INK, tints: TINTS,
      })
      s.sand.render(s.from, s.p)
      steer.current()
    })

    return () => {
      live = false
      cancelAnimationFrame(s.raf)
      Object.assign(s, { sand: null, p: 0, dir: 0 })
    }
  }, [first, second])

  useEffect(() => {
    run.current.want = show
    steer.current()
  }, [show])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-track="volunteering-sand"
      className="group flex items-end gap-2 rounded-lg"
      style={{ marginLeft: -sandInset(SIZE) }}
    >
      {/* the height is known before the font is, so nothing below it moves
          when the word arrives */}
      <canvas ref={canvasRef} aria-hidden="true" width={0} height={0} className="block" style={{ height: sandHeight(SIZE) }} />
      {/* replay */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-[9px] h-3.5 w-3.5 text-grey-400 transition-[color,transform] duration-300 group-hover:-rotate-45 group-hover:text-accent"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    </button>
  )
}
