import { useEffect, useRef, useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { ROLES } from '../content'

// newest first (ongoing roles count as newest)
const ITEMS = [
  ...ROLES.filter((r) => r.period.includes('Present')),
  ...ROLES.filter((r) => !r.period.includes('Present')).reverse(),
]

// The axis is a sine curve, one half-wave per event, so every event's dot sits
// on a node where the curve crosses the line. Drawn 1:1 in pixels vertically
// (AMP either side of the line) and stretched across the width.
const AMP = 12
const CYCLES = ITEMS.length / 2
const WAVE = Array.from({ length: 161 }, (_, n) => {
  const x = n / 160
  return `${n ? 'L' : 'M'} ${(x * 100).toFixed(2)} ${(AMP - AMP * Math.sin(2 * Math.PI * CYCLES * x)).toFixed(2)}`
}).join(' ')

const SPEED_MIN = 0.25
const SPEED_MAX = 3

// what the dot's mood is called as the bar goes up, from the left
const MOODS = ['relaxed', 'busy', 'very busy', 'overbooked']
const moodOf = (speed: number) =>
  MOODS[Math.min(MOODS.length - 1, Math.floor(((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * MOODS.length))]

export default function Volunteering() {
  const [speed, setSpeed] = useState(1)
  const runnerRef = useRef<HTMLSpanElement>(null)

  // playbackRate rather than a new duration: changing a running animation's
  // duration jumps the dot to a different spot, this just speeds it up in place
  useEffect(() => {
    runnerRef.current?.getAnimations({ subtree: true }).forEach((a) => { a.playbackRate = speed })
  }, [speed])

  return (
    <Section id="volunteering" kicker="Volunteering" title="Events I've helped run" subtitle="The dot is me, always busy with competitions and community.">
      {/* Same look as Experience: a hairline with a dot per entry. Across on
          desktop, with every entry sharing the column evenly so it fits the
          section without scrolling; down the side on phones. */}
      <div className="mb-2 hidden items-center justify-end gap-2 text-xs text-grey-500 md:flex">
        <label htmlFor="dot-speed">Make me busy</label>
        <input
          id="dot-speed"
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-range"
          style={{ '--fill': `${((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100}%` } as React.CSSProperties}
        />
        <span aria-live="polite" className="w-20 font-medium text-accent">{moodOf(speed)}</span>
      </div>
      <ol
        className="relative flex flex-col gap-8 border-l border-grey-200 pl-6 md:mt-8 md:grid md:gap-0 md:border-l-0 md:border-t md:pl-0"
        style={{ gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))` }}
      >
        {/* the sine axis (desktop): its nodes are where the event dots sit */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 100 ${AMP * 2}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-0 hidden w-full -translate-y-1/2 md:block"
          style={{ height: AMP * 2 }}
        >
          <path d={WAVE} fill="none" className="stroke-accent/30" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* a pulse riding the curve, oldest to newest (desktop) */}
        <span
          ref={runnerRef}
          aria-hidden="true"
          className="line-runner pointer-events-none absolute -top-[7px] hidden h-3 w-3 -translate-x-1/2 md:block"
        >
          <span
            className="line-runner-dot block h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20"
            style={{ '--wave': `${5 / CYCLES}s` } as React.CSSProperties}
          />
        </span>
        {ITEMS.map((r, i) => (
          <Reveal key={`${r.title}-${r.org}`} as="li" delay={i * 80} className="relative block md:pr-5 md:pt-5">
            {/* On a phone the dot sits on the list's left border (24.5px out, so
                30.5px to its own left edge) and level with the middle of the logo:
                the date line (16px) + its gap (12px) + half the 40px logo. */}
            <span className="absolute -left-[30.5px] top-12 h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-page md:-left-1.5 md:-top-1.5 md:z-10 md:translate-y-0" />
            <div className="text-xs text-grey-500 md:absolute md:-top-7 md:left-0">{r.period}</div>
            {r.image && (
              <img
                src={r.image}
                alt={r.org}
                loading="lazy"
                decoding="async"
                className="mt-3 h-10 w-10 rounded-lg bg-grey-50 object-contain p-1 ring-1 ring-grey-200"
              />
            )}
            <h3 className="mt-3 font-semibold leading-snug">{r.title}</h3>
            {r.detail && <div className="text-xs font-medium text-accent">{r.detail}</div>}
            <div className="text-xs font-medium text-grey-600">{r.org}</div>
            <p className="mt-2 text-xs leading-relaxed text-grey-700">{r.description}</p>
            {r.link && (
              <a
                href={r.link.href}
                target="_blank"
                rel="noreferrer"
                data-track={`volunteering-${r.id}-link`}
                className="mt-2 inline-block text-xs font-semibold text-accent underline underline-offset-2"
              >
                {r.link.label} ↗
              </a>
            )}
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
