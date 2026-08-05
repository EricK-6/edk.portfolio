import { useEffect, useRef, useState } from 'react'
import { goTo } from '../router.js'

const EMAIL = 'dohyunkim290106@gmail.com'
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')

// Cmd/Ctrl+K command palette. Also opens on a custom 'open-command-palette'
// event so the navbar button (and anything else) can trigger it.
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const itemRefs = useRef([])
  const panelRef = useRef(null)

  const close = () => setOpen(false)

  // Closing by any route — a command, Escape, a click on the dim, Cmd+K again —
  // leaves it ready rather than still holding the last search.
  useEffect(() => {
    if (!open) { setQuery(''); setActive(0) }
  }, [open])

  const go = (id) => {
    close()
    goTo(id)
  }
  const openLink = (href) => { close(); window.open(href, '_blank', 'noopener,noreferrer') }
  const downloadCV = (href = './CV_SWE.pdf') => {
    close()
    const a = document.createElement('a')
    a.href = href
    a.download = ''
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked - no-op */ }
  }

  // global open/close shortcut + event hook
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      // bare "/" opens it too - but not while typing in a field
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement
        const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
        if (!typing) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    const onOpenEvent = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpenEvent)
    }
  }, [])

  // While open: focus the input, lock the page behind it, keep Tab inside the
  // dialog, and hand focus back to whatever opened it on the way out. It claims
  // aria-modal, so the keyboard has to actually be modal — Tab used to walk
  // straight out into the tile behind the dim.
  useEffect(() => {
    if (!open) return
    const restoreTo = document.activeElement
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      // Escape from anywhere in the dialog, not only from the input: once you
      // Tab to a row, the input's own handler is no longer the one listening
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
      if (e.key !== 'Tab') return
      const stops = panelRef.current?.querySelectorAll('input, button')
      if (!stops?.length) return
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (!panelRef.current.contains(document.activeElement)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    // Back/forward (or any hash change the palette didn't cause) moves the page
    // underneath it; a menu for a tile you have already left should not survive.
    const onHash = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      restoreTo?.focus?.()
    }
  }, [open])

  const commands = [
    { id: 'about', label: 'About', hint: 'Profile', keywords: 'about profile bio me', icon: <HashIcon />, run: () => go('about') },
    { id: 'projects', label: 'Projects', hint: 'Things I’ve built', keywords: 'projects work portfolio builds', icon: <HashIcon />, run: () => go('projects') },
    { id: 'experience', label: 'Experience', hint: 'Where I’ve worked', keywords: 'experience work jobs roles', icon: <HashIcon />, run: () => go('experience') },
    { id: 'skills', label: 'Skills', hint: 'What I work with', keywords: 'skills tech stack tools', icon: <HashIcon />, run: () => go('skills') },
    { id: 'education', label: 'Education', hint: 'Academic background', keywords: 'education university degree uoa', icon: <HashIcon />, run: () => go('education') },
    { id: 'certifications', label: 'Credentials', hint: 'Certifications', keywords: 'certifications credentials awards', icon: <HashIcon />, run: () => go('certifications') },
    { id: 'leadership', label: 'Leadership', hint: 'Activities', keywords: 'leadership activities clubs volunteering', icon: <HashIcon />, run: () => go('leadership') },
    { id: 'terminal', label: 'Open terminal', hint: 'Ctrl ` ', keywords: 'terminal shell cli console command', icon: <TerminalIcon />, run: () => { close(); window.dispatchEvent(new CustomEvent('open-terminal')) } },
    { id: 'contact', label: 'Contact', hint: 'Let’s talk', keywords: 'contact email message reach', icon: <HashIcon />, run: () => go('contact') },
    { id: 'cv-swe', label: 'Download CV : Software', hint: 'PDF', keywords: 'cv resume pdf download software swe engineering', icon: <DownloadIcon />, run: () => downloadCV('./CV_SWE.pdf') },
    { id: 'cv-eee', label: 'Download CV : Hardware', hint: 'PDF', keywords: 'cv resume pdf download hardware electrical electronics eee', icon: <DownloadIcon />, run: () => downloadCV('./CV_EEE.pdf') },
    { id: 'email', label: 'Copy email', hint: copied ? 'Copied!' : EMAIL, keywords: 'email contact mail copy', icon: <MailIcon />, run: copyEmail },
    { id: 'github', label: 'GitHub', hint: 'EricK-6', keywords: 'github code repos source', icon: <GitHubIcon />, run: () => openLink('https://github.com/EricK-6') },
    { id: 'linkedin', label: 'LinkedIn', hint: 'erick06', keywords: 'linkedin profile network', icon: <LinkedInIcon />, run: () => openLink('https://www.linkedin.com/in/erick06/') },
  ]

  const q = query.trim().toLowerCase()
  const filtered = q
    ? commands.filter((c) => (c.label + ' ' + c.keywords).toLowerCase().includes(q))
    : commands
  const activeIdx = Math.min(active, Math.max(0, filtered.length - 1))

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[activeIdx]?.run() }
    else if (e.key === 'Escape') { e.preventDefault(); close() }
  }

  // keep the highlighted row scrolled into view
  useEffect(() => {
    itemRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh] animate-fade-in"
      onMouseDown={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-grey-300 bg-grey-100 shadow-xl dark:border-grey-800 dark:bg-grey-900"
      >
        <div className="flex items-center gap-3 border-b border-grey-200 px-4 dark:border-grey-800">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onInputKey}
            placeholder="Jump to a section, download CV, copy email…"
            className="h-12 w-full bg-transparent text-sm text-grey-900 placeholder:text-grey-400 focus:outline-none dark:text-grey-100 dark:placeholder:text-grey-500"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-grey-300 px-1.5 py-0.5 font-mono text-[10px] text-grey-500 dark:border-grey-700 dark:text-grey-400">
            esc
          </kbd>
        </div>

        <ul className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-grey-500 dark:text-grey-500">No matches.</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={c.run}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === activeIdx ? 'bg-grey-200 dark:bg-grey-800' : ''
                }`}
              >
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-grey-200 text-grey-500 dark:border-grey-700 dark:text-grey-400">
                  {c.icon}
                </span>
                <span className="flex-1 text-sm font-medium text-grey-900 dark:text-grey-100">{c.label}</span>
                <span className="font-mono text-xs text-grey-400 dark:text-grey-500 truncate max-w-[45%] text-right">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-grey-200 px-4 py-2 text-[11px] text-grey-500 dark:border-grey-800 dark:text-grey-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span className="flex items-center gap-1"><Kbd>↵</Kbd> select</span>
          </div>
          <span className="flex items-center gap-1"><Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>K</Kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex min-w-[18px] items-center justify-center rounded border border-grey-300 px-1 py-0.5 font-mono text-[10px] leading-none text-grey-500 dark:border-grey-700 dark:text-grey-400">
      {children}
    </kbd>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-grey-400">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}
function TerminalIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}
function HashIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
    </svg>
  )
}
function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.32V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
