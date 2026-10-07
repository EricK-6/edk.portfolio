import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { goTo } from '../router'
import { track } from '../analytics'
import { candidates, execute, suggestions, type Ctx } from '../shell/commands'
import { pathLabel } from '../shell/fs'
import { dim, L, type Line, type Seg } from '../shell/lines'

// The terminal drawer: the page, browsable as a filesystem.
//
// What it runs lives in src/shell (a filesystem generated from content.ts,
// the commands, the replays); this file is the drawer, the prompt and the
// keyboard. Output is data, not markup, so every name the shell prints is a
// button — a visitor who has never used a terminal can click their way
// around it, and the row of suggestions under the prompt follows where they
// are.

const BOOT_LINES = [
  '[ 0.000000 ] erickk.cloud bootloader v2.0',
  '[ 0.000412 ] cpu: Computer Systems Engineering @ UoA',
  '[ 0.001033 ] mem: portfolio modules ................. ok',
  '[ 0.002566 ] net: erickk.cloud ....................... up',
  '[ 0.003733 ] starting shell ...................... ok',
].map((s) => L(s))

const SHELL_BANNER: Line[] = [
  [],
  L('erickk.cloud: interactive shell'),
  L(dim("type 'help', press a suggestion below, or just ask a question.")),
  [],
]

const HISTORY_KEY = 'terminal-history'

const promptLine = (path: string, input: string): Line => [
  { text: 'visitor@erickk.cloud' },
  { text: ':', tone: 'dim' },
  { text: path, tone: 'strong' },
  { text: '$ ', tone: 'dim' },
  { text: input },
]

// the longest start every candidate shares, which is what Tab can safely fill
const commonPrefix = (list: string[]) =>
  list.reduce((a, b) => { let i = 0; while (i < a.length && i < b.length && a[i].toLowerCase() === b[i].toLowerCase()) i++; return a.slice(0, i) })

