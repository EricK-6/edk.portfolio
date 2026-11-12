import { useEffect, useRef, useState } from 'react'
import { useOnScreen } from '../useOnScreen'
import { lfsrStep, LFSR_TAPS } from '../ride/lfsr'
import { Controls, LabButton, LabCard, prefersStill, SCREEN, Screen } from './Lab'

// Flappy Universe's random number generator, clocking.
//
// There is no processor on that board and no Math.random to call. Randomness
// is sixteen flip-flops in a row: every clock each bit moves one place along,
// and the bit that enters at the front is the XOR of four of the others. With
// the taps the game uses (bits 16, 15, 13 and 4) the register walks through
// all 65,535 non-zero states before it repeats.
//
// The game samples it each time a pipe leaves the screen, to decide where the
// next gap goes, somewhere in rows 80 to 320. And so every game is different,
// it takes its seed from a counter that has been running freely since power
// on, captured at the player's first click. The seed button here does the
// same thing with the same excuse: nobody clicks at the same microsecond twice.

const BITS = 16
// the number of clocks between pipes: one whole register's worth, so each
// sample shares no bits with the last
const PER_PIPE = 16
const PIPES = 13

const gapRow = (state: number) => 80 + (state % 241)
const hex = (state: number) => `0x${state.toString(16).toUpperCase().padStart(4, '0')}`

