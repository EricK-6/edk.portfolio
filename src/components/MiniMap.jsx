import { GRID, INITIALS, LABELS, hrefFor } from '../sitemap.js'

// Floating 3x3 site map pinned to the very top-right corner of the viewport.
// Each cell shows a section's initial and links to its page; the current page
// is highlighted. z is between the navbar (z-40) and the modals (z-50) so it
// sits above the bar but is still covered by the command palette / terminal.
export default function MiniMap({ current }) {
  return (
    <nav
      aria-label="Site map"
      className="fixed right-3 top-3 z-[45] hidden grid-cols-3 gap-1 rounded-xl border border-grey-400/60 bg-grey-100/90 p-1.5 shadow-lg backdrop-blur sm:grid dark:border-grey-700/70 dark:bg-grey-900/90"
    >
      {GRID.flat().map((id) => {
        const active = id === current
        return (
          <a
            key={id}
            href={hrefFor(id)}
            title={LABELS[id]}
            aria-label={LABELS[id]}
            aria-current={active ? 'page' : undefined}
            className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold leading-none transition-colors ${
              active
                ? 'bg-accent text-white dark:bg-accent-dark dark:text-grey-950'
                : 'bg-grey-200 text-grey-600 hover:bg-grey-300 hover:text-grey-900 dark:bg-grey-800 dark:text-grey-400 dark:hover:bg-grey-700 dark:hover:text-grey-100'
            }`}
          >
            {INITIALS[id]}
          </a>
        )
      })}
    </nav>
  )
}
