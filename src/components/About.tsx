import { Fragment, useRef, type ReactNode } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { useOnScreen } from '../useOnScreen'
import { HIGHLIGHTS } from '../content'

// Short on purpose. The Highlights beside this were listing the certificates,
// the placements and the roles, and the prose was saying all of it again in
// sentences: the same section told you everything twice. The bullets keep the
// facts, so the paragraphs only have to say who he is and what he is doing
// now. The toolkit went too, because the Skills section is a list of exactly
// that and does it better.
export default function About() {
  return (
    // The statement *is* the heading. It used to be an h3 inside the section
    // under an h2 that said "About me" — and it was set larger than that h2,
    // so the page's own hierarchy ran backwards. The kicker carries the
    // section's name (matching the navbar's contents index) and the one line
    // worth reading is the title.
    <Section id="about" kicker="About" title={<Motto />} narrow>
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which left a column of empty glass whenever the text
          was short. Stacked, the paragraphs can each be two lines without
          stranding anything, so each one carries a single idea: who he is,
          how he builds, where he is now, what he is after. */}
      <div>
        <Reveal className="space-y-4 leading-relaxed text-grey-700">
          <p>
            I'm Eric, a penultimate Computer Systems Engineering student at the
            University of Auckland, working across <Bold>AI</Bold>,{' '}
            <Bold>cloud computing</Bold> and <Bold>robotics</Bold>.
          </p>
          <p>
            Most of what I build ends up on <Bold>AWS</Bold>. Studying for the{' '}
            <Bold>Solutions Architect - Associate</Bold> certification changed how I get it there:
            I design for the failure modes now, rather than just wiring services together.
          </p>
          <p>
            I was a research assistant at <Bold>CARES</Bold>, studying robot soccer and navigation,
            and taught robotics at <Bold>ciLab</Bold>, helping students build and program the
            robots they compete with.
          </p>
          <p>
            I'm open to interesting conversations, side projects and collaborations, so don't
            hesitate to <a href="#contact" className="font-semibold text-grey-900 underline underline-offset-2">reach out</a>.
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="mt-8 block border-t border-grey-200 pt-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-grey-500">Highlights</div>
          <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm text-grey-700 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}

// The motto, and the only line on the site that performs.
//
// It is the first sentence a reader meets after the photograph, so it gets
// the one piece of choreography below the fold: the words light left to
// right, then a trace draws underneath from a square pad to a round node.
// That is the sentence's own argument made twice — a board at one end, a
// cloud at the other, one signal between them.
//
// Every rule the rest of the page follows still holds. It is an entrance, so
// it runs once and then holds still; it animates opacity and transform only,
// never layout; and it is latched (`useOnScreen`'s `once`), so scrolling
// back up does not replay it.
const MOTTO = ['From', 'silicon', 'to', 'serverless.']

function Motto() {
  const ref = useRef<HTMLSpanElement>(null)
  // Roughly where Reveal brings the heading block in, so the words start
  // lighting as it arrives rather than after a visible pause. Erring early is
  // the safe direction: the worst case is a motto that is simply already
  // there, never an empty heading waiting for a trigger.
  const lit = useOnScreen(ref, '0px 0px -40px 0px', true)

  return (
    <span ref={ref} className={`motto ${lit ? 'is-lit' : ''}`}>
      {MOTTO.map((word, i) => {
        const last = i === MOTTO.length - 1
        const span = (
          <span
            // the last word is the destination, so it is the accent
            className={`motto-word ${last ? 'motto-cloud' : ''}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            {word}
          </span>
        )
        return (
          <Fragment key={word}>
            {span}
            {last ? '' : ' '}
          </Fragment>
        )
      })}
      {/* the sentence again, in two marks and a wire between them */}
      <span className="motto-trace" aria-hidden="true">
        <ChipMark />
        <span className="motto-wire" />
        <CloudMark />
      </span>
    </span>
  )
}

// The two ends of the sentence, drawn. Inline rather than from an icon set:
// they are two paths used once, and a dependency for that would cost more
// than it saves. Stroke is `currentColor` so each end takes its colour from
// the CSS that positions it.
function ChipMark() {
  return (
    <svg
      className="motto-chip"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  )
}

function CloudMark() {
  return (
    <svg
      className="motto-cloud-mark"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 18.5H8.5a5.5 5.5 0 1 1 5.28-7h3.72a3.5 3.5 0 1 1 0 7Z" />
    </svg>
  )
}

function Bold({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-grey-900">{children}</strong>
}
