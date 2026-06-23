import { useEffect, useRef, useState } from 'react'
import { goTo } from '../router.js'
import { useLayout } from '../layout.js'

const EMAIL = 'dohyunkim290106@gmail.com'

const PROJECTS = [
  ['winnie-the-bot', 'AI interactive robot · dual ATmega328P · 3rd place ECSE'],
  ['sentiment-pulse', 'Serverless AWS sentiment pipeline + React dashboard'],
  ['smart-energy-monitor', 'ATmega firmware · Altium PCB · LTspice'],
  ['flappy-universe', 'VHDL game on an Altera FPGA · VGA + PS/2'],
  ['roastworks-analytics', 'PyQt6 + pandas forecasting desktop app'],
  ['mealhub', 'Android meal planner · Java + Firebase'],
  ['keb-playground', 'React 19 club website'],
]

const SKILLS = 'Python  Java  C  JavaScript  R  VHDL  React.js  Pandas  Scikit-Learn  AWS  MATLAB  Altium'

const file = (...content) => ({ type: 'file', content })
const dir = (id, children = {}) => ({ type: 'dir', id, children })

// the page modelled as a filesystem: each section is a directory (cd scrolls
// the page to it), rich sections also hold readable files (cat).
const FS = dir('top', {
  about: dir('about', {
    'about.txt': file(
      'Dohyun (Eric) Kim - penultimate-year Computer Systems Engineering (Hons) @ UoA.',
      'Into embedded systems, low-level software, and cloud. Open to internships.'
    ),
  }),
  projects: dir('projects', PROJECTS.reduce((acc, [name, desc]) => {
    acc[name] = file(desc)
    return acc
  }, {})),
  experience: dir('experience'),
  skills: dir('skills', { 'skills.txt': file(SKILLS) }),
  education: dir('education'),
  certifications: dir('certifications'),
  leadership: dir('leadership'),
  contact: dir('contact', {
    email: file(
      <a href={`mailto:${EMAIL}`} className="text-blue-600 underline dark:text-grey-200">{EMAIL}</a>
    ),
    github: file(
      <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="text-blue-600 underline dark:text-grey-200">github.com/EricK-6</a>
    ),
    linkedin: file(
      <a href="https://www.linkedin.com/in/erick06/" target="_blank" rel="noreferrer" className="text-blue-600 underline dark:text-grey-200">linkedin.com/in/erick06</a>
    ),
    'cv-swe.pdf': { type: 'file', download: './CV.pdf', content: ['↓ downloading software CV…'] },
    'cv-eee.pdf': { type: 'file', download: './CV_EEE.pdf', content: ['↓ downloading hardware CV…'] },
  }),
})

const HELP = [
  ['pwd', 'print current location'],
  ['ls [dir]', 'list sections / files'],
  ['cd <dir>', 'go to a section (cd .. , cd ~)'],
  ['cat <file>', 'read a file'],
  ['whoami', 'who is this'],
  ['cv <swe|eee>', 'download my CV (software / hardware)'],
  ['theme', 'toggle light / dark'],
  ['clear', 'clear the screen'],
]

// walk the tree to the node at `segs`, or null if any segment is missing
function getNode(segs) {
  let node = FS
  for (const s of segs) {
    node = node.children?.[s]
    if (!node) return null
  }
  return node
}

// resolve a cd/ls/cat argument (relative, absolute, ~, .., .) to a path array
function resolveSegments(cwd, arg) {
  if (!arg || arg === '~' || arg === '/') return []
  const fromRoot = arg.startsWith('/') || arg.startsWith('~')
  let segs = fromRoot ? [] : [...cwd]
  for (const part of arg.replace(/^~/, '').split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') segs = segs.slice(0, -1)
    else segs = [...segs, part]
  }
  return segs
}

const pathLabel = (segs) => (segs.length ? `~/${segs.join('/')}` : '~')

// commands offered for inline completion (sorted so the suggestion is stable)
const COMMANDS = ['cat', 'cd', 'clear', 'cv', 'date', 'echo', 'help', 'ls', 'pwd', 'social', 'theme', 'whoami']

// fish-style inline suggestion: given the half-typed line, return the *suffix*
// that would complete the current word — a command name (first word) or a
// cd/ls/cat path argument — or '' when there's nothing to suggest. Pure, so it's
// re-derived on every keystroke during render.
function completionFor(input, cwd) {
  if (!input || input.endsWith(' ')) return ''
  const parts = input.split(/\s+/)

  // first word -> complete the command name
  if (parts.length === 1) {
    const tok = parts[0]
    const m = COMMANDS.find((c) => c !== tok && c.startsWith(tok))
    return m ? m.slice(tok.length) : ''
  }

  // later words -> complete a path argument for the path-aware commands
  const cmd = parts[0].toLowerCase()
  if (cmd !== 'cd' && cmd !== 'ls' && cmd !== 'cat') return ''
  const token = parts[parts.length - 1]
  const slash = token.lastIndexOf('/')
  const prefix = slash === -1 ? token : token.slice(slash + 1)
  if (!prefix) return ''
  const baseSegs = slash === -1 ? cwd : resolveSegments(cwd, token.slice(0, slash))
  const node = getNode(baseSegs)
  if (!node || node.type !== 'dir') return ''

  let names = Object.keys(node.children || {})
  if (cmd === 'cd') names = names.filter((n) => node.children[n].type === 'dir')
  else if (cmd === 'cat') names = names.filter((n) => node.children[n].type === 'file')
  const m = names.find((n) => n !== prefix && n.startsWith(prefix))
  return m ? m.slice(prefix.length) : ''
}

