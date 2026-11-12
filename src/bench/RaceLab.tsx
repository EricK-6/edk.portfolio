import { useEffect, useRef, useState } from 'react'
import { Controls, LabButton, LabCard, prefersStill, SCREEN, Screen, Segmented } from './Lab'

// SLOTLY, in one picture: twenty people press Book for the same board at the
// same instant, and what happens depends on who is in charge of saying no.
//
// Three ways to build it, the three the project went through:
//
//   0  check, then insert   the application asks "is it free?" and then books.
//                           Everyone who asks before the first insert lands
//                           hears yes.
//   1  exclusion constraint the database refuses an overlap itself. Exactly
//                           one booking, but two inserts waiting on each other
//                           can deadlock, and a deadlock is a 500, not a 409.
//   2  constraint + lock    lock the resource row first, so requests for the
//                           same device queue up. One 201, nineteen 409s.
//
// It is a simulation, not a database. The timing is random on every run; the
// deadlock rate in mode 1 is set to what the project's own concurrency test
// measured (about one failing run in two before the lock, none after).

type Mode = 0 | 1 | 2
type Outcome = 201 | 409 | 500

interface Request {
  home: [number, number]
  lane: number
  depart: number // leaves the client
  gate: number // reaches the database (or, with the lock, the queue)
  serve: number // its turn begins
  done: number // its answer
  outcome: Outcome
  slot: number // which row or tray place it settles in
}

const N = 20
const WALL = 284 // where the database begins
const QUEUE = 236 // where the lock makes them wait
const MID = 118

const MODES: { value: Mode; label: string }[] = [
  { value: 0, label: 'Check, then insert' },
  { value: 1, label: 'Exclusion constraint' },
  { value: 2, label: 'Constraint + row lock' },
]

const ease = (u: number) => u * u * (3 - 2 * u)
const clamp = (u: number) => Math.max(0, Math.min(1, u))

// Decide a whole run up front: when each request leaves, arrives and is
// answered, and with what. Drawing it is then just reading the plan at a time.
function plan(mode: Mode): Request[] {
  const reqs: Request[] = Array.from({ length: N }, (_, i) => {
    const depart = 150 + Math.random() * 420
    return {
      home: [30 + (i % 5) * 17, 84 + Math.floor(i / 5) * 17],
      lane: (i - (N - 1) / 2) * 3.4,
      depart,
      gate: depart + 430 + Math.random() * 70,
      serve: 0,
      done: 0,
      outcome: 409,
      slot: 0,
    }
  })
  const order = [...reqs].sort((a, b) => a.gate - b.gate)

  if (mode === 0) {
    // everyone who looks before the first insert has landed sees a free slot
    let firstInsert = Infinity
    for (const r of order) {
      r.serve = r.gate
      r.done = r.gate + 80 + Math.random() * 110
      if (r.gate < firstInsert) { r.outcome = 201; firstInsert = Math.min(firstInsert, r.done) }
    }
  } else if (mode === 1) {
    const [winner, ...rest] = order
    winner.serve = winner.gate
    winner.done = winner.gate + 130
    winner.outcome = 201
    // the ones that arrive while the winner is still open are the ones that
    // can end up waiting on each other
    const racing = rest.filter((r) => r.gate < winner.done)
    const victims = Math.random() < 0.5 ? racing.slice(0, 1 + Math.floor(Math.random() * Math.min(3, racing.length))) : []
    for (const r of rest) {
      r.serve = r.gate
      r.done = Math.max(r.gate, winner.done) + 40 + Math.random() * 90
      if (victims.includes(r)) r.outcome = 500
    }
  } else {
    // one at a time, in the order they reached the lock
    let free = 0
    order.forEach((r, k) => {
      r.serve = Math.max(r.gate, free)
      r.done = r.serve + 62
      free = r.done
      if (k === 0) r.outcome = 201
    })
  }

  const seen: Record<Outcome, number> = { 201: 0, 409: 0, 500: 0 }
  for (const r of [...reqs].sort((a, b) => a.done - b.done)) r.slot = seen[r.outcome]++
  return reqs
}

