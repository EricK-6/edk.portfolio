import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Experience from './components/Experience.jsx'
import Skills from './components/Skills.jsx'
import Education from './components/Education.jsx'
import Certifications from './components/Certifications.jsx'
import Leadership from './components/Leadership.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import TerminalDock from './components/TerminalDock.jsx'
import BootIntro from './components/BootIntro.jsx'
import MiniMap from './components/MiniMap.jsx'
import { useRoute } from './router.js'
import { LayoutContext } from './layout.js'
import { LABELS, cellAt, positionOf } from './sitemap.js'

// id -> the component rendered for that cell. Home is the bento (Hero).
const COMPONENTS = {
  home: Hero,
  about: About,
  experience: Experience,
  education: Education,
  projects: Projects,
  skills: Skills,
  leadership: Leadership,
  certifications: Certifications,
  contact: Contact,
}

// Top-to-bottom order of the classic single-page (scroll) layout.
const SCROLL_ORDER = [
  'home', 'about', 'projects', 'experience', 'skills',
  'education', 'certifications', 'leadership', 'contact',
]

// On-page anchor ids in document order (Hero's section is 'top', not 'home').
const ANCHOR_IDS = SCROLL_ORDER.map((id) => (id === 'home' ? 'top' : id))

// Which section is currently nearest the top of the viewport (used to keep
// the visitor's place when switching scroll -> box).
function sectionInView() {
  let current = 'home'
  for (const elId of ANCHOR_IDS) {
    const el = document.getElementById(elId)
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) {
      current = elId === 'top' ? 'home' : elId
    }
  }
  return current
}

// Direction of travel between two grid cells, for picking the slide animation.
// Diagonal jumps (e.g. via the minimap) return '' -> plain fade.
function directionBetween(from, to) {
  if (from === to) return ''
  const a = positionOf(from)
  const b = positionOf(to)
  if (!a || !b) return ''
  if (a.row === b.row) return b.col > a.col ? 'right' : 'left'
  if (a.col === b.col) return b.row > a.row ? 'down' : 'up'
  return ''
}

const ENTER_ANIM = {
  right: 'animate-slide-from-right',
  left: 'animate-slide-from-left',
  down: 'animate-slide-from-bottom',
  up: 'animate-slide-from-top',
  '': 'animate-fade-in-up',
}

// Box-mode spatial navigation: arrow keys move across the 3x3 grid, and a wheel
// gesture past the top/bottom edge pages up/down (horizontal wheel is left to
// the page — Projects has a horizontal carousel, and trackpads use it for back).
function useBoxNav(id, enabled) {
  const coolingRef = useRef(false)
  useEffect(() => {
    if (!enabled) return
    const pos = positionOf(id)
    if (!pos) return

    const startCooldown = () => {
      coolingRef.current = true
      setTimeout(() => { coolingRef.current = false }, 600)
    }
    const move = (dir) => {
      const map = {
        left: [pos.row, pos.col - 1],
        right: [pos.row, pos.col + 1],
        up: [pos.row - 1, pos.col],
        down: [pos.row + 1, pos.col],
      }
      const [r, c] = map[dir]
      const target = cellAt(r, c)
      if (target) { navigateBoxTo(target); startCooldown() }
    }

    const blocked = () => {
      if (coolingRef.current) return true
      if (document.body.style.overflow === 'hidden') return true // a modal is open
      const el = document.activeElement
      return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
    }
    const atTop = () => window.scrollY <= 2
    const atBottom = () =>
      window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight - 2

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || blocked()) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); move('left') }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move('right') }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); move('up') }
      else if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); move('down') }
    }
    const onWheel = (e) => {
      if (blocked()) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return // ignore horizontal
      if (e.deltaY > 8 && atBottom()) move('down')
      else if (e.deltaY < -8 && atTop()) move('up')
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [id, enabled])
}

// Tracks which section is centred in the viewport in scroll mode, so the navbar
// can highlight it as the visitor scrolls.
function useScrollSpy(enabled) {
  const [active, setActive] = useState('home')
  useEffect(() => {
    if (!enabled) return
    const els = ANCHOR_IDS.map((elId) => document.getElementById(elId)).filter(Boolean)
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id === 'top' ? 'home' : entry.target.id)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [enabled])
  return active
}

