import { useEffect, useState } from 'react'
import { hrefFor } from '../sitemap.js'

// The intro, and the one place on the site where type sits on a photograph.
//
// The picture used to be fixed behind every section, with each one riding it
// as a frosted tile. It is now full bleed here and nowhere else: the page
// below is paper. That is what lets the rest of the site's colours be
// measured once and be right — over a photograph the contrast ratio changes
// at every pixel and every viewport, which is why the section kickers and the
// project tags sat just under AA no matter how they were tuned.
//
// Readability here still comes from the picture itself stepping back — a wide
// haze with no edge — plus the halo `.on-photo` puts around each glyph. The
// haze resolves to the page colour at the bottom of the frame, so the seam
// where the photograph ends is a fade rather than a line.
//
// It is down to four things: who he is, what he builds, what he is studying,
// and the way on. The résumé control moved to the navbar, where it is reachable
// from anywhere on the page rather than only from the top of it, and the
// email/LinkedIn/GitHub row went entirely — every one of those appears in
// Contact and again in the footer, so the intro was the third copy. An opening
// screen should make one offer, not five.

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
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24"
    >
      <HeroPhoto />

      <div className="on-photo relative z-10 mx-auto max-w-2xl text-center">
        {/* Availability, with a live green pulse. The one badge left, and the
            only thing in the intro that is an offer rather than a fact — which
            is exactly why it survived the cut. */}
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
          className="lift-in mt-7 font-display text-[3.25rem] font-semibold leading-[0.95] text-grey-900 sm:text-7xl"
          style={{ animationDelay: '160ms', letterSpacing: '-0.035em' }}
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
          className="lift-in mt-4 text-[15px] text-grey-700"
          style={{ animationDelay: '320ms' }}
        >
          BE(Hons) Computer Systems Engineering
          <span className="text-grey-500"> · </span>
          University of Auckland
        </p>
      </div>

      {/* The way on. It sits at the foot of the frame rather than in the flow,
          so it marks the bottom of the picture instead of trailing the last
          line of text. */}
      <div
        className="lift-in absolute inset-x-0 bottom-10 z-10 flex justify-center"
        style={{ animationDelay: '440ms' }}
      >
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
    </section>
  )
}

// The photograph, full bleed behind the intro and nowhere else.
//
// It is a plain absolutely-positioned image rather than the old fixed
// backdrop. `background-attachment: fixed` and its equivalents force the
// compositor to repaint the layer on every scroll frame, which is exactly the
// kind of cost this redesign is trying to stop paying; the picture scrolls
// away with the section it belongs to.
function HeroPhoto() {
  return (
    <div className="hero-photo absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
      {/* WebP first: this is the LCP image, and it's blurred a moment later
          anyway, so the JPEG's extra detail buys nothing — WebP saves ~40%
          on the wire for the same picture. The JPEG stays as the <img> so
          browsers with no WebP support (or a tool reading the DOM) still
          get a real image. */}
      <picture>
        <source
          type="image/webp"
          srcSet="./qt-sm.webp 1000w, ./qt.webp 2000w"
          sizes="100vw"
        />
        <img
          src="./qt.jpg"
          srcSet="./qt-sm.jpg 1000w, ./qt.jpg 2000w"
          sizes="100vw"
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full scale-[1.02] object-cover blur-[1.5px]"
        />
      </picture>
      {/* the haze: full frame, so it has no edge to read as a shape, and it
          lands on the page colour so the bottom of the picture dissolves */}
      <div className="hero-haze absolute inset-0" />
    </div>
  )
}
