import { useEffect, useRef, useState } from 'react'
import { LABELS, MENU_IDS, NAV_IDS, hrefFor } from '../sitemap.js'
import { NAME, useNameTyped } from '../nameReveal.js'
import { useVisited } from '../passport.js'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

export default function Navbar({ theme, onToggleTheme, layout, onToggleLayout, activeId }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navWrapRef = useRef(null)
  // sketch hints fade out once the visitor has typed the name (revealed the photo)
  const showHints = useNameTyped() < NAME.length

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
          ? 'border-b border-grey-300 bg-white/80 backdrop-blur dark:border-grey-800/80 dark:bg-black/80'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href={hrefFor('home', layout)} className="font-bold tracking-tight text-lg">
          Eric Kim<span className="text-accent dark:text-accent-dark">.</span>
          <span className="ml-2 hidden align-middle font-mono text-[9px] font-normal uppercase tracking-[0.3em] text-grey-400 dark:text-grey-600 lg:inline">
            EK·2027
          </span>
        </a>

        {/* the links sit along a dotted flight path: a little plane parks at
            the active section and glides on navigation, and visited stops
            carry a passport-stamp dot (see FlightPath below) */}
        <div ref={navWrapRef} className="relative hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            {NAV_IDS.map((linkId) => (
              <li key={linkId}>
                <a
                  data-nav-id={linkId}
                  href={hrefFor(linkId, layout)}
                  aria-current={activeId === linkId ? 'page' : undefined}
                  className={`transition-colors ${
                    activeId === linkId
                      ? 'text-accent dark:text-grey-100'
                      : 'text-grey-600 hover:text-grey-900 dark:text-grey-400 dark:hover:text-grey-100'
                  }`}
                >
                  {LABELS[linkId]}
                </a>
              </li>
            ))}
          </ul>
          <FlightPath wrapRef={navWrapRef} activeId={activeId} />
        </div>

        <div className="flex items-center gap-2 print:hidden">
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
          <div className="relative">
            <button
              onClick={onToggleLayout}
              aria-label={layout === 'space' ? 'Switch to scrolling layout' : 'Switch to space layout'}
              title={layout === 'space' ? 'At a glance (scroll)' : 'Space mode'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 hover:bg-grey-200 dark:border-grey-800 dark:text-grey-300 dark:hover:bg-grey-900"
            >
              {layout === 'space' ? <ScrollIcon /> : <OrbitIcon />}
            </button>
            {showHints && (
              <Hint align="end" className="mt-1.5">
                {layout === 'space' ? 'At glance' : 'take a flight?'}
              </Hint>
            )}
          </div>
          <div className="relative">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-400/60 text-grey-600 hover:bg-grey-200 dark:border-grey-800 dark:text-grey-300 dark:hover:bg-grey-900"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {showHints && <Hint align="start" className="mt-1.5">{theme === 'dark' ? 'lighter mood?' : 'darker mood?'}</Hint>}
          </div>
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
                      ? 'text-accent dark:text-grey-100'
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

// The dotted route drawn under the desktop nav links. Link centres are
// measured from the DOM (and re-measured on resize / after fonts settle);
// the plane is absolutely positioned at the active link and a CSS left
// transition makes it glide between stops. Purely decorative.
function FlightPath({ wrapRef, activeId }) {
  const [centers, setCenters] = useState(null)
  const visited = useVisited()

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const wr = wrap.getBoundingClientRect()
      const next = {}
      wrap.querySelectorAll('[data-nav-id]').forEach((el) => {
        const r = el.getBoundingClientRect()
        next[el.dataset.navId] = r.left - wr.left + r.width / 2
      })
      setCenters(next)
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready?.then(measure) // Inter loading changes link widths
    return () => window.removeEventListener('resize', measure)
  }, [wrapRef])

  const ids = NAV_IDS.filter((id) => centers?.[id] != null)
  if (ids.length < 2) return null
  const first = centers[ids[0]]
  const last = centers[ids[ids.length - 1]]
  const planeX = centers[activeId] // undefined when the active section isn't a nav link

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full mt-0.5 h-3">
      <div
        className="absolute top-1/2 border-t border-dotted border-grey-400/70 dark:border-grey-700"
        style={{ left: first, width: last - first }}
      />
      {/* stops: stamped once visited (passport), the active one is under the plane */}
      {ids.map((id) =>
        id === activeId ? null : (
          <span
            key={id}
            className={`absolute top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
              visited.has(id)
                ? 'bg-accent/70 dark:bg-accent-dark/80'
                : 'border border-grey-400 bg-white dark:border-grey-600 dark:bg-black'
            }`}
            style={{ left: centers[id] }}
          />
        )
      )}
      <span
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent transition-[left,opacity] duration-700 ease-in-out motion-reduce:transition-none dark:text-accent-dark"
        style={{ left: planeX ?? first, opacity: planeX == null ? 0 : 1 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </span>
    </div>
  )
}

// hand-drawn annotation hanging under a toggle, with a little curly arrow
// pointing up at the button. `align` 'end' extends the text left of the button,
// 'start' extends it right. Decorative; fades in and disappears once the
// visitor types the name.
function Hint({ children, align = 'end', className = '' }) {
  const end = align === 'end'
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-full flex animate-fade-in flex-col font-sketch text-[15px] leading-none text-accent/80 dark:text-accent-dark/80 ${
        end ? 'right-0 items-end' : 'left-0 items-start'
      } ${className}`}
    >
      <CurlyArrow flip={!end} />
      <span className={`-mt-1 whitespace-nowrap ${end ? '-rotate-3' : 'rotate-3'}`}>{children}</span>
    </span>
  )
}

function CurlyArrow({ flip = false }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={flip ? 'ml-3 -scale-x-100' : 'mr-3'}
    >
      <path d="M8 15 C 8 9.5, 6 6, 5 3" />
      <path d="M5 3 L 2.5 5.5 M5 3 L 7.5 5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

// shown in space mode -> click switches to the scrolling (stacked rows) layout
function ScrollIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="5" rx="1.5" />
      <rect x="4" y="13" width="16" height="5" rx="1.5" />
    </svg>
  )
}

// shown in scroll mode -> click switches to the space (3D flight) layout
function OrbitIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-18 12 12)" />
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
