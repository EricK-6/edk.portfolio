import { useEffect } from 'react'
import { useLayout } from '../layout.js'
import { hrefFor } from '../sitemap.js'
import { NAME, autoCheckIn, cancelAutoCheckIn, getNameTyped, setNameTyped, useNameTyped } from '../nameReveal.js'
import { isVipPassenger, useVisited } from '../passport.js'

// The passenger name prints itself shortly after load (autoCheckIn), but
// visitors can take over and type it themselves: correctly typed characters
// of NAME reveal in white; a wrong key resets back to the grey hint.
// Progress lives in a shared store (nameReveal.js) so it survives Hero
// remounting on layout switches. Returns how many leading characters match
// and whether it's complete.
function useTypeChallenge() {
  const typed = useNameTyped()

  useEffect(() => {
    autoCheckIn()
    function onKey(e) {
      // don't hijack typing inside form fields / editable elements
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      // leave keyboard shortcuts alone
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const n = getNameTyped()

      if (e.key === 'Backspace') {
        cancelAutoCheckIn() // the visitor is playing the game themselves
        setNameTyped(n - 1)
        return
      }
      if (e.key.length !== 1) return // ignore Tab, Enter, arrows, etc.
      if (n >= NAME.length) return // already complete
      cancelAutoCheckIn()

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

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey-400 dark:text-grey-600">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-grey-900 dark:text-grey-100">{children}</div>
    </div>
  )
}

// The boarding-pass hero: the site has a flight mode, so the landing page is
// the ticket. Passenger name is the typing game; the stub holds the barcode,
// CV and socials.
export default function Hero() {
  const layout = useLayout()
  const { typed, done } = useTypeChallenge()
  const visited = useVisited()
  const vip = isVipPassenger(visited)
  // hand-drawn hints stay until the visitor starts exploring other sections
  const fresh = visited.size <= 1

  return (
    <section
      id="top"
      className={`relative ${layout === 'space' ? 'py-6' : 'pt-12 pb-16 sm:pt-20 sm:pb-24'}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]
                   bg-gradient-to-b from-accent/[0.08] via-white to-transparent
                   dark:from-accent-dark/[0.04] dark:via-black dark:to-transparent"
      />
      {/* max-w-7xl beats container-page's max-w-5xl so the ticket can run wide */}
      <div className="container-page max-w-7xl animate-fade-in-up">
        <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-grey-300 bg-grey-100 shadow-2xl dark:border-grey-800 dark:bg-grey-950 md:grid-cols-[auto_auto_1fr_auto_250px]">
          {/* accent strip */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/70 via-accent/30 to-transparent dark:from-accent-dark/70 dark:via-accent-dark/30" />

          {/* tear-off stub on the left edge (desktop): vertical BOARDING PASS
              reading bottom-to-top (vertical-rl + rotate-180) */}
          <div aria-hidden="true" className="hidden select-none items-center px-3 md:flex">
            <span className="rotate-180 font-mono text-sm font-semibold uppercase tracking-[0.4em] text-grey-500 [writing-mode:vertical-rl] dark:text-grey-500">
              Boarding Pass
            </span>
          </div>
          {/* perforation tearing the stub off the main segment */}
          <div aria-hidden="true" className="relative hidden w-0 md:block">
            <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-grey-300 dark:border-grey-800" />
            <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white dark:bg-black" />
            <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-white dark:bg-black" />
          </div>

          {/* main segment */}
          <div className="relative px-6 py-4 sm:px-8 sm:py-5">
            {/* rubber stamp earned by visiting every section (see passport.js) */}
            {vip && (
              <div
                aria-label="VIP passenger — all sections visited"
                className="pointer-events-none absolute right-4 top-14 z-10 hidden -rotate-12 animate-fade-in rounded-lg border-2 border-emerald-600/60 px-2.5 py-1.5 text-center sm:block dark:border-emerald-500/60"
              >
                <div className="rounded border border-emerald-600/40 px-2 py-1 dark:border-emerald-500/40">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600/90 dark:text-emerald-500/90">
                    ★ VIP Passenger
                  </div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-emerald-600/70 dark:text-emerald-500/70">
                    all sectors · EK-2027
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-grey-500 dark:text-grey-500">
                erickk·cloud — boarding pass
              </div>
              <div className="font-mono text-xs text-grey-400 dark:text-grey-600">FLIGHT EK-2027</div>
            </div>

            <div className="mt-3">
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey-400 dark:text-grey-600">
                Kia Ora! Passenger <span className="normal-case tracking-normal">👋</span>
              </div>
              <h1 aria-label={NAME} className="mt-1 min-h-[1.1em] text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
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
                className="mt-1.5 flex min-h-[1.25em] items-center gap-1.5 text-xs font-medium"
              >
                {done ? (
                  <span className="animate-fade-in text-sm font-semibold text-accent dark:text-accent-dark">Identity verified - Welcome aboard :)</span>
                ) : typed > 0 ? (
                  <span className="text-grey-400 dark:text-grey-500">checking in…</span>
                ) : (
                  <span className="text-grey-400 dark:text-grey-500">⌨ type my name to check in</span>
                )}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              <Field label="From">Auckland, NZ (AKL)</Field>
              <Field label="To">Your Team</Field>
              <Field label="Seat">Summer 26/27</Field>
              <Field label="Class">CSE (Hons) @ UoA</Field>
              <Field label="Status">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Open to internships
                </span>
              </Field>
              <Field label="Certs">☁ AWS ×2 · Cloud + AI</Field>
              <Field label="Carry-on" className="col-span-2 sm:col-span-3">
                embedded systems · full stack development · digital hardware design
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href={hrefFor('projects', layout)} className="btn-primary">Board · View projects</a>
              <a href={hrefFor('contact', layout)} className="btn-secondary">Get in touch</a>
            </div>
          </div>

          {/* perforation */}
          <div aria-hidden="true" className="relative hidden w-0 md:block">
            <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-grey-300 dark:border-grey-800" />
            <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white dark:bg-black" />
            <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-white dark:bg-black" />
          </div>
          <div aria-hidden="true" className="relative mx-6 md:hidden">
            <div className="border-t-2 border-dashed border-grey-300 dark:border-grey-800" />
          </div>

          {/* stub */}
          <div className="flex flex-col justify-between gap-3 px-6 py-4 sm:px-8 sm:py-5 md:pl-9">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-grey-500 dark:text-grey-500">Gate</span>
                <span className="font-mono text-lg font-bold text-grey-900 dark:text-grey-100">P·01</span>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey-400 dark:text-grey-600">Resume</div>
                {/* one "Resume" tile, invisibly split: left half previews the
                    SWE CV, right half the EEE CV */}
                <div className="mt-1.5">
                  {/* the label lives inside the tile so it centres exactly;
                      pointer-events-none keeps both halves clickable */}
                  <div className="relative flex h-9 overflow-hidden rounded-lg border border-grey-300 dark:border-grey-700">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 flex items-center text-sm font-medium text-grey-700 dark:text-grey-300"
                    >
                      {/* each label centres over its clickable half (1/4 and
                          3/4 points); "vs" is pinned to the exact middle */}
                      <span className="w-1/2 text-center">SWE</span>
                      <span className="w-1/2 text-center">EEE</span>
                      <span className="absolute left-1/2 -translate-x-1/2 text-xs text-grey-400 dark:text-grey-600">vs</span>
                    </span>
                    <a
                      href="./CV_SWE.pdf"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Preview software engineering CV in the browser (left half)"
                      className="flex-1 transition hover:bg-grey-200/80 dark:hover:bg-grey-800/60"
                    />
                    <a
                      href="./CV_EEE.pdf"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Preview electrical/electronics engineering CV in the browser (right half)"
                      className="flex-1 transition hover:bg-grey-200/80 dark:hover:bg-grey-800/60"
                    />
                  </div>
                  {/* hand-drawn hints (until they explore): which half is which */}
                  {fresh && (
                    <div
                      aria-hidden="true"
                      className="flex justify-around pt-0.5 font-sketch text-[14px] leading-none text-accent/80 dark:text-accent-dark/80"
                    >
                      <span className="flex flex-col items-center">
                        <UpArrow />
                        <span className="-mt-0.5 -rotate-3">swe</span>
                      </span>
                      <span className="flex flex-col items-center">
                        <UpArrow />
                        <span className="-mt-0.5 rotate-3">eee</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <a
                  href="https://github.com/EricK-6"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-fit items-center gap-2 text-grey-600 transition-colors hover:text-accent dark:text-grey-400 dark:hover:text-accent-dark"
                >
                  <GitHubIcon /> EricK-6
                </a>
                <a
                  href="https://www.linkedin.com/in/erick06/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-fit items-center gap-2 text-grey-600 transition-colors hover:text-accent dark:text-grey-400 dark:hover:text-accent-dark"
                >
                  <LinkedInIcon /> erick06
                </a>
              </div>
            </div>

            {/* QR code in the barcode's old spot; white padding keeps the
                quiet zone scannable in dark mode */}
            <img
              src="./qr.jpg"
              alt="QR code"
              loading="lazy"
              decoding="async"
              className="mx-auto h-20 w-20 rounded-lg bg-white object-contain p-1 ring-1 ring-grey-200 dark:ring-grey-800"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// little hand-drawn arrow pointing up at the Resume tile half above it
function UpArrow() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 15 C 8 9.5, 6 6, 5 3" />
      <path d="M5 3 L 2.5 5.5 M5 3 L 7.5 5" />
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
