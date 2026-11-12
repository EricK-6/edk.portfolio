import { useEffect, useRef, useState } from 'react'
import { useOnScreen } from '../useOnScreen'
import { Controls, Dial, LabCard, prefersStill, SCREEN, Screen } from './Lab'

// The Smart Energy Monitor's arithmetic, on a scope.
//
// The real one is an ATmega328P with two conditioned analog channels, one for
// voltage and one for current. It never sees a sine wave: it sees a few dozen
// 10 bit numbers per cycle, and has to turn those into an RMS voltage, a peak
// current and an average power, to within 5% of full scale across a 2.5 to
// 7.5 VA load.
//
// This does the same sums the firmware does, on samples quantised the way an
// ADC quantises them, and shows how close they land to the true values. The
// source voltage and the two full-scale ranges are this demo's own; the load
// range and the spec are the project's.

const PER_CYCLE = 40 // samples in one mains cycle
const CYCLES = 2
const V_FULL = 24 // volts, peak, that the voltage channel can read
const I_FULL = 1.2 // amps, peak, that the current channel can read
const V_SCALE = 15 // the full-scale readings errors are judged against
const I_SCALE = 1.2
const P_SCALE = 7.5

// what a 10 bit converter makes of a value between -full and +full
const adc = (x: number, full: number) => {
  const code = Math.round(Math.max(0, Math.min(1, x / full / 2 + 0.5)) * 1023)
  return (code / 1023 - 0.5) * 2 * full
}

function measure(vrms: number, load: number, pf: number, phase: number) {
  const irms = load / vrms
  const lag = Math.acos(pf)
  const v = (th: number) => Math.SQRT2 * vrms * Math.sin(th)
  const i = (th: number) => Math.SQRT2 * irms * Math.sin(th - lag)
  let sumSq = 0
  let sumP = 0
  let peak = 0
  const n = PER_CYCLE * CYCLES
  for (let k = 0; k < n; k++) {
    const th = phase + (k / PER_CYCLE) * Math.PI * 2
    const vs = adc(v(th), V_FULL)
    const is = adc(i(th), I_FULL)
    sumSq += vs * vs
    sumP += vs * is
    peak = Math.max(peak, Math.abs(is))
  }
  const got = { v: Math.sqrt(sumSq / n), i: peak, p: sumP / n }
  const want = { v: vrms, i: Math.SQRT2 * irms, p: load * pf }
  const worst = Math.max(Math.abs(got.v - want.v) / V_SCALE, Math.abs(got.i - want.i) / I_SCALE, Math.abs(got.p - want.p) / P_SCALE) * 100
  return { got, worst, v, i }
}

