import { Fragment, type ComponentType } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Education from './components/Education'
import Certifications from './components/Certifications'
import Volunteering from './components/Volunteering'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Divider from './components/Divider'
import CommandPalette from './components/CommandPalette'
import Cursor from './components/Cursor'
import TerminalDock from './components/TerminalDock'
import { anchorOf, type SectionId } from './sitemap'
import { usePage } from './router'

// Four pages, each a scrolling document of its own sections (see sitemap.ts
// for which holds what). The URL hash is a section's anchor, so '#skills'
// opens the Projects & Skills page and scrolls to Skills.
const SECTIONS: Record<SectionId, ComponentType> = {
  home: Hero,
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  education: Education,
  certifications: Certifications,
  volunteering: Volunteering,
  contact: Contact,
}

export default function App() {
  const page = usePage()

  return (
    <>
      <Cursor />
      <CommandPalette />
      <TerminalDock />
      <Navbar page={page} />

      {/* The fixed header is 4rem tall and takes no room in the flow. Every
          section already opens with 7rem of its own padding, so without this a
          page that starts with a section put its heading 3rem under the bar,
          where every other heading on the site has 7rem above it. */}
      <main id="main" key={page.id} className={page.id === 'home' ? '' : 'pt-16'}>
        {page.sections.map((id, i) => {
          const Component = SECTIONS[id]
          return (
            <Fragment key={anchorOf(id)}>
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
