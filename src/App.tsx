import { Fragment, type ComponentType } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Education from './components/Education'
import Certifications from './components/Certifications'
import Leadership from './components/Leadership'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Divider from './components/Divider'
import CommandPalette from './components/CommandPalette'
import Cursor from './components/Cursor'
import TerminalDock from './components/TerminalDock'
import { SECTION_IDS, type SectionId } from './sitemap'
import { useHashLanding } from './router'

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
const SECTIONS: Record<Exclude<SectionId, 'home'>, ComponentType> = {
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