export default function ScopeLab() {
  const [vrms, setVrms] = useState(12)
  const [load, setLoad] = useState(5)
  const [pf, setPf] = useState(0.85)
  const [read, setRead] = useState(() => measure(12, 5, 0.85, 0))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onScreen = useOnScreen(canvasRef, '0px')
  const knobs = useRef({ vrms, load, pf })
  knobs.current = { vrms, load, pf }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let lastRead = 0
    const still = prefersStill()

    const paint = (now: number) => {
      const { vrms, load, pf } = knobs.current
      // the sampling instants drift against the waveform, as they do when the
      // sample clock and the mains are not locked together
      const phase = still ? 0.3 : now / 2600
      const m = measure(vrms, load, pf, phase)
      if (now - lastRead > 220 || still) { lastRead = now; setRead(m) }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      const g = canvas.getContext('2d')!
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)
      const mid = h / 2
      const amp = h * 0.4
      const span = CYCLES * Math.PI * 2

      // graticule
      g.strokeStyle = SCREEN.grid
      g.lineWidth = 1
      g.beginPath()
      for (let c = 0; c <= 8; c++) { const x = Math.round((c / 8) * (w - 1)) + 0.5; g.moveTo(x, 0); g.lineTo(x, h) }
      for (let r = 0; r <= 4; r++) { const y = Math.round((r / 4) * (h - 1)) + 0.5; g.moveTo(0, y); g.lineTo(w, y) }
      g.stroke()
      g.strokeStyle = SCREEN.faint
      g.beginPath(); g.moveTo(0, mid + 0.5); g.lineTo(w, mid + 0.5); g.stroke()

      const trace = (f: (th: number) => number, full: number, color: string) => {
        g.strokeStyle = color
        g.lineWidth = 1.6
        g.beginPath()
        for (let px = 0; px <= w; px += 2) {
          const y = mid - (f(phase + (px / w) * span) / full) * amp
          if (px) g.lineTo(px, y); else g.moveTo(px, y)
        }
        g.stroke()
        // the samples: what the microcontroller actually has to work with
        g.fillStyle = color
        for (let k = 0; k < PER_CYCLE * CYCLES; k++) {
          const th = (k / PER_CYCLE) * Math.PI * 2
          const y = mid - (adc(f(phase + th), full) / full) * amp
          g.beginPath(); g.arc((th / span) * w, y, 1.9, 0, Math.PI * 2); g.fill()
        }
      }
      trace(m.v, V_FULL, SCREEN.teal)
      trace(m.i, I_FULL, SCREEN.gold)

      g.font = '500 9px "JetBrains Mono", monospace'
      g.fillStyle = SCREEN.teal
      g.fillText('CH1  VOLTAGE', 10, 16)
      g.fillStyle = SCREEN.gold
      g.fillText('CH2  CURRENT', 104, 16)
      g.fillStyle = SCREEN.faint
      g.textAlign = 'right'
      g.fillText(`${PER_CYCLE} SAMPLES A CYCLE · 10 BIT`, w - 10, 16)
      g.textAlign = 'left'

      if (!still) raf = requestAnimationFrame(paint)
    }

    if (onScreen || still) raf = requestAnimationFrame(paint)
    const onResize = () => { if (still) requestAnimationFrame(paint) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
    // under reduced motion the picture is redrawn when a dial moves instead
  }, [onScreen, vrms, load, pf])

  const cell = (label: string, value: string, unit: string) => (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: SCREEN.faint }}>{label}</span>
      <span className="text-[15px] font-medium" style={{ color: SCREEN.red }}>{value}</span>
      <span className="text-[10px]" style={{ color: SCREEN.soft }}>{unit}</span>
    </span>
  )

  return (
    <LabCard
      id="smart-energy-monitor"
      from="Smart Energy Monitor · L0 Silicon, L2 Firmware"
      title="RMS, peak and power from raw samples"
    >
      <Screen>
        <canvas ref={canvasRef} className="block aspect-[19/14] w-full" role="img" aria-label={`An oscilloscope showing a voltage and a current waveform with their samples. Measured ${read.got.v.toFixed(2)} volts RMS, ${read.got.i.toFixed(3)} amps peak, ${read.got.p.toFixed(2)} watts.`} />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/[0.07] px-3.5 py-2 font-mono tabular-nums" aria-hidden="true">
          {cell('Vrms', read.got.v.toFixed(2), 'V')}
          {cell('Ipk', read.got.i.toFixed(3), 'A')}
          {cell('P', read.got.p.toFixed(2), 'W')}
        </div>
      </Screen>

      <div className="px-5 pt-3">
        <p className="min-h-[2.5rem] text-[13.5px] font-medium leading-snug text-grey-900">
          Worst reading is {read.worst.toFixed(2)}% of full scale away from the truth. The spec allowed 5%.
        </p>
      </div>

      <Controls>
        <Dial label="Source" value={vrms} unit="V" min={10} max={15} step={0.5} onChange={setVrms} />
        <Dial label="Load" value={load} unit="VA" min={2.5} max={7.5} step={0.5} onChange={setLoad} />
        <Dial label="PF" value={pf} unit="" min={0.6} max={1} step={0.05} onChange={setPf} />
      </Controls>
    </LabCard>
  )
}
