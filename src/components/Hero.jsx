import { useEffect, useState } from 'react'
import { hrefFor } from '../sitemap.js'

// The intro. It sits straight on the photograph — no panel, no tile — and its
// readability comes from the backdrop itself (which defocuses and hazes over on
// this route, see SunriseBackdrop) plus the halo `.on-photo` puts around the
// type.
//
// It lost a row along the way. "Kia ora! 👋 This is" was a whole line of
// furniture whose only job was to arrive at the name underneath it; the
// greeting now opens the one sentence that was already doing the work.

const BUILDS = [
  'embedded systems',
  'robots that hold your gaze',
  'statement level fraud detection',
  'live sentiment dashboards',
  'websites a club runs on',
  'energy monitors, PCB and all',
  'arcade games on an FPGA',
  'analytics that forecast',
  'Android apps for meal plans',
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
    let i = 0
    let n = 0
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
    <section id="top" className="on-photo relative px-2 py-8 sm:px-6 sm:py-12">
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

        <h1
          className="lift-in mt-6 font-display text-5xl font-semibold tracking-tight text-grey-900 sm:text-7xl"
          style={{ animationDelay: '160ms' }}
        >
          Eric Kim
        </h1>

        {/* the typing line. min-height reserves the row so the layout never
            jumps as phrases swap. */}
        <p
          className="lift-in mt-5 flex min-h-[2rem] flex-wrap items-center justify-center gap-x-2 text-lg text-grey-800 sm:text-xl"
          style={{ animationDelay: '240ms' }}
        >
          <span>Kia ora, I build</span>
          <span className="font-medium text-accent-deep">
            {text}
            <span
              aria-hidden="true"
              className={`ml-0.5 inline-block w-[2px] translate-y-[2px] self-stretch bg-accent-deep ${done ? 'animate-caret' : ''}`}
              style={{ height: '1.05em' }}
            />
          </span>
          {/* the phrase is decorative motion; keep the sentence whole for AT */}
          <span className="sr-only">robots, fraud detection, live dashboards, websites, energy monitors, FPGA games, analytics and Android apps.</span>
        </p>

        <p
          className="lift-in mt-3 text-[15px] text-grey-700"
          style={{ animationDelay: '320ms' }}
        >
          Computer Systems Engineering (Hons)
          <span className="text-grey-500"> · </span>
          University of Auckland
        </p>

        {/* The résumé, as one labelled control with two exact halves. Two equal
            pills competing across a row made the reader choose between them
            before understanding what they were; a label in front turns it into
            one decision with two answers, and lets each target drop everything
            but the word that distinguishes it. */}
        <div
          className="lift-in mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
          style={{ animationDelay: '400ms' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-600">
            Résumé
          </span>
          <span className="flex items-center gap-2">
            <CvLink href="./CV_SWE.pdf" kind="Software" />
            <CvLink href="./CV_EEE.pdf" kind="Hardware" />
          </span>
        </div>

        <div
          className="lift-in mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm sm:gap-x-5"
          style={{ animationDelay: '480ms' }}
        >
          <SocialLink href="mailto:dohyunkim290106@gmail.com"><MailIcon /> Email</SocialLink>
          <SocialLink href="https://www.linkedin.com/in/erick06/" external><LinkedInIcon /> LinkedIn</SocialLink>
          <SocialLink href="https://github.com/EricK-6" external><GitHubIcon /> GitHub</SocialLink>
        </div>

        {/* The way on, drawn as the thing that takes you there. A mouse with its
            wheel turning says "keep going" without a sentence, and it happens to
            teach the one gesture this site never explained: a scroll past the
            edge of a tile is what travels to the next one. Still a link, still
            named, so the keyboard and a screen reader get the same destination
            the wheel does. */}
        <div className="lift-in mt-8 flex justify-center" style={{ animationDelay: '560ms' }}>
          <a
            href={hrefFor('about')}
            aria-label="Explore — continue to About"
            className="explore-cue tap-44 group"
          >
            <span className="explore-mouse" aria-hidden="true">
              <span className="explore-wheel" />
            </span>
            <span className="explore-label">explore</span>
          </a>
        </div>
      </div>
    </section>
  )
}

// One résumé, two answers. Stripped to the word that tells them apart plus a
// glyph for where it opens — the label in front already says what they are, so
// "CV" and "pdf" on each was the same word twice. What is deliberately not
// minimal is the target: a drawn border, a filled rest state, a real hover and a
// press that moves, so there is never a question about where to click. As a bare
// "Resume: SWE · EEE" these were the same ink as the line above them with no
// underline, and the highest-intent click on the page read as a caption.
//
// [text-shadow:none] opts out of the section's .on-photo halo — the pill brings
// its own background, so the halo only softened the type on it.
function CvLink({ href, kind }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${kind} résumé — PDF, opens in a new tab`}
      className="tap-44 group inline-flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-3.5 py-2 text-sm font-medium text-grey-800 shadow-sm shadow-black/5 backdrop-blur-sm transition duration-150 [text-shadow:none] hover:border-accent/50 hover:bg-white hover:text-accent-deep active:translate-y-px active:bg-accent/10"
    >
      {kind}
      <OpenIcon />
    </a>
  )
}

function OpenIcon() {
  return (
    <svg
      aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="opacity-55 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
    >
      <path d="M7 17 17 7" /><path d="M9 7h8v8" />
    </svg>
  )
}

function SocialLink({ href, external, children }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="hero-link tap-44 inline-flex items-center gap-1.5"
    >
      {children}
    </a>
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
