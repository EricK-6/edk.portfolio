import { useEffect, useState } from 'react'
import { LABELS, MENU_IDS, NAV_IDS, hrefFor } from '../sitemap.js'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

export default function Navbar({ theme, onToggleTheme, layout, onToggleLayout, activeId }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled
          ? 'border-b border-grey-400/50 bg-grey-300/80 backdrop-blur dark:border-grey-800/80 dark:bg-black/80'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href={hrefFor('home', layout)} className="font-bold tracking-tight text-lg">
          Eric Kim<span className="text-accent dark:text-accent-dark">.</span>
        </a>

        <ul className="hidden lg:flex items-center gap-5 text-sm">
          {NAV_IDS.map((linkId) => (
            <li key={linkId}>
              <a
                href={hrefFor(linkId, layout)}
                aria-current={activeId === linkId ? 'page' : undefined}
                className={`transition-colors ${
                  activeId === linkId
                    ? 'text-grey-900 dark:text-grey-100'
                    : 'text-grey-600 hover:text-grey-900 dark:text-grey-400 dark:hover:text-grey-100'
                }`}
              >
                {LABELS[linkId]}
              </a>
            </li>
          ))}
        </ul>

        {/* right padding (sm–lg) reserves the corner for the floating MiniMap */}
        <div className="flex items-center gap-2 sm:pr-32 xl:pr-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))}
            aria-label="Open terminal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 hover:bg-grey-200 dark:border-grey-800 dark:text-grey-300 dark:hover:bg-grey-900"
          >
            <TerminalGlyph />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            aria-label="Open command menu"
            className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-grey-200 px-2.5 text-xs text-grey-500 hover:bg-grey-200 hover:text-grey-700 dark:border-grey-800 dark:text-grey-400 dark:hover:bg-grey-900 dark:hover:text-grey-200"
          >
            <SearchIcon />
            <span className="font-mono">{isMac ? '⌘' : 'Ctrl'} K</span>
          </button>
          <button
            onClick={onToggleLayout}
            aria-label={layout === 'box' ? 'Switch to scrolling layout' : 'Switch to box layout'}
            title={layout === 'box' ? 'Scrolling layout' : 'Box layout'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 hover:bg-grey-200 dark:border-grey-800 dark:text-grey-300 dark:hover:bg-grey-900"
          >
            {layout === 'box' ? <ScrollIcon /> : <GridIcon />}
          </button>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 hover:bg-grey-200 dark:border-grey-800 dark:text-grey-300 dark:hover:bg-grey-900"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 dark:border-grey-800 dark:text-grey-300"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-grey-200 dark:border-grey-800">
          <ul className="container-page py-3 flex flex-col gap-1">
            {MENU_IDS.map((linkId) => (
              <li key={linkId}>
                <a
                  href={hrefFor(linkId, layout)}
                  onClick={() => setOpen(false)}
                  aria-current={activeId === linkId ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm hover:bg-grey-200 dark:hover:bg-grey-900 ${
                    activeId === linkId
                      ? 'text-grey-900 dark:text-grey-100'
                      : 'text-grey-700 dark:text-grey-300'
                  }`}
                >
                  {LABELS[linkId]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

// shown in box mode -> click switches to the scrolling (stacked rows) layout
function ScrollIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="5" rx="1.5" />
      <rect x="4" y="13" width="16" height="5" rx="1.5" />
    </svg>
  )
}

// shown in scroll mode -> click switches to the box (3x3 grid) layout
function GridIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function TerminalGlyph() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
    </svg>
  )
}
