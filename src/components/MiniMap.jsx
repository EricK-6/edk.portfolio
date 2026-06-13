import { useState } from 'react'
import { GRID, LABELS, hrefFor } from '../sitemap.js'

// Floating 3x3 site map pinned to the very top-right corner of the viewport.
// Hovering (or focusing) a cell reveals its name in the label below; the
// current page is accent-filled and home (the centre) wears a ring. z sits
// between the navbar (z-40) and the modals (z-50).
export default function MiniMap({ current }) {
  const [hovered, setHovered] = useState(null)
  const shown = hovered ?? current

  return (
    <nav
      aria-label="Site map"
      onMouseLeave={() => setHovered(null)}
      className="fixed right-3 top-3 z-[45] hidden flex-col gap-2 rounded-xl border border-grey-400/60 bg-grey-100/90 p-2 shadow-lg backdrop-blur sm:flex dark:border-grey-700/70 dark:bg-grey-900/90"
    >
      <div className="grid grid-cols-3 gap-1">
        {GRID.flat().map((id) => {
          const active = id === current
          return (
            <a
              key={id}
              href={hrefFor(id)}
              aria-label={LABELS[id]}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => setHovered(id)}
              onFocus={() => setHovered(id)}
              onBlur={() => setHovered(null)}
              className={`h-7 w-7 rounded-md transition-all duration-150 hover:scale-110 ${
                active
                  ? 'bg-accent shadow-sm dark:bg-accent-dark'
                  : 'bg-grey-300 hover:bg-accent/40 dark:bg-grey-700 dark:hover:bg-accent-dark/40'
              } ${id === 'home' ? 'ring-1 ring-inset ring-grey-500/50 dark:ring-grey-400/40' : ''}`}
            />
          )
        })}
      </div>
      <div className="text-center text-[11px] font-medium leading-none text-grey-700 dark:text-grey-300">
        {LABELS[shown]}
      </div>
    </nav>
  )
}