export default function App() {
  // dark mode is the default; the visitor's toggle choice is remembered
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch { /* private mode */ }
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try { localStorage.setItem('theme', theme) } catch { /* private mode */ }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // 'box' (one page per section) vs 'scroll' (classic single page); remembered
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('layout')
      if (saved === 'box' || saved === 'scroll') return saved
    } catch { /* private mode */ }
    return 'box'
  })
  useEffect(() => {
    try { localStorage.setItem('layout', layout) } catch { /* private mode */ }
  }, [layout])

  // lifted so the page can reflow (shift right) while the terminal dock is open
  const [terminalOpen, setTerminalOpen] = useState(false)

  const route = useRoute()
  const routeId = COMPONENTS[route] ? route : 'home' // unknown routes -> home

  // When switching scroll -> box we set the route hash, but hashchange (and so
  // `route`) updates a tick later. boxId pins the target for that first render
  // to avoid a flash of the wrong section; it clears once route catches up.
  const [boxId, setBoxId] = useState(null)
  useEffect(() => {
    if (boxId != null && routeId === boxId) setBoxId(null)
  }, [routeId, boxId])
  const id = boxId ?? routeId

  // pick the page-enter animation from the direction of the grid move
  const prevIdRef = useRef(id)
  const enterAnim = ENTER_ANIM[directionBetween(prevIdRef.current, id)]
  useEffect(() => { prevIdRef.current = id }, [id])

  // box mode: arrow-key / edge-wheel grid navigation
  useBoxNav(id, layout === 'box')
  // scroll mode: highlight the section currently in view
  const activeSection = useScrollSpy(layout === 'scroll')
  const activeId = layout === 'scroll' ? activeSection : id

  // in box mode each route is a discrete page: jump to the top and retitle the
  // tab. scroll mode is one page, so leave the scroll position and title alone.
  useEffect(() => {
    if (layout !== 'box') { document.title = 'Eric Kim'; return }
    window.scrollTo(0, 0)
    document.title = id === 'home' ? 'Eric Kim' : `${LABELS[id]} · Eric Kim`
  }, [id, layout])

  // keep the visitor's place across a layout switch
  const pendingScrollRef = useRef(null) // section to scroll to after -> scroll
  const toggleLayout = () => {
    if (layout === 'box') {
      pendingScrollRef.current = id
      setLayout('scroll')
    } else {
      const target = sectionInView()
      setBoxId(target)        // show it immediately
      navigateBoxTo(target)   // and update the URL (route catches up next tick)
      setLayout('box')
    }
  }
  useLayoutEffect(() => {
    if (layout === 'scroll' && pendingScrollRef.current != null) {
      const elId = pendingScrollRef.current === 'home' ? 'top' : pendingScrollRef.current
      pendingScrollRef.current = null
      // jump (not smooth) so the toggle feels instant
      document.getElementById(elId)?.scrollIntoView({ behavior: 'auto' })
    }
  }, [layout])

  return (
    <LayoutContext.Provider value={layout}>
      <div
        className={`min-h-screen transition-[padding] duration-300 ease-out ${
          terminalOpen ? 'sm:pl-[380px]' : ''
        }`}
      >
        <BootIntro />
        <CommandPalette theme={theme} onToggleTheme={toggleTheme} />
        <TerminalDock open={terminalOpen} setOpen={setTerminalOpen} theme={theme} onToggleTheme={toggleTheme} />
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
          layout={layout}
          onToggleLayout={toggleLayout}
          activeId={activeId}
        />
        {layout === 'box' ? (
          <>
            <MiniMap current={id} />
            <Page id={id} anim={enterAnim} />
          </>
        ) : (
          <ScrollLayout />
        )}
        <Footer />
      </div>
    </LayoutContext.Provider>
  )
}

// Set the box-mode route hash directly (used when switching scroll -> box).
function navigateBoxTo(target) {
  window.location.hash = target === 'home' ? '/' : `/${target}`
}

// The classic single page: every section stacked in reading order.
function ScrollLayout() {
  return (
    <main>
      {SCROLL_ORDER.map((sid) => {
        const Component = COMPONENTS[sid]
        return <Component key={sid} />
      })}
    </main>
  )
}

// Renders one page's content. `key` remounts on every route change so the
// entrance animation (and each section's reveals) replay; `anim` is the
// direction-aware slide chosen by the grid move that got here.
function Page({ id, anim }) {
  const Component = COMPONENTS[id]
  return (
    <main key={id} className={anim}>
      <Component />
    </main>
  )
}
