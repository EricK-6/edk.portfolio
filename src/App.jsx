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
import SpaceLayout from './components/SpaceLayout.jsx'
import { useRoute } from './router.js'
import { LayoutContext } from './layout.js'
import { LABELS } from './sitemap.js'

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

  // 'space' (3D flight between floating panels, the default) or 'scroll'
  // (classic single page); the visitor's explicit toggle is remembered
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('layout')
      if (saved === 'scroll') return 'scroll'
    } catch { /* private mode */ }
    return 'space'
  })
  useEffect(() => {
    try { localStorage.setItem('layout', layout) } catch { /* private mode */ }
  }, [layout])

  // lifted so the page can reflow (shift right) while the terminal dock is open
  const [terminalOpen, setTerminalOpen] = useState(false)

  const route = useRoute()
  const routeId = COMPONENTS[route] ? route : 'home' // unknown routes -> home

  // When switching scroll -> space we set the route hash, but hashchange (and so
  // `route`) updates a tick later. boxId pins the target for that first render
  // to avoid a flash of the wrong section; it clears once route catches up.
  const [boxId, setBoxId] = useState(null)
  useEffect(() => {
    if (boxId != null && routeId === boxId) setBoxId(null)
  }, [routeId, boxId])
  const id = boxId ?? routeId

  // scroll mode: highlight the section currently in view
  const activeSection = useScrollSpy(layout === 'scroll')
  const activeId = layout === 'scroll' ? activeSection : id

  // in space mode each route is a discrete page: jump to the top and
  // retitle the tab. scroll mode is one page, so leave both alone.
  useEffect(() => {
    if (layout === 'scroll') { document.title = 'Eric Kim'; return }
    window.scrollTo(0, 0)
    document.title = id === 'home' ? 'Eric Kim' : `${LABELS[id]} · Eric Kim`
  }, [id, layout])

  // keep the visitor's place across a layout switch (space <-> scroll)
  const pendingScrollRef = useRef(null) // section to scroll to after -> scroll
  const toggleLayout = () => {
    if (layout === 'scroll') {
      const target = sectionInView()
      setBoxId(target)        // show it immediately
      navigateBoxTo(target)   // and update the URL (route catches up next tick)
      setLayout('space')
    } else {
      pendingScrollRef.current = id
      setLayout('scroll')
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
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${
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
        {layout === 'space' ? (
          <SpaceLayout order={SCROLL_ORDER} components={COMPONENTS} id={id} dockOffset={terminalOpen ? 380 : 0} />
        ) : (
          <ScrollLayout />
        )}
        {/* footer belongs to the long scroll page; box pages are discrete and
            shouldn't carry spare scroll space below their content */}
        {layout === 'scroll' && <Footer />}
      </div>
    </LayoutContext.Provider>
  )
}

// Set the route hash directly (used when switching scroll -> space).
function navigateBoxTo(target) {
  window.location.hash = target === 'home' ? '/' : `/${target}`
}

// The classic single page: every section stacked in reading order.
function ScrollLayout() {
  return (
    <main className="flex-1">
      {SCROLL_ORDER.map((sid) => {
        const Component = COMPONENTS[sid]
        return <Component key={sid} />
      })}
    </main>
  )
}

