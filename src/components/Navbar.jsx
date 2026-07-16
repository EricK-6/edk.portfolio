import { useEffect, useRef, useState } from 'react'
import { LABELS, MENU_IDS, hrefFor } from '../sitemap.js'
import { useVisited } from '../passport.js'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

export default function Navbar({ theme, onToggleTheme, layout, onToggleLayout, activeId }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)
  // sketch hints fade out once the visitor starts exploring other sections
  const showHints = useVisited().size <= 1

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
      <nav ref={navRef} className="container-page relative flex h-16 items-center justify-between">
        {/* the logo doubles as the flight path's home stop (data-nav-id) */}
        <a href={hrefFor('home', layout)} data-nav-id="home" className="font-bold tracking-tight text-lg">
          Eric Kim<span className="text-accent dark:text-accent-dark">.</span>
          <span className="ml-2 hidden align-middle font-mono text-[9px] font-normal uppercase tracking-[0.3em] text-grey-400 dark:text-grey-600 xl:inline">
            EK·2027
          </span>
        </a>

        <FlightDeckNav layout={layout} activeId={activeId} />
        <FlightPath wrapRef={navRef} activeId={activeId} />

        {/* terminal button intentionally absent: the dock has its own edge
            pull-tab, plus cmd/ctrl+` and the command palette */}
        <div className="flex items-center gap-2 print:hidden">
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

// -- the flight deck ----------------------------------------------------------
// The eight section stops as cockpit radio presets (mono three-letter codes
// with LED state dots) sitting along a dotted flight path that departs from
// the logo (the home stop): the little plane parks under wherever the visitor
// is and glides between stops, and visited stops carry a passport-stamp dot.
const PRESET = {
  about: 'ABT',
  projects: 'PRJ',
  experience: 'EXP',
  skills: 'SKL',
  education: 'EDU',
  certifications: 'CRD',
  leadership: 'LDR',
  contact: 'CNT',
}

const DECK_IDS = MENU_IDS.filter((id) => id !== 'home')

function FlightDeckNav({ layout, activeId }) {
  return (
      <ul className="hidden items-center gap-1.5 lg:flex">
        {DECK_IDS.map((linkId) => {
          const active = activeId === linkId
          return (
            <li key={linkId}>
              <a
                data-nav-id={linkId}
                href={hrefFor(linkId, layout)}
                title={LABELS[linkId]}
                aria-label={LABELS[linkId]}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded border px-1.5 py-1 font-mono text-[11px] tracking-wider transition xl:px-2 ${
                  active
                    ? 'border-accent/60 bg-grey-200/70 text-accent dark:border-accent-dark/60 dark:bg-grey-900 dark:text-accent-dark'
                    : 'border-grey-300 text-grey-500 hover:border-grey-400 hover:text-grey-800 dark:border-grey-800 dark:text-grey-500 dark:hover:border-grey-600 dark:hover:text-grey-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_4px] shadow-emerald-500' : 'bg-grey-400/60 dark:bg-grey-600/60'}`}
                />
                {PRESET[linkId]}
              </a>
            </li>
          )
        })}
      </ul>
  )
}

// The dotted route across the navbar: it departs beside the logo at the
// logo's own height, banks down to the line under the first preset, then runs
// straight to the last one. Stop positions are measured from the DOM (and
// re-measured on resize / after fonts settle). The plane rides the actual
// curve via CSS offset-path where supported (offset-rotate noses it into the
// descent for free); elsewhere it falls back to straight left/top glides.
// Purely decorative.
const HOME_Y = 32 // path start beside the logo: navbar (h-16) vertical centre
const LINE_Y = 53 // the straight stretch under the presets
const SUPPORTS_OFFSET_PATH =
  typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('offset-path', 'path("M0 0 L10 10")')

function FlightPath({ wrapRef, activeId }) {
  const [geo, setGeo] = useState(null)
  const visited = useVisited()

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const wr = wrap.getBoundingClientRect()
      const centers = {}
      let homeX = null
      wrap.querySelectorAll('[data-nav-id]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width <= 0) return // the deck is display:none below lg
        if (el.dataset.navId === 'home') homeX = r.right - wr.left + 14
        else centers[el.dataset.navId] = r.left - wr.left + r.width / 2
      })
      const ids = MENU_IDS.filter((id) => centers[id] != null)
      if (homeX == null || ids.length < 2) { setGeo(null); return }
      const ax = centers[ids[0]] // first preset: where the descent levels off
      const ex = centers[ids[ids.length - 1]]
      const curveD = `M ${homeX} ${HOME_Y} C ${homeX + (ax - homeX) * 0.4} ${HOME_Y}, ${homeX + (ax - homeX) * 0.65} ${LINE_Y}, ${ax} ${LINE_Y}`
      // arc length of the bank, so offset-distance percentages line up with stops
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      probe.setAttribute('d', curveD)
      const curveLen = probe.getTotalLength()
      setGeo({ centers, ids, homeX, ax, d: `${curveD} H ${ex}`, curveLen, totalLen: curveLen + (ex - ax) })
    }
    measure()
    window.addEventListener('resize', measure)
    // the terminal dock squeezes the page without a window resize, so watch
    // the nav element itself too
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    document.fonts?.ready?.then(measure) // Inter loading changes widths
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [wrapRef])

  if (!geo) return null
  const { centers, ids, homeX, ax, d, curveLen, totalLen } = geo
  const known = activeId === 'home' || centers[activeId] != null
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const planeStyle = SUPPORTS_OFFSET_PATH
    ? {
        offsetPath: `path('${d}')`,
        offsetRotate: 'auto',
        offsetDistance: known
          ? `${(((activeId === 'home' ? 0 : curveLen + (centers[activeId] - ax)) / totalLen) * 100).toFixed(3)}%`
          : '0%',
        transition: reduce ? undefined : 'offset-distance 700ms ease-in-out',
      }
    : {
        left: activeId === 'home' ? homeX : centers[activeId] ?? homeX,
        top: activeId === 'home' ? HOME_Y : LINE_Y,
        transform: 'translate(-50%, -50%)',
        transition: reduce ? undefined : 'left 700ms ease-in-out, top 700ms ease-in-out',
      }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={d}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="0.5 7"
          className="stroke-grey-400/80 dark:stroke-grey-700"
        />
        {/* stops: home beside the logo, then one per preset. Stamped once
            visited (passport); the active one is under the plane. */}
        {[['home', homeX, HOME_Y], ...ids.map((id) => [id, centers[id], LINE_Y])].map(([id, cx, cy]) =>
          id === activeId ? null : (
            <circle
              key={id}
              cx={cx}
              cy={cy}
              r="2.5"
              strokeWidth="1"
              className={
                visited.has(id)
                  ? 'fill-accent/70 stroke-none dark:fill-accent-dark/80'
                  : 'fill-white stroke-grey-400 dark:fill-black dark:stroke-grey-600'
              }
            />
          )
        )}
      </svg>
      <span
        className="absolute left-0 top-0 block h-[13px] w-[13px] text-accent dark:text-accent-dark"
        style={{ ...planeStyle, opacity: known ? 1 : 0 }}
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
