import { useEffect, useRef, useState } from 'react'
import { LABELS, MENU_IDS, SECTION_IDS, SPY_IDS, anchorOf, hrefFor } from '../sitemap'
import { useActiveSection } from '../router'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

// The bar is the contents page of a printed journal: a masthead, then the
// sections listed in reading order and numbered, with a rule under the one
// you are reading.
//
// Two things changed with the move to a scrolling document. The links are
// plain anchors now — no router, no click handler, just `href="#about"` and
// the CSS `scroll-behavior`/`scroll-padding-top` in index.css — and the
// active entry is derived from scroll position rather than from a route, so
// it tracks continuously as you read instead of only changing on a jump.
//
// The bar is also transparent until you leave the intro. It used to be frosted
// at all times, because the document never scrolled and a scroll-triggered
// background would never have fired. Over the photograph a permanent white
// bar was a lid on the picture; now it only appears once there is text
// underneath it that needs separating.
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Spied over the whole document, intro included, but only the eight
  // sections are drawn. While the reader is still on the photograph the
  // answer is 'top', which matches no entry — so nothing is underlined until
  // there is genuinely a section to be in. Spying on the eight alone lit up
  // 'About' before the reader had left the intro.
  const active = useActiveSection(SPY_IDS)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      setScrolled(window.scrollY > 24)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    window.addEventListener('scroll', schedule, { passive: true })
    measure()
    return () => {
      window.removeEventListener('scroll', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // An open menu that scrolls away with the page is a menu you can't close.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  const lit = scrolled || open

  return (
    <header
      // Fixed rather than sticky: a sticky header sits *in* the flow and
      // takes its 4rem out of the top of the page, which meant the intro's
      // photograph started underneath it instead of behind it. Nothing below
      // needs the space back — the intro is a full viewport tall and every
      // other section clears it with `scroll-padding-top`.
      className={`screen-only fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        lit
          ? 'border-grey-200 bg-page/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6 sm:px-8">
        <a
          href={hrefFor('home')}
          className="tap-44 flex-none font-display text-lg font-semibold tracking-tight text-grey-900"
        >
          Eric Kim<span className="text-accent">.</span>
        </a>

        <ContentsIndex active={active} />

        <div className="flex flex-none items-center gap-2.5">
          <LocalTime />
          <ResumeMenu />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            aria-label="Open command menu"
            className="tap-44 hidden h-9 items-center gap-2 rounded-lg border border-grey-200 bg-white/70 px-2.5 text-xs text-grey-600 transition hover:border-grey-300 hover:text-grey-900 sm:inline-flex"
          >
            <SearchIcon />
            <span className="font-mono">{isMac ? '⌘' : 'Ctrl'} K</span>
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="tap-44 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-grey-200 bg-white/70 text-grey-700 transition hover:border-grey-300 xl:hidden"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-grey-200 bg-page/95 backdrop-blur-xl xl:hidden">
          <ul className="mx-auto flex w-full max-w-6xl flex-col gap-0.5 px-6 py-3 sm:px-8">
            {MENU_IDS.map((id, i) => (
              <li key={id}>
                <a
                  href={hrefFor(id)}
                  onClick={() => setOpen(false)}
                  aria-current={active === anchorOf(id) ? 'true' : undefined}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-grey-100 ${
                    active === anchorOf(id) ? 'text-accent-deep' : 'text-grey-700'
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums text-grey-400">
                    {String(i).padStart(2, '0')}
                  </span>
                  {LABELS[id]}
                </a>
              </li>
            ))}
            {/* The terminal's pull-tab is hidden below lg (it collided with
                the section kickers), so the menu is how a phone reaches it. */}
            <li>
              <button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('open-terminal')) }}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-grey-700 transition hover:bg-grey-100"
              >
                <span className="font-mono text-[10px] text-grey-400">{'>_'}</span>
                Terminal
              </button>
            </li>

            {/* The résumé control is hidden in the bar at this width, so the
                menu carries it. It is the highest-intent click on the site;
                it does not get to be the one thing a phone cannot reach. */}
            <li className="mt-2 flex items-center gap-2 border-t border-grey-200 px-3 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-grey-500">
                Résumé
              </span>
              <CvLink href="./CV_SWE.pdf" kind="Software" onClick={() => setOpen(false)} />
              <CvLink href="./CV_EEE.pdf" kind="Hardware" onClick={() => setOpen(false)} />
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

// The résumé, as one labelled control with two exact halves.
//
// It used to sit in the intro. Moving it here makes it reachable from anywhere
// on a 7,600px document rather than only from the top of it — on a page this
// long, a recruiter who has just finished reading Projects should not have to
// scroll back to the photograph to get the PDF.
//
// A menu rather than two bare links because the bar has no room for both, and
// because "Software or Hardware" is one decision with two answers, not two
// competing buttons. Minimal in chrome, never in target.
function ResumeMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); wrap.current?.querySelector('button')?.focus() } }
    // a menu that scrolls away from its button is a menu you cannot close
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  return (
    <div ref={wrap} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`tap-44 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
          open
            ? 'border-accent/40 bg-accent/10 text-accent-deep'
            : 'border-grey-200 bg-white/70 text-grey-700 hover:border-grey-300 hover:text-grey-900'
        }`}
      >
        Résumé
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-grey-200 bg-white p-1 shadow-lg shadow-black/5"
          role="menu"
        >
          {[['Software', './CV_SWE.pdf'], ['Hardware', './CV_EEE.pdf']].map(([kind, href]) => (
            <a
              key={kind}
              href={href}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              aria-label={`${kind} résumé — PDF, opens in a new tab`}
              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-grey-800 transition hover:bg-grey-100 hover:text-accent-deep"
            >
              {kind}
              <OpenIcon />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// The mobile menu's flavour: a real pill, because it sits in a list of plain
// text links and would otherwise read as one more row.
function CvLink({ href, kind, onClick }: { href: string; kind: string; onClick: () => void }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      aria-label={`${kind} résumé — PDF, opens in a new tab`}
      className="tap-44 group inline-flex items-center gap-1.5 rounded-lg border border-grey-200 bg-white px-3 py-1.5 text-sm font-medium text-grey-800 transition hover:border-accent/40 hover:text-accent-deep"
    >
      {kind}
      <OpenIcon />
    </a>
  )
}

function OpenIcon() {
  return (
    <svg
      aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="opacity-55 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
    >
      <path d="M7 17 17 7" /><path d="M9 7h8v8" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

// Home is the cover, so it is not numbered; the eight sections run 01 to 08.
// The numbers are the payload — they say both where you are and how much is
// left, which is worth more in a long document than it ever was when each
// section was its own screen.
function ContentsIndex({ active }: { active: string }) {
  return (
    <ul className="hidden items-baseline gap-4 xl:flex">
      {SECTION_IDS.map((id, i) => {
        const on = active === id
        return (
          <li key={id}>
            <a
              href={hrefFor(id)}
              aria-current={on ? 'true' : undefined}
              className="group relative flex items-baseline gap-1.5 py-1"
            >
              <span
                aria-hidden="true"
                className={`font-mono text-[10px] tabular-nums transition-colors ${
                  on ? 'text-accent-deep' : 'text-grey-400 group-hover:text-grey-600'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`text-[13px] transition-colors ${
                  on ? 'font-medium text-grey-900' : 'text-grey-600 group-hover:text-grey-900'
                }`}
              >
                {LABELS[id]}
              </span>
              {/* the rule marks the entry you are reading; on the others it
                  grows in from the left on hover */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-out ${
                  on ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
                }`}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// Where he actually is, in his own time. Not a departure board: just the human
// detail that this is a person in Auckland.
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
    <span className="hidden font-mono text-[10px] tabular-nums tracking-wider text-grey-400 2xl:inline">
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
    </svg>
  )
}