// Where a request is, and what colour, at a given moment of the run.
function at(r: Request, reqs: Request[], mode: Mode, t: number): { x: number; y: number; fill: string; opacity: number } {
  const stop = mode === 2 ? QUEUE : WALL
  const door: [number, number] = [stop, mode === 2 ? MID : MID + r.lane]
  if (t < r.depart) return { x: r.home[0], y: r.home[1], fill: SCREEN.line, opacity: 0.9 }
  if (t < r.gate) {
    const u = ease((t - r.depart) / (r.gate - r.depart))
    return { x: r.home[0] + (door[0] - r.home[0]) * u, y: r.home[1] + (door[1] - r.home[1]) * u, fill: SCREEN.line, opacity: 1 }
  }
  if (t < r.serve) {
    // in the queue: one place back for everyone still ahead
    const ahead = reqs.filter((q) => q.gate < r.gate && q.serve > t).length
    return { x: QUEUE - ahead * 8.5, y: MID, fill: SCREEN.line, opacity: 1 }
  }
  if (t < r.done) {
    const u = (t - r.serve) / (r.done - r.serve)
    return { x: door[0] + (WALL - door[0]) * u, y: door[1], fill: SCREEN.gold, opacity: 1 }
  }
  // answered: a booking slides into the table, a refusal drops into its tray
  const u = ease(clamp((t - r.done) / 260))
  const from: [number, number] = [WALL, door[1]]
  const to: [number, number] =
    r.outcome === 201 ? [306, 82 + Math.min(r.slot, 6) * 13]
    : r.outcome === 409 ? [338 + (r.slot % 10) * 8.5, 185 + Math.floor(r.slot / 10) * 9]
    : [452 + r.slot * 9, 189]
  return {
    x: from[0] + (to[0] - from[0]) * u,
    y: from[1] + (to[1] - from[1]) * u,
    fill: r.outcome === 201 ? SCREEN.teal : r.outcome === 500 ? SCREEN.red : SCREEN.soft,
    opacity: r.outcome === 201 ? 1 - u : 1,
  }
}

const tally = (reqs: Request[], t: number) => {
  const done = reqs.filter((r) => r.done <= t)
  return { ok: done.filter((r) => r.outcome === 201).length, no: done.filter((r) => r.outcome === 409).length, err: done.filter((r) => r.outcome === 500).length }
}

