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

// Box-mode navigation by scrolling in four directions (plus matching arrow
// keys). A horizontal scroll/trackpad swipe moves left/right; a vertical scroll
// moves up/down once it pushes past the top/bottom edge, so a tall page still
// scrolls its own content first. Scrolling over something that scrolls
// horizontally itself (the Projects carousel) is left alone.
function useBoxNav(id, enabled) {
  const coolingRef = useRef(false)
  useEffect(() => {
    if (!enabled) return
    const pos = positionOf(id)
    if (!pos) return

    const move = (dir) => {
      const map = {
        left: [pos.row, pos.col - 1],
        right: [pos.row, pos.col + 1],
        up: [pos.row - 1, pos.col],
        down: [pos.row + 1, pos.col],
      }
      const [r, c] = map[dir]
      const target = cellAt(r, c)
      if (!target) return false
      navigateBoxTo(target)
      coolingRef.current = true
      setTimeout(() => { coolingRef.current = false }, 600)
      return true
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
    // walk up from the wheel target: is it inside a horizontally-scrollable box?
    const overScrollerX = (node) => {
      for (let el = node; el && el !== document.body; el = el.parentElement) {
        if (el.scrollWidth > el.clientWidth + 4) {
          const ox = getComputedStyle(el).overflowX
          if (ox === 'auto' || ox === 'scroll') return true
        }
      }
      return false
    }

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || blocked()) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); move('left') }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move('right') }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); move('up') }
      else if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); move('down') }
    }

    const onWheel = (e) => {
      if (blocked()) return
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax > ay) {
        if (ax < 18 || overScrollerX(e.target)) return // let the carousel scroll
        if (move(e.deltaX > 0 ? 'right' : 'left')) e.preventDefault() // block back-swipe
      } else {
        if (ay < 18) return
        if (e.deltaY > 0 && atBottom()) move('down')
        else if (e.deltaY < 0 && atTop()) move('up')
      }
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
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
            <EdgeNav id={id} />
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

const EDGE_DWELL_MS = 800 // hold the cursor at an edge this long to navigate
const EDGE_PX = 28 // how close to the viewport edge counts as "at the edge"
const NAVBAR_PX = 64 // h-16 navbar height; the top edge zone starts below it

const EDGE_POS = {
  up: 'top-[4.75rem] left-1/2 -translate-x-1/2',
  down: 'bottom-5 left-1/2 -translate-x-1/2',
  left: 'left-2 sm:left-3 top-1/2 -translate-y-1/2',
  right: 'right-2 sm:right-3 top-1/2 -translate-y-1/2',
}

// Chevrons pinned to each viewport edge that has a neighbouring page. Moving
// the cursor to the very edge (middle band) charges a glow and auto-navigates
// after EDGE_DWELL_MS; moving away or scrolling cancels. Each chevron is also a
// plain link, so a click navigates instantly. Box mode only.
function EdgeNav({ id }) {
  const [charging, setCharging] = useState(null)
  const timerRef = useRef(null)
  const chargingRef = useRef(null)

  const pos = positionOf(id)
  const targets = pos
    ? {
        up: cellAt(pos.row - 1, pos.col),
        down: cellAt(pos.row + 1, pos.col),
        left: cellAt(pos.row, pos.col - 1),
        right: cellAt(pos.row, pos.col + 1),
      }
    : {}

  useEffect(() => {
    if (!pos) return

    const set = (dir) => {
      if (chargingRef.current === dir) return // keep the current hold steady
      chargingRef.current = dir
      setCharging(dir)
      clearTimeout(timerRef.current)
      timerRef.current = null
      if (dir) {
        timerRef.current = setTimeout(() => {
          chargingRef.current = null
          setCharging(null)
          navigateBoxTo(targets[dir])
        }, EDGE_DWELL_MS)
      }
    }

    const onMove = (e) => {
      if (document.body.style.overflow === 'hidden') { set(null); return } // modal open
      const w = window.innerWidth
      const h = window.innerHeight
      const { clientX: x, clientY: y } = e
      const vMid = y > h * 0.2 && y < h * 0.8
      const hMid = x > w * 0.25 && x < w * 0.75
      let dir = null
      if (x <= EDGE_PX && vMid) dir = 'left'
      else if (x >= w - EDGE_PX && vMid) dir = 'right'
      else if (y > NAVBAR_PX && y <= NAVBAR_PX + EDGE_PX && hMid) dir = 'up'
      else if (y >= h - EDGE_PX && hMid) dir = 'down'
      set(targets[dir] ? dir : null)
    }
    const onLeaveOrScroll = () => set(null)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onLeaveOrScroll, { passive: true })
    document.addEventListener('mouseleave', onLeaveOrScroll)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onLeaveOrScroll)
      document.removeEventListener('mouseleave', onLeaveOrScroll)
      clearTimeout(timerRef.current)
      chargingRef.current = null
    }
  }, [id]) // targets are derived from id

  if (!pos) return null
  return (
    <>
      {['up', 'down', 'left', 'right'].map((dir) =>
        targets[dir] ? (
          <span
            key={dir}
            aria-hidden="true"
            className={`pointer-events-none fixed z-30 ${EDGE_POS[dir]}`}
          >
            <DirIcon dir={dir} charging={charging === dir} />
          </span>
        ) : null
      )}
    </>
  )
}

// A filled arrow silhouette pointing in the given direction. It's a faint ghost
// at rest; while the edge is charging it brightens, grows and glows (the path is
// rotated via an SVG attribute so the CSS scale animation doesn't fight it).
function DirIcon({ dir, charging }) {
  const deg = { right: 0, down: 90, left: 180, up: 270 }[dir]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`h-6 w-6 ${
        charging
          ? 'text-accent animate-dwell dark:text-accent-dark dark:animate-dwell-green'
          : 'text-grey-400/45 dark:text-grey-500/40'
      }`}
    >
      <path d="M9 5l8 7-8 7z" transform={`rotate(${deg} 12 12)`} />
    </svg>
  )
}
