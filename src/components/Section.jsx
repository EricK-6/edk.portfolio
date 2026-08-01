import Reveal from './Reveal.jsx'
import { useLayout } from '../layout.js'

export default function Section({ id, kicker, title, subtitle, wide = false, children, className = '' }) {
  // A tile never scrolls: whatever a section is, it has to fit one screen.
  // So in tile mode the document spacing is pulled in hard — the content
  // width stays put (nothing looks stretched), only the air around it goes.
  const tile = useLayout() === 'tile'
  return (
    <section id={id} className={`${tile ? 'py-5 sm:py-6' : 'py-20 sm:py-24'} ${className}`}>
      {/* wide: let sprawling layouts (leadership serpentine) breathe past the default column */}
      <div className={`container-page ${wide ? 'max-w-7xl' : ''}`}>
        {(kicker || title) && (
          <Reveal className={`${tile ? 'mb-4' : 'mb-10'} max-w-4xl`}>
            {kicker && <div className={`section-kicker ${tile ? '!mb-1 text-xs' : ''}`}>{kicker}</div>}
            {title && <h2 className={`section-title ${tile ? '!mb-1 text-xl sm:text-2xl' : ''}`}>{title}</h2>}
            {subtitle && (
              <p
                className={`sm:text-justify text-grey-600 leading-relaxed ${
                  tile ? 'mt-1.5 text-sm' : 'mt-3'
                }`}
              >
                {subtitle}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
