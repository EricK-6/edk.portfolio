import Reveal from './Reveal.jsx'
import { useLayout } from '../layout.js'

export default function Section({ id, kicker, title, subtitle, wide = false, children, className = '' }) {
  // space mode shows a whole section in one floating panel: keep the normal
  // content width (so nothing looks stretched) but drop the roomy document
  // spacing so a section fits one screen
  const space = useLayout() === 'space'
  return (
    <section id={id} className={`${space ? 'py-8' : 'py-20 sm:py-24'} ${className}`}>
      {/* wide: let sprawling layouts (leadership serpentine) breathe past the default column */}
      <div className={`container-page ${wide ? 'max-w-7xl' : ''}`}>
        {(kicker || title) && (
          <Reveal className={`${space ? 'mb-6' : 'mb-10'} max-w-4xl`}>
            {kicker && <div className="section-kicker">{kicker}</div>}
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && (
              <p className="mt-3 text-grey-600 dark:text-grey-400 leading-relaxed">{subtitle}</p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
