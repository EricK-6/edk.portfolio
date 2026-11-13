import { useEffect, useRef, useState, type ReactNode } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import SandMark, { SAND_MS } from './SandMark'
import { emphasise } from './emphasise'
import { useOnScreen } from '../useOnScreen'
import { CLUBS, ROLES } from '../content'

// newest first (ongoing roles count as newest)
const ITEMS = [
  ...ROLES.filter((r) => r.period.includes('Present')),
  ...ROLES.filter((r) => !r.period.includes('Present')).reverse(),
]

// The competitions' axis is a sine curve, one half-wave per event, so every
// event's dot sits on a node where the curve crosses the line. Drawn 1:1 in
// pixels vertically (AMP either side of the line) and stretched across the width.
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

// The wordmark over the clubs spells the older one, then the newer: KEB, and
// then the K turns to sand and comes down again as WEB3.
const [NEWER, OLDER] = CLUBS
const MARKS: [string, string] = [OLDER.mark, NEWER.mark]
const THEN = 0
const NOW = 1

// The label over each half of the section, the same one Certifications sets
// over its tiers.
const LABEL = 'font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500'

// The competitions' timeline: a hairline with a dot per entry. Across on
// desktop, with every entry sharing the row evenly so it fits the section
// without scrolling; down the side on phones.
const TRACK = 'relative flex flex-col gap-8 border-l border-grey-200 pl-6 md:grid md:gap-0 md:border-l-0 md:border-t md:pl-0'

interface StepProps {
  period: string
  image: string
  org: string
  title: string
  detail?: string
  delay: number
  // how much room the step leaves before the next one, from md
  gutter: string
  children: ReactNode
}

function Step({ period, image, org, title, detail, delay, gutter, children }: StepProps) {
  return (
    <Reveal as="li" delay={delay} className={`relative block md:pt-5 ${gutter}`}>
      {/* On a phone the dot sits on the list's left border (24.5px out, so
          30.5px to its own left edge) and level with the middle of the logo:
          the date line (16px) + its gap (12px) + half the 40px logo. */}
      <span className="absolute -left-[30.5px] top-12 h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-page md:-left-1.5 md:-top-1.5 md:z-10 md:translate-y-0" />
      <div className="text-xs text-grey-500 md:absolute md:-top-7 md:left-0">{period}</div>
      <img
        src={image}
        alt={org}
        loading="lazy"
        decoding="async"
        className="mt-3 h-10 w-10 rounded-lg bg-grey-50 object-contain p-1 ring-1 ring-grey-200"
      />
      <h4 className="mt-3 font-semibold leading-snug">{title}</h4>
      {detail && <div className="text-xs font-medium text-accent">{detail}</div>}
      <div className="text-xs font-medium text-grey-600">{org}</div>
      {children}
    </Reveal>
  )
}

export default function Volunteering() {
  const [speed, setSpeed] = useState(1)
  const runnerRef = useRef<HTMLSpanElement>(null)

  // playbackRate rather than a new duration: changing a running animation's
  // duration jumps the dot to a different spot, this just speeds it up in place
  useEffect(() => {
    runnerRef.current?.getAnimations({ subtree: true }).forEach((a) => { a.playbackRate = speed })
  }, [speed])

  // Which club the wordmark spells. It waits on the older one until it is
  // properly on screen, so the change is something you see rather than
  // something that already happened above the fold. After that the newer club
  // is home: pointing at the older one sends the sand back for as long as you
  // stay, and pressing the mark plays the round trip.
  const [mark, setMark] = useState<0 | 1>(THEN)
  const markRef = useRef<HTMLDivElement>(null)
  const seen = useOnScreen(markRef, '0px 0px -25% 0px', true)
  const timer = useRef(0)
  const soon = (to: 0 | 1, ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMark(to), ms)
  }

  useEffect(() => {
    // long enough for the section to finish fading in and the word to be read
    if (seen) timer.current = window.setTimeout(() => setMark(NOW), 900)
    return () => window.clearTimeout(timer.current)
  }, [seen])

  const point = (to: 0 | 1) => {
    window.clearTimeout(timer.current)
    setMark(to)
  }

  const replay = () => {
    if (mark === THEN) return point(NOW)
    point(THEN)
    // there, a beat to read it, and back
    soon(NOW, SAND_MS + 1100)
  }

  return (
    <Section id="volunteering" kicker="Volunteering" title="Clubs and events I've helped run">
      <h3 className={LABEL}>Clubs</h3>
      {/* pulled up under the label: the top of the canvas is empty air for
          the sand to fly in, not space the page needs to keep */}
      <Reveal className="-mt-3">
        <div ref={markRef} className="flex">
          <SandMark
            words={MARKS}
            show={mark}
            onClick={replay}
            label={`Replay the sand turning ${OLDER.mark} into ${NEWER.mark}`}
          />
        </div>
      </Reveal>
      {/* The same timeline as the competitions below, a dot and a date on the
          line for each club. Under the line each one is set the way
          Education sets a school: a large logo with the role beside it. */}
      <ol className={`${TRACK} mt-6 md:mt-10`} style={{ gridTemplateColumns: `repeat(${CLUBS.length}, minmax(0, 1fr))` }}>
        {CLUBS.map((c, i) => (
          <Reveal
            key={c.id}
            as="li"
            delay={i * 80}
            className="relative block md:pr-8 md:pt-5"
            onMouseEnter={() => point(c === OLDER ? THEN : NOW)}
            // a moment's grace, so crossing from one club to the other does
            // not send the sand home and straight back out again
            onMouseLeave={() => soon(NOW, 200)}
          >
            {/* on a phone, level with the middle of the logo: the date line
                (16px) + its gap (12px) + half the 64px logo */}
            <span className="absolute -left-[30.5px] top-[60px] h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-page md:-left-1.5 md:-top-1.5 md:z-10 md:translate-y-0" />
            <div className="text-xs text-grey-500 md:absolute md:-top-7 md:left-0">{c.period}</div>
            <div className="mt-3 flex gap-4">
              <img
                src={c.image}
                alt={c.org}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 flex-none rounded-xl object-cover ring-1 ring-grey-200 md:h-20 md:w-20"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold leading-snug">{c.role}</h4>
                <div className="text-xs font-medium text-accent">{c.detail}</div>
                <div className="text-xs font-medium text-grey-600">{c.org}</div>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-grey-700">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden="true" className="mt-[0.6em] inline-block h-1 w-1 flex-none rounded-full bg-accent" />
                      <span>{emphasise(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <div className="mt-16 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mt-20">
        <div>
          <h3 className={LABEL}>Competitions</h3>
          <p className="mt-2 text-sm text-grey-600">The dot is me, always busy with competitions and community.</p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-grey-500 md:flex">
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
      </div>
      <ol className={`${TRACK} mt-8 md:mt-14`} style={{ gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))` }}>
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
          <Step
            key={r.id}
            period={r.period}
            image={r.image}
            org={r.org}
            title={r.title}
            detail={r.detail}
            delay={i * 80}
            gutter="md:pr-5"
          >
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
          </Step>
        ))}
      </ol>
    </Section>
  )
}
