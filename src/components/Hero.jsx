import { useEffect, useState } from 'react'
import { hrefFor } from '../sitemap.js'

// The intro tile. Minimal, but not static: an availability badge, a greeting,
// the name, and one line that types itself through the things he actually
// builds. Everything else the visitor might want is one tile away, so this
// page introduces rather than summarises.

// One line per project, in the order the Projects tile lists them, so the
// intro is a table of contents for the work rather than a list of buzzwords.
// One line per project, in the order the Projects tile lists them, so the
// intro is a table of contents for the work rather than a list of buzzwords.
// Kept under ~30 characters each: at 390px anything longer wraps, and a row
// that reserves two lines for a phrase that only sometimes needs them leaves
// a hole under the name the rest of the time.
const BUILDS = [
  'embedded systems', // Intro
  'robots that hold your gaze',    // Winnie the Bot
  'statement level fraud detection',// Spottern!
  'live sentiment dashboards',     // Sentiment PULSE
  'websites a club runs on',       // KEB Web Design
  'energy monitors, PCB and all',  // Smart Energy Monitor
  'arcade games on an FPGA',       // Flappy Universe
  'analytics that forecast',       // RoastWorks Analytics
  'Android apps for meal plans',   // MealHub
]

const TYPE_MS = 55
const ERASE_MS = 28
const HOLD_MS = 1600

// One phrase types out, holds, erases, and the next takes over — forever.
function useTypewriter(phrases) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [text, setText] = useState(reduce ? phrases[0] : '')
  const [done, setDone] = useState(reduce)

  useEffect(() => {
    if (reduce) return
    let i = 0        // which phrase
    let n = 0        // how much of it is showing
    let erasing = false
    let timer

    const tick = () => {
      const phrase = phrases[i]
      if (!erasing) {
        n += 1
        setText(phrase.slice(0, n))
        if (n === phrase.length) {
          setDone(true)
          erasing = true
          timer = setTimeout(tick, HOLD_MS)
          return
        }
        timer = setTimeout(tick, TYPE_MS)
      } else {
        n -= 1
        setDone(false)
        setText(phrase.slice(0, n))
        if (n === 0) {
          erasing = false
          i = (i + 1) % phrases.length
        }
        timer = setTimeout(tick, n === 0 ? 320 : ERASE_MS)
      }
    }
    timer = setTimeout(tick, 700)
    return () => clearTimeout(timer)
  }, [phrases, reduce])

  return { text, done }
}

export default function Hero() {
  const { text, done } = useTypewriter(BUILDS)

  return (
    // No glass tile here: the intro sits straight on the photograph and the
    // first tile rises over it. Readability comes from the backdrop itself —
    // it defocuses and hazes over on this route (see SunriseBackdrop) — plus
    // the halo on the type, rather than from any panel behind the words.
    <section id="top" className="on-photo relative px-2 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* availability, with a live green pulse */}
        <div className="lift-in flex justify-center" style={{ animationDelay: '60ms' }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-green-700/25 bg-green-50/80 px-3 py-1 text-xs font-medium text-green-800">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            Open to 2026/27 summer internships
          </span>
        </div>

        <p
          className="lift-in mt-7 text-lg font-medium text-grey-800"
          style={{ animationDelay: '140ms' }}
        >
          Kia ora! <span className="wave-hand mx-0.5 inline-block">👋</span> This is
        </p>

        <h1
          className="lift-in mt-2 font-display text-5xl font-semibold tracking-tight text-grey-900 sm:text-7xl"
          style={{ animationDelay: '220ms' }}
        >
          Eric Kim
        </h1>

        {/* the typing line. min-height reserves the row so the layout never
            jumps as phrases swap. */}
        <p
          className="lift-in mt-6 flex min-h-[2rem] flex-wrap items-center justify-center gap-x-2 text-lg text-grey-800 sm:text-xl"
          style={{ animationDelay: '300ms' }}
        >
          <span>I build</span>
          <span className="font-medium text-accent">
            {text}
            <span
              aria-hidden="true"
              className={`ml-0.5 inline-block w-[2px] translate-y-[2px] self-stretch bg-accent ${done ? 'animate-caret' : ''}`}
              style={{ height: '1.05em' }}
            />
          </span>
          {/* the phrase is decorative motion; keep the sentence whole for AT */}
          <span className="sr-only">robots, fraud detection, live dashboards, websites, energy monitors, FPGA games, analytics and Android apps.</span>
        </p>

        <p
          className="lift-in mt-4 text-[15px] text-grey-700"
          style={{ animationDelay: '380ms' }}
        >
          Computer Systems Engineering (Hons)
          <span className="text-grey-500"> · </span>
          University of Auckland
        </p>

        {/* the tour starts at the beginning, not at the projects */}
        <div className="lift-in mt-9" style={{ animationDelay: '460ms' }}>
          <a href={hrefFor('about')} className="btn-primary group px-5 py-2.5 text-[15px]">
            Let&apos;s explore
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        {/* Two CVs, because the software and hardware versions are different
            documents. They open in a tab to read rather than downloading —
            most people want a look before they want a file. */}
        <div
          className="lift-in mt-8 text-sm text-grey-700"
          style={{ animationDelay: '540ms' }}
        >
          <span className="text-grey-600">Resume: </span>
          <a href="./CV_SWE.pdf" target="_blank" rel="noreferrer" className="hero-link tap-44">SWE</a>
          <span className="mx-1 text-grey-500 sm:mx-2">·</span>
          <a href="./CV_EEE.pdf" target="_blank" rel="noreferrer" className="hero-link tap-44">EEE</a>
        </div>

        <div
          className="lift-in mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm sm:gap-x-5 sm:gap-y-2"
          style={{ animationDelay: '620ms' }}
        >
          <a href="mailto:dohyunkim290106@gmail.com" className="hero-link tap-44 inline-flex items-center gap-1.5">
            <MailIcon /> Email
          </a>
          <a href="https://www.linkedin.com/in/erick06/" target="_blank" rel="noreferrer" className="hero-link tap-44 inline-flex items-center gap-1.5">
            <LinkedInIcon /> LinkedIn
          </a>
          <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="hero-link tap-44 inline-flex items-center gap-1.5">
            <GitHubIcon /> GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.32V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}
