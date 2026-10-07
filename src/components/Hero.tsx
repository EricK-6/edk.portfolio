import { useEffect, useState } from 'react'
import { hrefFor } from '../sitemap'
import { HERO_PHRASES } from '../content'

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

const TYPE_MS = 55
const ERASE_MS = 28
const HOLD_MS = 1600

// One phrase types out, holds, erases, and the next takes over — forever.
function useTypewriter(phrases: readonly string[]) {
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
    let timer: ReturnType<typeof setTimeout>

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
  const { text, done } = useTypewriter(HERO_PHRASES)
  const cut = text.lastIndexOf(' ') + 1
  const head = text.slice(0, cut)
  const tail = text.slice(cut)

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24"
    >
      <HeroPhoto />

      <div className="on-photo relative z-10 mx-auto max-w-2xl text-center">
        <h1
          className="lift-in font-display text-[3.25rem] font-semibold leading-[0.95] text-grey-900 sm:text-7xl"
          style={{ animationDelay: '160ms', letterSpacing: '-0.035em' }}
        >
          Eric Kim
        </h1>

        {/* The typing line. Its height is reserved for the longest phrase so
            nothing around it moves as phrases swap: the block is centred in
            the frame, so one extra line used to lift the name 12px on a phone,
            for 40% of the time. Below sm the phrase always takes its own line,
            and the reservation is what the longest one measures there: two
            lines from 376px, three below (a 375px phone wraps "fraud detection
            that cites its evidence" in two). `content-start` stacks lines from
            the top, so the prefix never drifts inside the reserved space. */}
        <p
          className="lift-in mt-5 flex min-h-[5.25rem] flex-wrap content-start items-center justify-center gap-x-2 text-lg text-grey-800 min-[376px]:min-h-[3.5rem] sm:min-h-[2rem] sm:text-xl"
          style={{ animationDelay: '240ms' }}
        >
          <span>Kia ora, I build</span>
          {/* Hidden from screen readers: read aloud, this was whatever half of
              a phrase happened to be typed at that instant, followed by the
              whole list again from the sr-only sentence below. */}
          <span aria-hidden="true" className="basis-full font-medium text-accent-deep sm:basis-auto">
            {head}
            {/* the caret travels with the last word: on its own it was a
                line break opportunity, and a phrase that just fitted pushed
                the caret alone onto the next line */}
            <span className="whitespace-nowrap">
              {tail}
              <span
                aria-hidden="true"
                className={`ml-0.5 inline-block w-[2px] translate-y-[2px] self-stretch bg-accent-deep ${done ? 'animate-caret' : ''}`}
                style={{ height: '1.05em' }}
              />
            </span>
          </span>
          {/* the phrase is decorative motion; this is the sentence AT reads */}
          <span className="sr-only">embedded systems, robots, fraud detection, live dashboards, websites, energy monitors, FPGA games, analytics and Android apps.</span>
        </p>

        <p
          className="lift-in mt-4 text-[15px] text-grey-700"
          style={{ animationDelay: '320ms' }}
        >
          BE(Hons) Computer Systems Engineering
          <span className="text-grey-500"> · </span>
          University of Auckland
        </p>

        {/* One quiet line of status, in place of the internship message that
            used to sit here. It says what the About and Contact sections say
            (open to conversations and collaborations) without promising a
            role. grey-800, not 700: it sits on the photograph, where the
            local luminance moves with the crop. */}
        <p
          className="lift-in mt-3 inline-flex items-center justify-center gap-2 text-sm text-grey-800"
          style={{ animationDelay: '380ms' }}
        >
          <span aria-hidden="true" className="relative flex h-2 w-2 flex-none">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <span>Open to conversations and collaborations</span>
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
        {/* Phones get the 1000px photo whatever their pixel density. With
            sizes=100vw a 3x phone asked for the 2000px file (246KB against
            74KB), and under the blur and the haze the two are identical at
            1:1 device pixels; on a slow connection it was the difference
            between the photo landing in a few seconds and in nine. */}
        <source type="image/webp" media="(max-width: 767px), (max-height: 500px)" srcSet="./qt-sm.webp" />
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
