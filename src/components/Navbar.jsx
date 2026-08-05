import { useEffect, useState } from 'react'
import { LABELS, MENU_IDS, hrefFor } from '../sitemap.js'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

// The bar is the contents page of a printed journal: a masthead, then the
// sections listed in reading order and numbered, with a rule under the one
// you are on.
//
// Everything before this was aviation (a route line with a plane, then a
// boarding pass) and it was decoration bolted onto navigation. This site is a
// photograph, glass, and one section per page, so the nav is set as type
// instead: numbers you can scan, names you can read, and no metaphor to
// explain. The numbers are the payload — they say both where you are and how
// much is left, which three-letter codes never did.
export default function Navbar({ activeId }) {
  const [open, setOpen] = useState(false)

  return (
    // Always frosted: tiles are clipped and the document never scrolls, so a
    // scroll-triggered background would never fire and the bar would sit on
    // bare photograph.
    <header className="screen-only sticky top-0 z-40 border-b border-white/45 bg-white/55 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 sm:px-8">
        <div className="flex flex-none items-baseline">
          <a
            href={hrefFor('home')}
            className="tap-44 font-display text-lg font-semibold tracking-tight"
          >
            Eric Kim<span className="text-accent">.</span>
          </a>
        </div>

        <ContentsIndex activeId={activeId} />

        <div className="flex flex-none items-center gap-2.5 print:hidden">
          <LocalTime />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            aria-label="Open command menu"
            className="tap-44 hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-white/70 bg-white/50 px-2.5 text-xs text-grey-600 hover:bg-white hover:text-grey-900"
          >
            <SearchIcon />
            <span className="font-mono">{isMac ? '⌘' : 'Ctrl'} K</span>
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="tap-44 xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/50 text-grey-700"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="xl:hidden border-t border-white/50 bg-white/70 backdrop-blur-xl">
          <ul className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-6 py-3 sm:px-8">
            {MENU_IDS.map((linkId, i) => (
              <li key={linkId}>
                <a
                  href={hrefFor(linkId)}
                  onClick={() => setOpen(false)}
                  aria-current={activeId === linkId ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white ${
                    activeId === linkId ? 'text-accent' : 'text-grey-700'
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums text-grey-500">
                    {String(i).padStart(2, '0')}
                  </span>
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

// Home is the cover, so it is not numbered; the eight sections run 01 to 08.
const SECTION_IDS = MENU_IDS.filter((id) => id !== 'home')

function ContentsIndex({ activeId }) {
  return (
    <ul className="hidden items-baseline gap-4 xl:flex">
      {SECTION_IDS.map((linkId, i) => {
        const active = activeId === linkId
        return (
          <li key={linkId}>
            <a
              href={hrefFor(linkId)}
              aria-current={active ? 'page' : undefined}
              className="group relative flex items-baseline gap-1.5 py-1"
            >
              <span
                aria-hidden="true"
                className={`font-mono text-[10px] tabular-nums transition-colors ${
                  active ? 'text-accent-deep' : 'text-grey-600 group-hover:text-grey-800'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`text-[13px] transition-colors ${
                  active ? 'font-medium text-grey-900' : 'text-grey-700 group-hover:text-grey-900'
                }`}
              >
                {LABELS[linkId]}
              </span>
              {/* the rule marks the entry you are reading; on the others it
                  grows in from the left on hover */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-out ${
                  active ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
                }`}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// Where he actually is, in his own time. Not a departure board: just the
// human detail that this is a person in Auckland, which also keeps the
// masthead from being purely decorative.
function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  let time = null
  try {
    time = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)
  } catch { /* no ICU data: the readout is simply omitted */ }
  if (!time) return null

  return (
    <span className="hidden font-mono text-[10px] tabular-nums tracking-wider text-grey-600 2xl:inline">
      Auckland {time}
    </span>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
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
