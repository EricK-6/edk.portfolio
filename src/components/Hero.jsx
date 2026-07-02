import { useEffect, useRef, useState } from 'react'
import { goTo } from '../router.js'
import { useLayout } from '../layout.js'
import { hrefFor } from '../sitemap.js'
import { NAME, getNameTyped, setNameTyped, useNameTyped } from '../nameReveal.js'

// Visitors can just start typing when they land on the page. Correctly typed
// characters of NAME reveal in white; a wrong key resets back to the grey hint.
// Progress lives in a shared store (nameReveal.js) so it survives Hero
// remounting and the navbar hints can react to it. Returns how many leading
// characters match and whether it's complete.
function useTypeChallenge() {
  const typed = useNameTyped()

  useEffect(() => {
    function onKey(e) {
      // don't hijack typing inside form fields / editable elements
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      // leave keyboard shortcuts alone
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const n = getNameTyped()

      if (e.key === 'Backspace') {
        setNameTyped(n - 1)
        return
      }
      if (e.key.length !== 1) return // ignore Tab, Enter, arrows, etc.
      if (n >= NAME.length) return // already complete

      if (e.key === NAME[n]) {
        if (e.key === ' ') e.preventDefault() // typing the space shouldn't scroll the page
        setNameTyped(n + 1)
      } else {
        // wrong key: fall back to the grey hint
        setNameTyped(0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { typed, done: typed >= NAME.length }
}

// Subtle 3D tilt that follows the cursor over each hero tile. One delegated
// listener on the grid covers all tiles; inline transform overrides the
// Tailwind hover lift while active and clears on leave so it takes back over.
const TILT_MAX = 5 // degrees at the tile edge

function useTileTilt() {
  const gridRef = useRef(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return // touch: skip
      const tile = e.target.closest('[data-tilt]')
      if (!tile || !grid.contains(tile)) return
      const r = tile.getBoundingClientRect()
      const dx = (e.clientX - r.left) / r.width - 0.5
      const dy = (e.clientY - r.top) / r.height - 0.5
      const rx = (-dy * 2 * TILT_MAX).toFixed(2)
      const ry = (dx * 2 * TILT_MAX).toFixed(2)
      tile.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
    }

    const onOut = (e) => {
      const tile = e.target.closest('[data-tilt]')
      if (tile && !tile.contains(e.relatedTarget)) tile.style.transform = ''
    }

    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerout', onOut)
    return () => {
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerout', onOut)
    }
  }, [])

  return gridRef
}

export default function Hero() {
  const gridRef = useTileTilt()
  const layout = useLayout()
  return (
    <section
      id="top"
      className={`relative ${layout === 'box' ? 'py-6' : 'pt-12 pb-16 sm:pt-20 sm:pb-24'}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]
                   bg-gradient-to-b from-accent/[0.08] via-white to-transparent
                   dark:from-accent-dark/[0.04] dark:via-black dark:to-transparent"
      />
      <div className="container-page">
        <div ref={gridRef} className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 [perspective:1200px]">
          <NameTile />
          <StatusTile />
          <CVTile />
          <StatsTile />
          <AwardTile />
          <SocialTile />
          <SkillsTile />
        </div>
      </div>
    </section>
  )
}

const tile =
  'rounded-2xl border border-grey-300/80 bg-grey-100/80 backdrop-blur-sm p-6 dark:border-grey-800/70 dark:bg-grey-900/60 transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:shadow-grey-400/30 dark:hover:shadow-black/25'

function NameTile() {
  const { typed, done } = useTypeChallenge()
  const layout = useLayout()
  return (
    <div data-tilt className={`${tile} relative overflow-hidden sm:col-span-2 lg:col-span-3 lg:row-span-2 flex flex-col justify-between gap-6 min-h-[280px]`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-accent/[0.14] via-accent/[0.08] to-transparent blur-3xl dark:from-accent-dark/[0.08] dark:via-accent-dark/[0.04]"
      />
      {/* Portrait sits on the left of the name tile. */}
      <img
        src="./me.jpg"
        alt="Portrait of Dohyun (Eric) Kim"
        className="absolute left-6 top-1/2 hidden h-64 w-52 -translate-y-1/2 rounded-2xl object-cover shadow-lg ring-1 ring-grey-300/80 dark:ring-grey-700/80 lg:block"
      />
      <div className="relative lg:pl-60">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-medium text-grey-600 dark:text-grey-400">
          <span className="wave-hand" aria-hidden="true">👋</span> Kia Ora, This is..
        </div>
        <h1 aria-label={NAME} className="mt-1 min-h-[1.1em] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          <span aria-hidden="true">
            {/* correctly typed characters; glow once the full name is complete */}
            <span className={done ? 'animate-glow-in dark:animate-glow-in-green' : undefined}>{NAME.slice(0, typed)}</span>
            {/* blinking cursor */}
            <span className="animate-blink font-normal text-accent dark:text-accent-dark">_</span>
            {/* untyped remainder shown as a grey hint */}
            <span className="text-grey-400 dark:text-grey-600">{NAME.slice(typed)}</span>
          </span>
        </h1>
        <p
          aria-hidden="true"
          className="mt-2 flex min-h-[1.25em] items-center gap-1.5 text-xs font-medium"
        >
          {done ? (
            <span className="animate-fade-in text-base sm:text-lg font-semibold text-accent dark:text-accent-dark">Welcome, Glad to have u here :)</span>
          ) : (
            <span className="flex items-center gap-1.5 text-grey-400 dark:text-grey-500">
              <KeyboardIcon /> Try typing my name
            </span>
          )}
        </p>
        <p className="mt-3 text-xs sm:text-sm text-grey-600 dark:text-grey-400 leading-loose max-w-2xl">
          <span className="rounded-md bg-grey-200/80 px-2 py-0.5 font-mono font-medium tracking-wide text-grey-900 dark:bg-grey-800/70 dark:text-grey-100">
            I'm Penultimate CSE student @ UoA
          </span>{' '}
          specialising in{' '}
          <span className="font-medium text-grey-900 dark:text-grey-100">embedded systems</span>,{' '}
          <span className="font-medium text-grey-900 dark:text-grey-100">full stack development</span>, and{' '}
          <span className="font-medium text-grey-900 dark:text-grey-100">digital hardware design</span>.
        </p>
      </div>
      <div className="relative flex flex-wrap items-center gap-3 lg:pl-60">
        <a href={hrefFor('projects', layout)} className="btn-primary">
          View projects
        </a>
        <a href={hrefFor('contact', layout)} className="btn-secondary">
          Get in touch
        </a>
      </div>
    </div>
  )
}

function StatusTile() {
  const [pulse, setPulse] = useState(false)
  return (
    <button
      data-tilt
      type="button"
      onClick={() => setPulse(true)}
      onAnimationEnd={() => setPulse(false)}
      aria-label="Open to internships"
      className={`${tile} ${pulse ? 'animate-glow-green' : ''} w-full text-left bg-emerald-50/40 dark:bg-emerald-950/15 flex flex-col justify-between min-h-[136px]`}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Available
        </span>
      </div>
      <div>
        <div className="text-lg font-semibold text-grey-900 dark:text-grey-100">
          Open to internships
        </div>
        <div className="mt-1 text-sm text-grey-600 dark:text-grey-400">
          Summer 2026/27
        </div>
      </div>
    </button>
  )
}

function CVTile() {
  return (
    <div
      data-tilt
      className={`${tile} group relative overflow-hidden bg-gradient-to-br from-[#3a68bd] to-[#474eae] border-transparent text-white hover:from-[#497ac8] hover:to-[#5560b7] flex flex-col justify-between min-h-[136px]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-white/80">
          Resume
        </span>
        <DownloadIcon />
      </div>
      <div>
        <div className="text-sm font-medium text-white/90">Download my CV</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <CVButton href="./CV.pdf" label="for SWE" ariaLabel="Download software engineering CV (PDF)" />
          <CVButton href="./CV_EEE.pdf" label="for EEE" ariaLabel="Download electrical/electronics engineering CV (PDF)" />
        </div>
      </div>
    </div>
  )
}

function CVButton({ href, label, ariaLabel }) {
  return (
    <a
      href={href}
      download
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/25"
    >
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
      </svg>
      {label}
    </a>
  )
}

function StatsTile() {
  const layout = useLayout()
  return (
    <a data-tilt href={hrefFor('about', layout)} className={`${tile} sm:col-span-2 flex flex-col justify-between min-h-[136px]`}>
      <div className="text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">
        At a glance
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-4">
        <Stat label="Located In" value="Auckland, NZ" />
        <Stat label="Graduating" value="Nov 2027" />
        <Stat label="Focus" value="Embedded · Software" />
      </dl>
    </a>
  )
}

function AwardTile() {
  const layout = useLayout()
  return (
    <a data-tilt href={hrefFor('projects', layout)} className={`${tile} bg-amber-50/40 dark:bg-amber-950/15 flex flex-col justify-between min-h-[136px]`}>
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="text-xs font-medium uppercase tracking-widest">3rd place</span>
      </div>
      <div>
        <div className="text-lg font-semibold text-grey-900 dark:text-grey-100 leading-tight">
          ECSE Design
        </div>
        <div className="text-lg font-semibold text-grey-900 dark:text-grey-100 leading-tight">
          Competition
        </div>
        <div className="mt-1 text-sm text-grey-600 dark:text-grey-400">2025 · Winnie the Bot</div>
      </div>
    </a>
  )
}

function SocialTile() {
  const layout = useLayout()
  const goContact = () => goTo('contact', layout)
  return (
    <div
      data-tilt
      role="link"
      tabIndex={0}
      onClick={goContact}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goContact()
        }
      }}
      aria-label="Find me - get in touch"
      className={`${tile} flex cursor-pointer flex-col justify-between min-h-[136px]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">
          Find me
        </span>
        <span className="text-xs font-medium text-accent dark:text-accent-dark">Let's talk →</span>
      </div>
      <div className="space-y-2">
        <a
          href="https://github.com/EricK-6"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-fit items-center gap-2 text-sm text-grey-700 hover:text-accent dark:text-grey-300 dark:hover:text-accent-dark transition-colors"
        >
          <GitHubIcon /> EricK-6
        </a>
        <a
          href="https://www.linkedin.com/in/erick06/"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-fit items-center gap-2 text-sm text-grey-700 hover:text-accent dark:text-grey-300 dark:hover:text-accent-dark transition-colors"
        >
          <LinkedInIcon /> erick06
        </a>
      </div>
    </div>
  )
}

const TECH = [
  'Python', 'Java', 'C', 'JavaScript', 'R', 'VHDL',
  'React.js', 'MATLAB', 'AWS', 'Git', 'Altium Designer', 'Figma',
]

function SkillsTile() {
  const layout = useLayout()
  return (
    <a data-tilt href={hrefFor('skills', layout)} className={`${tile} block sm:col-span-2 lg:col-span-4`}>
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">
          Tech I work with
        </div>
        <span className="text-xs font-medium text-accent dark:text-accent-dark">
          See all →
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {TECH.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-lg border border-grey-300 bg-grey-200 px-2.5 py-1 text-sm font-medium text-grey-800 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-200"
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-grey-900 dark:text-grey-100">
        {value}
      </dd>
    </div>
  )
}

function KeyboardIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.32V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