function Prompt({ path = '~' }) {
  return (
    <>
      <span className="text-blue-600 dark:text-grey-100">visitor@erickk.cloud</span>
      <span className="text-blue-300 dark:text-grey-600">:</span>
      <span className="text-blue-900 dark:text-white">{path}</span>
      <span className="text-blue-300 dark:text-grey-600">$ </span>
    </>
  )
}

export default function TerminalDock({ open, setOpen, theme, onToggleTheme }) {
  const [lines, setLines] = useState(() => [
    'erickk.cloud - interactive shell',
    "run 'ls' to look around, or 'help' for commands.",
    '',
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [hIdx, setHIdx] = useState(-1)
  const [cwd, setCwd] = useState([])
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const layout = useLayout()

  const print = (...nodes) => setLines((prev) => [...prev, ...nodes])

  // toggle via Ctrl/Cmd + backtick, plus an 'open-terminal' event (navbar / palette)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-terminal', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-terminal', onOpen)
    }
  }, [])

  // focus the prompt when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60)
  }, [open])

  // keep the log pinned to the newest line
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  // 'cd <section>' navigates to that section (a page in box mode, a scroll in
  // scroll mode); 'top' / 'cd ~' is home
  const go = (id) => goTo(id === 'top' ? 'home' : id, layout)
  const downloadCV = (href = './CV.pdf') => {
    const a = document.createElement('a')
    a.href = href
    a.download = ''
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const err = (c, msg) => print(<span><span className="font-semibold text-blue-900 dark:text-white">{c}:</span> {msg}</span>)

  const run = (raw) => {
    const trimmed = raw.trim()
    print(<span><Prompt path={pathLabel(cwd)} />{trimmed}</span>)
    if (trimmed) setHistory((h) => [...h, trimmed])
    setHIdx(-1)

    const [cmd, ...args] = trimmed.split(/\s+/)
    switch (cmd.toLowerCase()) {
      case '':
        break
      case 'help':
        print('available commands:')
        HELP.forEach(([c, d]) =>
          print(
            <span className="grid grid-cols-[7rem_1fr] gap-x-2">
              <span className="text-blue-800 dark:text-grey-200">{c}</span>
              <span className="text-blue-400 dark:text-grey-500">{d}</span>
            </span>
          )
        )
        print(<span className="mt-1 block text-blue-400 dark:text-grey-500">tip: try `ls`, then `cd projects`, then `cat winnie-the-bot`.</span>)
        break
      case 'pwd':
        print(pathLabel(cwd))
        break
      case 'ls': {
        const segs = resolveSegments(cwd, args[0])
        const node = getNode(segs)
        if (!node) { err('ls', `no such file or directory: ${args[0]}`); break }
        if (node.type === 'file') { print(args[0]); break }
        const names = Object.keys(node.children || {})
        if (!names.length) { print(<span className="text-blue-300 dark:text-grey-600">(no files - cd here to view it on the page)</span>); break }
        print(
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {names.map((n) => (
              <span key={n} className={node.children[n].type === 'dir' ? 'text-blue-800 dark:text-white' : 'text-blue-500 dark:text-grey-400'}>
                {n}{node.children[n].type === 'dir' ? '/' : ''}
              </span>
            ))}
          </span>
        )
        break
      }
      case 'cd': {
        const segs = resolveSegments(cwd, args[0])
        const node = getNode(segs)
        if (!node) { err('cd', `no such directory: ${args[0]}`); break }
        if (node.type !== 'dir') { err('cd', `not a directory: ${args[0]}`); break }
        setCwd(segs)
        go(node.id || 'top')
        break
      }
      case 'cat': {
        if (!args[0]) { print('usage: cat <file>'); break }
        const segs = resolveSegments(cwd, args[0])
        const node = getNode(segs)
        if (!node) { err('cat', `${args[0]}: no such file`); break }
        if (node.type === 'dir') { err('cat', `${args[0]}: is a directory`); break }
        if (node.download) downloadCV(node.download)
        node.content.forEach((line) => print(line))
        break
      }
      case 'whoami':
        print("visitor - a curious one. The person you're here for is Dohyun (Eric) Kim.")
        break
      case 'cv':
      case 'resume': {
        const which = (args[0] || '').toLowerCase()
        if (which === 'swe' || which === 'software') { print('↓ downloading software CV…'); downloadCV('./CV.pdf') }
        else if (which === 'eee' || which === 'hardware' || which === 'electrical') { print('↓ downloading hardware CV…'); downloadCV('./CV_EEE.pdf') }
        else print('usage: cv <swe | eee>  — software or hardware/electronics CV')
        break
      }
      case 'social':
      case 'links':
        print(
          <span>
            github:&nbsp;
            <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="text-blue-600 underline dark:text-grey-200">github.com/EricK-6</a>
          </span>
        )
        print(
          <span>
            linkedin:&nbsp;
            <a href="https://www.linkedin.com/in/erick06/" target="_blank" rel="noreferrer" className="text-blue-600 underline dark:text-grey-200">linkedin.com/in/erick06</a>
          </span>
        )
        break
      case 'theme': {
        const target = (args[0] || '').toLowerCase()
        if (target === theme) print(`already in ${theme} mode.`)
        else { onToggleTheme(); print(`theme → ${theme === 'dark' ? 'light' : 'dark'} mode`) }
        break
      }
      case 'echo':
        print(args.join(' '))
        break
      case 'date':
        print(new Date().toString())
        break
      case 'sudo':
        print('nice try 😏, but you do not have root here.')
        break
      case 'exit':
      case 'close':
        setOpen(false)
        break
      case 'clear':
        setLines([])
        break
      default:
        print(<span><span className="font-semibold text-blue-900 dark:text-white">command not found:</span> {cmd}. type 'help'.</span>)
    }
  }

  // fish-style inline autocomplete: the muted suffix that Tab / → will accept
  const suggestion = completionFor(input, cwd)
  const accept = () => suggestion && setInput(input + suggestion)

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'Tab') {
      // only trap Tab when there's something to complete, so it can still move
      // focus (e.g. to the close button) otherwise
      if (suggestion) { e.preventDefault(); accept() }
    } else if (e.key === 'ArrowRight') {
      // accept the suggestion when the caret sits at the very end of the line
      if (suggestion && e.target.selectionStart === input.length && e.target.selectionStart === e.target.selectionEnd) {
        e.preventDefault()
        accept()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const idx = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1)
      setHIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx === -1) return
      const idx = hIdx + 1
      if (idx >= history.length) { setHIdx(-1); setInput('') }
      else { setHIdx(idx); setInput(history[idx]) }
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
        className={`fixed inset-y-0 left-0 z-50 w-[min(92vw,380px)] transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex h-full flex-col border-r border-grey-300 bg-grey-100 shadow-xl dark:border-grey-800 dark:bg-black">
          {/* title bar */}
          <div className="flex items-center gap-2 border-b border-grey-300 bg-grey-200/60 px-4 py-3 dark:border-grey-800 dark:bg-black">
            <span className="h-3 w-3 rounded-full bg-blue-200 dark:bg-grey-700" />
            <span className="h-3 w-3 rounded-full bg-blue-400 dark:bg-grey-500" />
            <span className="h-3 w-3 rounded-full bg-blue-600 dark:bg-grey-300" />
            <span className="ml-2 flex-1 font-mono text-xs text-blue-400 dark:text-grey-500">visitor@erickk.cloud: ~</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close terminal"
              className="text-blue-400 hover:text-blue-700 dark:text-grey-500 dark:hover:text-grey-100"
            >
              <CloseIcon />
            </button>
          </div>

          {/* output + prompt */}
          <div
            ref={bodyRef}
            onClick={() => inputRef.current?.focus()}
            className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-blue-700 dark:text-grey-300"
          >
            {lines.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                {l === '' ? ' ' : l}
              </div>
            ))}

            <div className="flex items-center">
              <Prompt path={pathLabel(cwd)} />
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  aria-label="Terminal input"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck="false"
                  className="relative z-10 w-full border-0 bg-transparent p-0 text-blue-900 caret-blue-600 outline-none dark:text-white dark:caret-grey-100"
                />
                {/* ghost suffix, aligned under the input via an invisible copy of
                    what's typed (monospace, so the widths match exactly) */}
                {suggestion && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center whitespace-pre">
                    <span className="invisible">{input}</span>
                    <span className="text-blue-300 dark:text-grey-600">{suggestion}</span>
                  </div>
                )}
              </div>
              {suggestion && (
                <span className="ml-2 shrink-0 rounded border border-blue-200 px-1 text-[10px] leading-tight text-blue-400 dark:border-grey-700 dark:text-grey-500">
                  ⇥ tab
                </span>
              )}
            </div>
          </div>

          {/* pull-tab handle - rides the right edge of the panel near the top */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Collapse terminal' : 'Open terminal'}
            aria-expanded={open}
            className="absolute left-full top-20 flex flex-col items-center gap-2 rounded-r-lg border border-l-0 border-grey-300 bg-grey-100 px-1.5 py-3 text-blue-500 shadow-lg hover:text-blue-700 dark:border-grey-800 dark:bg-black dark:text-grey-400 dark:hover:text-grey-100"
          >
            <PromptGlyph />
            <span className="font-mono text-[11px] tracking-wider [writing-mode:vertical-rl] rotate-180">
              terminal
            </span>
          </button>
        </div>
      </aside>
    </>
  )
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
