import { Fragment } from 'react'
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
import Divider from './components/Divider.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import Cursor from './components/Cursor.jsx'
import TerminalDock from './components/TerminalDock.jsx'
import { SECTION_IDS } from './sitemap.js'
import { useHashLanding } from './router.js'

// The whole site is one scrolling document, in reading order.
//
// What this replaced: nine hash routes, one rendered at a time as a frosted
// tile, with the wheel bound to `window` and reinterpreted as travel between
// them. That bought a nice entrance animation and cost the scrollbar, Cmd+F,
// a sane Back button, and any chance of a section being longer than the
// screen. It also meant every section carried a second, squeezed set of
// spacing so it could fit inside a tile, and a separate stacked document had
// to be swapped in on `beforeprint` because printing a one-tile stage printed
// one section. All of that is gone: the page prints because it is a page.
const SECTIONS = {
  about: About,
  projects: Projects,
  experience: Experience,
  skills: Skills,
  education: Education,
  certifications: Certifications,
  leadership: Leadership,
  contact: Contact,
}

export default function App() {
  // a deep link has to be honoured after the sections exist, not while the
  // browser is parsing an empty root div
  useHashLanding()

  return (
    <>
      <Cursor />
      <CommandPalette />
      <TerminalDock />
      <Navbar />

      <main id="main">
        <Hero />
        {SECTION_IDS.map((id, i) => {
          const Component = SECTIONS[id]
          return (
            <Fragment key={id}>
              {i > 0 && <Divider />}
              <Component />
            </Fragment>
          )
        })}
      </main>

      <Footer />
    </>
  )
}
