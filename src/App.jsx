import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
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
import SunriseLayout from './components/SunriseLayout.jsx'
import { useRoute, replaceRoute } from './router.js'
import { LABELS } from './sitemap.js'
import { markVisited } from './passport.js'
import { LayoutContext, PanelActiveContext } from './layout.js'

// id -> the component rendered for that tile.
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

// The order tiles travel in: each move lifts the next one up from below.
const TILE_ORDER = [
  'home', 'about', 'projects', 'experience', 'skills',
  'education', 'certifications', 'leadership', 'contact',
]

export default function App() {
  // The sunrise photo is a daylight scene, so the palette is locked to light:
  // no theme state, no toggle, and the `dark` class never reaches <html>.
  const [terminalOpen, setTerminalOpen] = useState(false)

  const route = useRoute()
  const id = COMPONENTS[route] ? route : 'home' // unknown routes -> home

  // ...and the address bar is told so. Rendering home under '#/nonsense' left
  // the visitor on a URL that names nothing, which is what they would then copy
  // or bookmark.
  useEffect(() => { if (route !== id) replaceRoute(id) }, [route, id])

  // every tile the visitor sees earns a passport stamp
  useEffect(() => { markVisited(id) }, [id])

  // each tile is a discrete page: jump to the top and retitle the tab
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = id === 'home' ? 'Eric Kim' : `${LABELS[id]} · Eric Kim`
  }, [id])

  // Printing: the stage shows one tile at a time, which would print a single
  // section. `printing` swaps in a plain stacked document of every section for
  // the duration of the print job (flushSync commits before the browser
  // snapshots). This is print support, not a second layout — it is never
  // reachable from the UI.
  const [printing, setPrinting] = useState(false)
  const printingRef = useRef(false)
  useEffect(() => {
    const before = () => {
      if (printingRef.current) return
      printingRef.current = true
      flushSync(() => setPrinting(true))
    }
    const after = () => {
      if (!printingRef.current) return
      printingRef.current = false
      setPrinting(false)
    }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  if (printing) return <PrintDocument />

  return (
    <div
      className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${
        terminalOpen ? 'sm:pl-[380px]' : ''
      }`}
    >
      <CommandPalette />
      <TerminalDock open={terminalOpen} setOpen={setTerminalOpen} />
      <Navbar activeId={id} />
      <SunriseLayout order={TILE_ORDER} components={COMPONENTS} id={id} />
    </div>
  )
}

// Every section stacked in reading order, for paper only.
//
// `'page'` is the whole point of the context: on screen a section is squeezed
// to fit one tile, and paper has no such limit, so the sections are asked for
// their document spacing instead. Without the provider they printed at tile
// density — the compressed layout, on a page with room to spare.
// Nothing is on camera on paper either, so the demo clips hold their poster.
function PrintDocument() {
  return (
    <LayoutContext.Provider value="page">
      <PanelActiveContext.Provider value={false}>
        <main>
          {TILE_ORDER.map((sid) => {
            const Component = COMPONENTS[sid]
            return <Component key={sid} />
          })}
          <Footer />
        </main>
      </PanelActiveContext.Provider>
    </LayoutContext.Provider>
  )
}
