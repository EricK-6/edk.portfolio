import { Fragment, useRef } from 'react'
import { useOnScreen } from '../useOnScreen'

// "From silicon to serverless." and the only line on the site that performs.
//
// The words light left to right, then a trace draws underneath from a chip to
// a cloud: the sentence's own argument made twice. It used to be the heading
// of About. It is now where the ride up the stack ends, because the ride is
// that sentence acted out, and this is its last line.
//
// Every rule the rest of the page follows still holds. It is an entrance, so
// it runs and then holds still, and it animates opacity and transform only,
// never layout.
//
// `lit` hands the timing to the caller: the ride lights it as the signal comes
// through the clouds, and puts it out again if the reader scrolls back down.
// Left out, it lights itself the first time it scrolls into view and stays lit.
const MOTTO = ['From', 'silicon', 'to', 'serverless.']

export default function Motto({ lit, className = '' }: { lit?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Roughly where Reveal brings a heading in, so the words start lighting as
  // it arrives rather than after a visible pause.
  const seen = useOnScreen(ref, '0px 0px -40px 0px', true)
  const on = lit ?? seen

  return (
    <span ref={ref} className={`motto ${on ? 'is-lit' : ''} ${className}`}>
      {MOTTO.map((word, i) => {
        const last = i === MOTTO.length - 1
        return (
          <Fragment key={word}>
            <span
              // the last word is the destination, so it is the accent
              className={`motto-word ${last ? 'motto-cloud' : ''}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {word}
            </span>
            {last ? '' : ' '}
          </Fragment>
        )
      })}
      {/* the sentence again, in two marks and a wire between them */}
      <span className="motto-trace" aria-hidden="true">
        <ChipMark className="motto-chip" />
        <span className="motto-wire" />
        <CloudMark className="motto-cloud-mark" />
      </span>
    </span>
  )
}

// The two ends of the sentence, drawn. Inline rather than from an icon set:
// they are two paths, and a dependency for that would cost more than it saves.
// Stroke is `currentColor`, so each takes its colour from whatever places it.
// They are also the two ends of the ride's gauge: the chip at the bottom of
// the stack, the cloud at the top.
export function ChipMark({ className = '', size = 17 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
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

export function CloudMark({ className = '', size = 19 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
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