export default function TerminalDock() {
  // The dock owns whether it is open; it overlays the page rather than
  // pushing it aside, so nothing outside needs to know.
  const [open, setOpen] = useState(false)

  // The handwritten "For Devs" nudge is for someone who has never found this;
  // it fades once the dock has actually been opened.
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem('terminal-seen') === '1' } catch { return false }
  })
  useEffect(() => {
    if (!open || seen) return
    setSeen(true)
    try { localStorage.setItem('terminal-seen', '1') } catch { /* private mode */ }
  }, [open, seen])
  useEffect(() => { if (open) track('terminal-open') }, [open])

  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState<string[]>([])
  const cwdRef = useRef<string[]>([])
  // history survives a reload: a per-visitor convenience, nothing more
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
  })
  const [hIdx, setHIdx] = useState(-1)
  const lastKey = useRef('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null) // everything inside the drawer
  const tabRef = useRef<HTMLButtonElement>(null) // the pull-tab, always reachable
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const print = (...more: Line[]) => setLines((prev) => [...prev, ...more])
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }

  // The boot trace prints itself the first time the dock is opened, a line at
  // a time: a kernel log that has clearly just run is the whole charm of it.
  // Once per mount, and instant under reduced motion.
  const booted = useRef(false)
  useEffect(() => {
    if (!open || booted.current) return
    booted.current = true
    const all = [...BOOT_LINES, ...SHELL_BANNER]
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setLines(all); return }
    all.forEach((line, i) => {
      const at = i < BOOT_LINES.length ? i * 105 : BOOT_LINES.length * 105 + (i - BOOT_LINES.length) * 45
      timers.current.push(setTimeout(() => setLines((prev) => [...prev, line]), 140 + at))
    })
  }, [open])

  // toggle with Ctrl/Cmd + backtick, or the 'open-terminal' event (menu, palette)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '`') { e.preventDefault(); setOpen((o) => !o) }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-terminal', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-terminal', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

  // A shut drawer is parked off-screen, not gone: `inert` takes the whole panel
  // out of the tab order and the accessibility tree while it is shut, and the
  // pull-tab beside it stays operable.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    panel.inert = !open
    if (!open && panel.contains(document.activeElement)) tabRef.current?.focus()
  }, [open])

  // keep the newest line in view
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  const ctx = (): Ctx => ({
    cwd: cwdRef.current,
    setCwd: (segs) => { cwdRef.current = segs; setCwd(segs) },
    print,
    clear: () => setLines([]),
    close: () => setOpen(false),
    history,
    goTo: (anchor) => goTo(anchor),
    openProject: (slug, what) => window.dispatchEvent(new CustomEvent('project-request', { detail: { slug, what } })),
    openUrl: (href) => {
      if (href.startsWith('mailto:')) window.location.href = href
      else window.open(href, '_blank', 'noopener,noreferrer')
    },
    download: (href) => {
      const a = document.createElement('a')
      a.href = href
      a.download = ''
      document.body.appendChild(a)
      a.click()
      a.remove()
    },
    later,
    small: window.matchMedia?.('(max-width: 639px)').matches ?? false,
  })

  const runLine = (raw: string) => {
    const line = raw.trim()
    print(promptLine(pathLabel(cwdRef.current), line))
    setInput('')
    setHIdx(-1)
    if (!line) return
    const { out, event } = execute(line, ctx())
    print(...out)
    if (event) track(`terminal-cmd-${event}`)
    if (!line.startsWith('!')) {
      setHistory((h) => {
        const next = [...(h.at(-1) === line ? h.slice(0, -1) : h), line].slice(-100)
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { /* private mode */ }
        return next
      })
    }
  }

  // pressing a name or a suggestion runs it exactly as if it had been typed
  const press = (command: string) => {
    runLine(command)
    inputRef.current?.focus({ preventScroll: true })
  }

  const options = input ? candidates(input, cwd) : []
  const word = input.split(/\s+/).at(-1) ?? ''
  const ghost = options[0]?.startsWith(word) ? options[0].slice(word.length) : ''
  const replaceWord = (w: string) => setInput(input.slice(0, input.length - word.length) + w)

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const prevKey = lastKey.current
    lastKey.current = e.key
    const ctrl = e.ctrlKey && !e.metaKey
    if (ctrl && e.key.toLowerCase() === 'l') { e.preventDefault(); setLines([]); return }
    if (ctrl && e.key.toLowerCase() === 'u') { e.preventDefault(); setInput(''); return }
    // ^C abandons the line, unless there's a selection to copy
    if (ctrl && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      e.preventDefault()
      print([...promptLine(pathLabel(cwd), input), { text: '^C', tone: 'dim' }])
      setInput('')
      return
    }
    if (e.key === 'Enter') { runLine(input); return }
    if (e.key === 'Tab') {
      // Tab fills what every option shares; a second Tab lists them, the way
      // bash does. With nothing to complete it is left alone, so it still
      // moves focus on to the suggestions.
      if (!options.length) return
      e.preventDefault()
      if (options.length === 1) { replaceWord(options[0] + (options[0].endsWith('/') ? '' : ' ')); return }
      const shared = commonPrefix(options)
      if (shared.length > word.length) { replaceWord(shared); return }
      if (prevKey === 'Tab') {
        print(promptLine(pathLabel(cwd), input), L(...options.slice(0, 40).flatMap((o, i) => [...(i ? [{ text: '  ' }] : []), { text: o, tone: 'dim' as const }])))
      }
      return
    }
    if (e.key === 'ArrowRight') {
      const target = e.target as HTMLInputElement
      if (ghost && target.selectionStart === input.length && target.selectionStart === target.selectionEnd) {
        e.preventDefault()
        setInput(input + ghost)
      }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const idx = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1)
      setHIdx(idx)
      setInput(history[idx])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx === -1) return
      const idx = hIdx + 1
      if (idx >= history.length) { setHIdx(-1); setInput('') } else { setHIdx(idx); setInput(history[idx]) }
    }
  }

  return (
    <>
      {/* dims the page behind the dock on small screens only */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity sm:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <aside
        aria-label="Interactive terminal"
        className={`fixed inset-y-0 left-0 z-50 w-[min(92vw,400px)] transform transition-transform duration-300 ease-out print:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full border-r border-grey-300 bg-grey-100 shadow-xl">
          <div ref={panelRef} className="flex h-full flex-col">
            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-grey-300 bg-grey-200/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-grey-300" />
              <span className="h-3 w-3 rounded-full bg-grey-400" />
              <span className="h-3 w-3 rounded-full bg-grey-500" />
              <span className="ml-2 flex-1 truncate font-mono text-xs text-grey-500">visitor@erickk.cloud: {pathLabel(cwd)}</span>
              {/* -my-2 keeps the title bar close to its own height while the
                  hit area grows to a fingertip */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close terminal"
                className="tap-44 -my-2 -mr-1.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-grey-500 hover:text-grey-800"
              >
                <CloseIcon />
              </button>
            </div>

            {/* output + prompt. `terminal-log` is the touch hook: on a coarse
                pointer index.css takes it to 16px so the prompt does not trip
                iOS's focus zoom. */}
            <div
              ref={bodyRef}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a')) inputRef.current?.focus() }}
              className="terminal-log flex-1 overflow-y-auto overscroll-contain p-4 font-mono text-[13px] leading-relaxed text-grey-700"
            >
              {/* role=log: output is announced to a screen reader as it
                  arrives, which is the whole point of typing a command */}
              <div role="log" aria-label="Terminal output">
                {lines.map((line, i) => <OutLine key={i} line={line} onRun={press} />)}
              </div>

              <div className="flex items-center">
                <OutLine line={promptLine(pathLabel(cwd), '').slice(0, 4)} onRun={press} inline />
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); lastKey.current = '' }}
                    onKeyDown={onKeyDown}
                    aria-label="Terminal input"
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck="false"
                    className="relative z-10 w-full border-0 bg-transparent p-0 text-grey-900 caret-grey-700 outline-none"
                  />
                  {/* ghost suffix, aligned under the input via an invisible copy
                      of what's typed (monospace, so the widths match exactly) */}
                  {ghost && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center whitespace-pre">
                      <span className="invisible">{input}</span>
                      <span className="text-grey-400">{ghost}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* next steps, for anyone who would rather press than type */}
              <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Suggested commands">
                {suggestions(cwd).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => press(s)}
                    className="rounded-md border border-grey-300 bg-white px-2 py-0.5 text-[11px] text-grey-600 transition-colors hover:border-accent/40 hover:text-accent-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* pull-tab handle - rides the right edge of the panel near the top */}
          <button
            ref={tabRef}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Collapse terminal' : 'Open terminal'}
            aria-expanded={open}
            // Hidden below lg, where it has nowhere safe to sit: it rides the
            // left edge, and on a phone it landed on the section kickers
            // ("SKILLS" rendered as "KILLS"). The menu carries it there instead.
            className="absolute left-full top-20 hidden flex-col items-center gap-2 rounded-r-lg border border-l-0 border-grey-300 bg-grey-100 px-1.5 py-3 text-grey-500 shadow-lg hover:text-grey-800 lg:flex"
          >
            <PromptGlyph />
            <span className="font-mono text-[11px] tracking-wider [writing-mode:vertical-rl] rotate-180">
              terminal
            </span>
          </button>
          {/* lg and up only: the hint is written in the margin beside the
              page, and a phone has no margin */}
          {!open && !seen && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-full top-32 ml-10 hidden items-center gap-1.5 font-sketch text-[15px] leading-none text-accent/80 lg:flex"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="-rotate-90">
                <path d="M8 15 C 8 9.5, 6 6, 5 3" />
                <path d="M5 3 L 2.5 5.5 M5 3 L 7.5 5" />
              </svg>
              <span className="rotate-2 whitespace-nowrap">For Devs</span>
            </span>
          )}
        </div>
      </aside>
    </>
  )
}

const TONES: Record<NonNullable<Seg['tone']>, string> = {
  dim: 'text-grey-500',
  strong: 'font-semibold text-grey-900',
  accent: 'text-accent-deep',
  ok: 'text-emerald-700',
  warn: 'text-award',
}

function SegView({ seg, onRun }: { seg: Seg; onRun: (command: string) => void }) {
  const cls = seg.tone ? TONES[seg.tone] : ''
  if (seg.run) {
    const command = seg.run
    return (
      <button
        type="button"
        onClick={() => onRun(command)}
        title={command}
        className={`${cls} inline text-left underline decoration-grey-300 underline-offset-2 transition-colors hover:text-accent-deep hover:decoration-accent`}
      >
        {seg.text}
      </button>
    )
  }
  if (seg.href) {
    return (
      <a
        href={seg.href}
        target={seg.href.startsWith('mailto:') || seg.download ? undefined : '_blank'}
        rel="noreferrer"
        download={seg.download ? '' : undefined}
        className={`${cls} underline decoration-grey-300 underline-offset-2 hover:text-accent-deep hover:decoration-accent`}
      >
        {seg.text}
      </a>
    )
  }
  return <span className={cls} style={seg.color ? { color: seg.color } : undefined}>{seg.text}</span>
}

function OutLine({ line, onRun, inline = false }: { line: Line; onRun: (command: string) => void; inline?: boolean }) {
  const segs = (list: Seg[]) => list.map((s, i) => <SegView key={i} seg={s} onRun={onRun} />)
  if (inline) return <span className="flex-none whitespace-pre">{segs(line)}</span>
  if (!line.length) return <div aria-hidden="true">&nbsp;</div>
  const [first, ...rest] = line
  if (first.gutter) {
    return (
      <div className="flex">
        {/* capped, so a gutter that is too long can never squeeze the text
            beside it down to a column of single letters */}
        <span className="max-w-[45%] flex-none overflow-hidden text-ellipsis whitespace-pre"><SegView seg={first} onRun={onRun} /></span>
        <span className="min-w-0 whitespace-pre-wrap break-words">{segs(rest)}</span>
      </div>
    )
  }
  return <div className="whitespace-pre-wrap break-words">{segs(line)}</div>
}

function PromptGlyph() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
