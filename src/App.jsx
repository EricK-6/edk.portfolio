import { useEffect, useState } from 'react'
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

  // lifted so the page can reflow (shift right) while the terminal dock is open
  const [terminalOpen, setTerminalOpen] = useState(false)

  return (
    <div
      className={`min-h-screen transition-[padding] duration-300 ease-out ${
        terminalOpen ? 'sm:pl-[380px]' : ''
      }`}
    >
      <BootIntro />
      <CommandPalette theme={theme} onToggleTheme={toggleTheme} />
      <TerminalDock open={terminalOpen} setOpen={setTerminalOpen} theme={theme} onToggleTheme={toggleTheme} />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Certifications />
        <Leadership />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