export default function RaceLab() {
  const [mode, setMode] = useState<Mode>(0)
  const [running, setRunning] = useState(false)
  const [counts, setCounts] = useState<{ ok: number; no: number; err: number } | null>(null)
  // the last ten runs in each mode: was it one clean booking, or not
  const [history, setHistory] = useState<Record<Mode, boolean[]>>({ 0: [], 1: [], 2: [] })
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const run = useRef<{ reqs: Request[]; mode: Mode } | null>(null)
  const frame = useRef(0)

  const paint = (t: number) => {
    const now = run.current
    if (!now) return
    now.reqs.forEach((r, i) => {
      const dot = dots.current[i]
      if (!dot) return
      const p = at(r, now.reqs, now.mode, t)
      dot.setAttribute('cx', p.x.toFixed(1))
      dot.setAttribute('cy', p.y.toFixed(1))
      dot.setAttribute('fill', p.fill)
      dot.setAttribute('opacity', p.opacity.toFixed(2))
    })
  }

  const book = () => {
    cancelAnimationFrame(frame.current)
    const reqs = plan(mode)
    run.current = { reqs, mode }
    const end = Math.max(...reqs.map((r) => r.done)) + 320
    const finish = () => {
      paint(end)
      const final = tally(reqs, end)
      setCounts(final)
      setRunning(false)
      setHistory((h) => ({ ...h, [mode]: [...h[mode], final.ok === 1 && final.err === 0].slice(-10) }))
    }
    if (prefersStill()) { finish(); return }

    setRunning(true)
    setCounts({ ok: 0, no: 0, err: 0 })
    const started = performance.now()
    let shown = ''
    const tick = (now: number) => {
      const t = now - started
      paint(t)
      const live = tally(reqs, t)
      const key = `${live.ok},${live.no},${live.err}`
      if (key !== shown) { shown = key; setCounts(live) }
      if (t < end) frame.current = requestAnimationFrame(tick)
      else finish()
    }
    frame.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // a new mode is a clean table
  const choose = (next: Mode) => {
    cancelAnimationFrame(frame.current)
    run.current = null
    setRunning(false)
    setCounts(null)
    setMode(next)
    dots.current.forEach((dot, i) => {
      if (!dot) return
      dot.setAttribute('cx', String(30 + (i % 5) * 17))
      dot.setAttribute('cy', String(84 + Math.floor(i / 5) * 17))
      dot.setAttribute('fill', SCREEN.line)
      dot.setAttribute('opacity', '0.9')
    })
  }

  const bookings = counts?.ok ?? 0
  const settled = counts && !running
  const verdict = !settled
    ? running ? 'Twenty requests on their way…' : 'One board, one hour, twenty people who all want it.'
    : mode === 0
      ? bookings > 1 ? `${bookings} people now hold the same board for the same hour.` : 'One booking this time, by luck. Run it again.'
      : mode === 1
        ? counts.err > 0
          ? `No double booking, but ${counts.err} ${counts.err === 1 ? 'request' : 'requests'} died in a deadlock: a 500 where a 409 belonged.`
          : 'One booking, nineteen 409s. This run got away with it; about half do not.'
        : 'One booking, nineteen clean 409s. Every single run.'

  return (
    <LabCard
      id="slotly"
      from="SLOTLY · L4 Software"
      title="Twenty people press Book at once"
    >
      <Screen>
        <svg viewBox="0 0 520 236" className="block w-full" role="img" aria-label={`Simulation of twenty concurrent booking requests. ${verdict}`}>
          <text x="30" y="66" fill={SCREEN.soft} fontSize="10.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1.4">20 REQUESTS</text>
          <text x="30" y="160" fill={SCREEN.faint} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="0.6">POST /bookings</text>

          {/* the way in: a wall for the constraint, a gate for the lock */}
          <line x1="130" y1={MID} x2={mode === 2 ? QUEUE - 6 : WALL - 8} y2={MID} stroke={SCREEN.faint} strokeWidth="1" strokeDasharray="2 5" />
          {mode === 2 && (
            <g>
              <line x1={QUEUE + 6} y1="92" x2={QUEUE + 6} y2="144" stroke={SCREEN.gold} strokeWidth="1.5" />
              <text x={QUEUE + 6} y="84" fill={SCREEN.gold} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.2" textAnchor="middle">ROW LOCK</text>
            </g>
          )}

          {/* the table */}
          <rect x="292" y="22" width="210" height="192" rx="10" fill="rgba(233,241,238,0.035)" stroke={mode === 0 ? SCREEN.faint : SCREEN.teal} strokeWidth={mode === 0 ? 1 : 1.5} />
          <text x="306" y="44" fill={SCREEN.line} fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="0.8">bookings</text>
          <text x="306" y="60" fill={SCREEN.soft} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="0.6">FPGA #1 · 10:00 to 11:00</text>
          {mode !== 0 && <text x="488" y="44" fill={SCREEN.teal} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.2" textAnchor="end">EXCLUDE</text>}
          {Array.from({ length: Math.min(bookings, 7) }, (_, k) => (
            <rect
              key={k} x="306" y={77.5 + k * 13} width="182" height="9" rx="3"
              fill={k === 0 ? SCREEN.teal : 'rgba(255,138,92,0.2)'}
              stroke={k === 0 ? 'none' : SCREEN.red} strokeWidth="1" strokeDasharray={k === 0 ? undefined : '4 3'}
            />
          ))}
          {bookings > 7 && <text x="488" y="174" fill={SCREEN.red} fontSize="10.5" fontFamily="JetBrains Mono, monospace" textAnchor="end">+{bookings - 7} more</text>}
          <text x="306" y="178" fill={SCREEN.faint} fontSize="9.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">409 CONFLICT</text>
          <text x="452" y="178" fill={SCREEN.faint} fontSize="9.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">500</text>

          {Array.from({ length: N }, (_, i) => (
            <circle
              key={i}
              ref={(el) => { dots.current[i] = el }}
              cx={30 + (i % 5) * 17} cy={84 + Math.floor(i / 5) * 17} r="3.6"
              fill={SCREEN.line} opacity="0.9"
            />
          ))}
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/[0.07] px-3.5 py-2.5 font-mono text-[11px] tabular-nums">
          <span className="flex gap-3.5">
            <span style={{ color: SCREEN.teal }}>201 ×{counts?.ok ?? 0}</span>
            <span style={{ color: SCREEN.soft }}>409 ×{counts?.no ?? 0}</span>
            <span style={{ color: counts?.err ? SCREEN.red : SCREEN.faint }}>500 ×{counts?.err ?? 0}</span>
          </span>
          <span className="flex items-center gap-1" title="The last ten runs in this mode: teal is one clean booking">
            <span className="mr-1 text-[9.5px] uppercase tracking-[0.14em]" style={{ color: SCREEN.faint }}>last 10</span>
            {Array.from({ length: 10 }, (_, i) => {
              const ok = history[mode][i]
              return <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: ok === undefined ? 'rgba(233,241,238,0.12)' : ok ? SCREEN.teal : SCREEN.red }} />
            })}
          </span>
        </div>
      </Screen>

      <div className="px-5 pt-3">
        <p aria-live="polite" className="min-h-[2.5rem] text-[13.5px] font-medium leading-snug text-grey-900">{verdict}</p>
      </div>

      <Controls>
        <Segmented label="How the booking is guarded" options={MODES} value={mode} onChange={choose} />
        <LabButton primary onClick={book} disabled={running} data-track="bench-slotly-run" className="ml-auto">
          Book ×20
        </LabButton>
      </Controls>
    </LabCard>
  )
}