export default function LfsrLab() {
  const [state, setState] = useState(0xace1)
  const [steps, setSteps] = useState(0)
  const [pipes, setPipes] = useState<number[]>(() => {
    // start with a screenful, so the strip is not empty before the first clock
    let s = 0xace1
    return Array.from({ length: PIPES }, () => { for (let i = 0; i < PER_PIPE; i++) s = lfsrStep(s); return gapRow(s) })
  })
  const [running, setRunning] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref, '0px')
  const live = useRef({ state: 0xace1, steps: 0 })

  const clock = (count = 1) => {
    const l = live.current
    const fresh: number[] = []
    for (let i = 0; i < count; i++) {
      l.state = lfsrStep(l.state)
      l.steps += 1
      if (l.steps % PER_PIPE === 0) fresh.push(gapRow(l.state))
    }
    setState(l.state)
    setSteps(l.steps)
    if (fresh.length) setPipes((p) => [...p, ...fresh].slice(-PIPES))
  }

  // run only while it can be seen
  useEffect(() => {
    if (!running || !onScreen) return
    const timer = setInterval(() => clock(), 55)
    return () => clearInterval(timer)
    // `clock` reads everything it needs from a ref, so it is not a dependency
  }, [running, onScreen])

  // The game's trick: a free-running counter, read at the moment of a click.
  const seed = () => {
    const captured = (Math.floor(performance.now() * 1000) & 0xffff) || 1
    live.current = { state: captured, steps: 0 }
    setState(captured)
    setSteps(0)
    setSeeded(true)
  }

  // bit 16 is where the feedback enters, bit 1 is the one about to fall off
  const cells = Array.from({ length: BITS }, (_, i) => ({ bit: BITS - i, on: (state >> (BITS - 1 - i)) & 1 }))
  const taps = new Set(LFSR_TAPS.map((t) => BITS + 1 - t))
  const x = (i: number) => 26 + i * 29.5

  return (
    <LabCard
      id="flappy-universe"
      from="Flappy Universe · L1 Logic"
      title="Randomness out of sixteen flip-flops"
    >
      <Screen>
        <div ref={ref}>
          <svg viewBox="0 0 520 236" className="block w-full" role="img" aria-label={`A 16 bit shift register holding ${hex(state)}, after ${steps} clocks.`}>
            <text x="26" y="26" fill={SCREEN.soft} fontSize="10.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1.4">16 BIT FIBONACCI LFSR</text>
            <text x="494" y="26" fill={SCREEN.gold} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1" textAnchor="end">{hex(state)}</text>

            {/* the feedback: the tapped bits, XORed, back round to the front */}
            <path d={`M ${x(15) + 10} 88 H ${x(0) - 14} V 51 H ${x(0) - 3}`} fill="none" stroke={SCREEN.teal} strokeWidth="1.2" opacity="0.75" />
            <path d={`M ${x(0) - 8} 47.5 L ${x(0) - 2} 51 L ${x(0) - 8} 54.5 Z`} fill={SCREEN.teal} />
            {cells.map((cell, i) => (
              <g key={cell.bit}>
                {i > 0 && <line x1={x(i) - 9.5} y1="51" x2={x(i) - 1} y2="51" stroke={SCREEN.faint} strokeWidth="1" />}
                <rect x={x(i)} y="38" width="20" height="26" rx="3.5" fill={cell.on ? SCREEN.teal : 'rgba(233,241,238,0.04)'} stroke={cell.on ? SCREEN.teal : SCREEN.faint} strokeWidth="1" />
                <text x={x(i) + 10} y="55" fill={cell.on ? SCREEN.bg : SCREEN.soft} fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="500" textAnchor="middle">{cell.on}</text>
                {taps.has(cell.bit) && (
                  <g>
                    <line x1={x(i) + 10} y1="64" x2={x(i) + 10} y2="82" stroke={SCREEN.teal} strokeWidth="1.2" opacity="0.75" />
                    <circle cx={x(i) + 10} cy="88" r="6" fill={SCREEN.bg} stroke={SCREEN.teal} strokeWidth="1.2" />
                    <path d={`M ${x(i) + 4} 88 h 12 M ${x(i) + 10} 82 v 12`} stroke={SCREEN.teal} strokeWidth="1.1" />
                    <text x={x(i) + 10} y="108" fill={SCREEN.soft} fontSize="9.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{BITS + 1 - cell.bit}</text>
                  </g>
                )}
              </g>
            ))}

            {/* what it is for: the gap in each pipe is one sample of the register */}
            <text x="26" y="132" fill={SCREEN.soft} fontSize="10.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1.4">GAP CENTRE, ONE PER PIPE</text>
            <text x="494" y="132" fill={SCREEN.faint} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="0.6" textAnchor="end">ROWS 80 TO 320</text>
            <line x1="26" y1="218" x2="494" y2="218" stroke={SCREEN.faint} strokeWidth="1" />
            {pipes.map((row, i) => {
              const px = 34 + i * 36
              // rows 0..480 squeezed into the strip
              const cy = 144 + (row / 480) * 72
              const newest = i === pipes.length - 1
              return (
                <g key={`${i}-${row}`} opacity={0.35 + 0.65 * (i / (PIPES - 1))}>
                  <rect x={px} y="142" width="17" height={Math.max(0, cy - 10 - 142)} rx="2" fill="none" stroke={newest ? SCREEN.gold : SCREEN.teal} strokeWidth="1.1" />
                  <rect x={px} y={cy + 10} width="17" height={Math.max(0, 216 - cy - 10)} rx="2" fill="none" stroke={newest ? SCREEN.gold : SCREEN.teal} strokeWidth="1.1" />
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/[0.07] px-3.5 py-2.5 font-mono text-[11px] tabular-nums">
          <span style={{ color: SCREEN.soft }}>clock {steps.toLocaleString('en-NZ')} of 65,535</span>
          <span style={{ color: seeded ? SCREEN.gold : SCREEN.faint }}>{seeded ? 'seeded by your click' : 'seed 0xACE1'}</span>
        </div>
      </Screen>

      <div className="px-5 pt-3">
        <p className="min-h-[2.5rem] text-[13.5px] font-medium leading-snug text-grey-900">
          Each clock shifts every bit one place right, and four of them decide the bit that comes in. That is all the randomness the game has.
        </p>
      </div>

      <Controls>
        <LabButton primary onClick={() => setRunning((r) => !r)} data-track="bench-lfsr-run" disabled={prefersStill()}>
          {running ? 'Pause' : 'Run'}
        </LabButton>
        <LabButton onClick={() => clock()} disabled={running} data-track="bench-lfsr-step">Clock once</LabButton>
        <LabButton onClick={seed} data-track="bench-lfsr-seed" className="ml-auto">Seed from this click</LabButton>
      </Controls>
    </LabCard>
  )
}
