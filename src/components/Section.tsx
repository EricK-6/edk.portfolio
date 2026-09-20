import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface SectionProps {
  id: string
  kicker?: string
  // ReactNode rather than string: About's motto animates itself word by word,
  // so it arrives as markup. Every other section still passes a plain string.
  title?: ReactNode
  subtitle?: string
  wide?: boolean
  narrow?: boolean
  children: ReactNode
  className?: string
}

// One section of the document.
//
// The spacing is now a single value. There used to be two — a `tile` mode
// that squeezed a section into `calc(100svh - 6.5rem)` and a `page` mode for
// print — because every section had to fit one screen. Nothing has to fit
// anything any more, so the compressed variant is gone along with the branch
// that chose it.
//
// The heading is set the way a printed contents page sets one: a small
// uppercase kicker in muted grey doing the labelling, and the sentence
// underneath carrying the weight. A section name is a signpost, not a
// headline, and it should not shout louder than the work it introduces.
export default function Section({ id, kicker, title, subtitle, wide = false, narrow = false, children, className = '' }: SectionProps) {
  return (
    // No `scroll-mt` here: the header offset for every anchor on the site is
    // `scroll-padding-top` on <html> (index.css), in one place. Setting both
    // adds them together, and anchors landed 9rem down instead of 5.
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      {/* One column for the heading and the content both. They used to be
          separate — a `container-page` heading over a `mx-auto max-w-3xl`
          body — so the kicker started 44px to the left of the paragraph it
          introduced. `narrow` sets a reading measure for prose; `wide` lets
          sprawling layouts (the leadership serpentine) past the default. */}
      <div className={`container-page ${wide ? 'max-w-6xl' : ''} ${narrow ? '!max-w-2xl' : ''}`}>
        {(kicker || title) && (
          <Reveal className="mb-10 max-w-3xl sm:mb-12">
            {kicker && <p className="section-kicker">{kicker}</p>}
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
