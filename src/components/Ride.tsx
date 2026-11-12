import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CERTS, HERO_PHRASES, PROFILE, STACK, floorCode, projectsOn } from '../content'
import { hrefFor } from '../sitemap'
import { BEAT_VH, FLOORS, T_END, altitude, captionAt, ease, floorBeat, introAt, mottoAt, ramp } from '../ride/timeline'
import type { Ride as RideScene } from '../ride/scene'
import Motto, { ChipMark, CloudMark } from './Motto'

// The top of the home page: a ride from silicon to serverless.
//
// The site's motto was a sentence under a photograph. It is now the thing the
// page does. You land on a live circuit board with a name on it, and scrolling
// pushes one signal off a pin of the microcontroller and up through six
// floors (boards, logic, firmware, robots, software, cloud), each drawn from
// the work actually done on it, until it breaks through the clouds onto the
// paper the rest of the site is printed on.
//
// What it is careful about:
//
//   The scroll is never taken over. The stage is `position: sticky` inside a
//   tall section, so the scrollbar, the wheel, the keyboard, Back and Cmd+F
//   all behave. Scrolling is simply read, and the picture follows.
//
//   The words are the page's own. The name, each floor's caption and every
//   link are ordinary markup laid over the canvas, so they are selectable,
//   searchable and read aloud. The canvas is decoration and says so.
//
//   It is never a wait. three.js arrives as its own chunk after first paint;
//   until then the stage is its painted background with the name on it.
//
//   It steps aside. Reduced motion, a window too short to hold it, or no
//   WebGL at all get a still board (or none) and the six floors as a plain
//   list underneath, with the same words and the same links.

type Mode = 'ride' | 'still' | 'flat'

const TYPE_MS = 55
const ERASE_MS = 28
const HOLD_MS = 1600

// One phrase types out, holds, erases, and the next takes over.
function useTypewriter(phrases: readonly string[], reduce: boolean) {
  const [text, setText] = useState(reduce ? phrases[0] : '')
  const [done, setDone] = useState(reduce)

  useEffect(() => {
    if (reduce) { setText(phrases[0]); setDone(true); return }
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

function useMedia(query: string) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setOn(mq.matches)
    mq.addEventListener('change', sync)
    sync()
    return () => mq.removeEventListener('change', sync)
  }, [query])
  return on
}

// Asked once: a context made to answer the question is a context to throw away.
let webgl: boolean | undefined
function hasWebGL() {
  if (webgl === undefined) {
    try { webgl = !!document.createElement('canvas').getContext('webgl2') } catch { webgl = false }
  }
  return webgl
}

// The typing line: "Kia ora, I build a …" with the end of the sentence
// retyped forever. It is a component of its own because it changes on every
// keystroke, and the stage around it has no reason to re-render when it does.
function Typing({ still }: { still: boolean }) {
  const { text, done } = useTypewriter(HERO_PHRASES, still)
  const cut = text.lastIndexOf(' ') + 1
  return (
    // Its height is reserved for the longest phrase, so nothing around it
    // moves as phrases swap.
    <p className="ride-typing lift-in" style={{ animationDelay: '240ms' }}>
      <span>
        Kia ora, I build<span aria-hidden="true"> a</span>
      </span>
      {/* Hidden from screen readers: read aloud, this was whatever half of a
          phrase happened to be typed at that instant. */}
      <span aria-hidden="true" className="ride-phrase">
        {text.slice(0, cut)}
        {/* the caret travels with the last word, so it is never left alone
            on a line of its own */}
        <span className="whitespace-nowrap">
          {text.slice(cut)}
          <span className={`ride-caret ${done ? 'animate-caret' : ''}`} />
        </span>
      </span>
      {/* the phrase is decorative motion; this is the sentence AT reads */}
      <span className="sr-only">embedded systems, robots, fraud detection, live dashboards, websites, energy monitors, FPGA games, analytics and Android apps.</span>
    </p>
  )
}

// A floor, said in words: used beside the picture during the ride and as a
// plain list when there is no ride.
function FloorCopy({ level, heading: Heading }: { level: number; heading: 'h2' | 'h3' }) {
  const floor = STACK[level]
  const projects = projectsOn(level).slice(0, 4)
  return (
    <>
      <p className="floor-code">
        <span>{floorCode(level)}</span>
        {floor.name}
      </p>
      <Heading className="floor-title">{floor.title}</Heading>
      <p className="floor-body">{floor.body}</p>
      <ul className="floor-work" aria-label="Built on this floor">
        {projects.map((p) => (
          <li key={p.slug}>
            <a href={`#${p.slug}`} data-track={`ride-${p.slug}`}>
              {p.title}
              {p.rank && <span className="floor-rank">{p.rank}</span>}
            </a>
          </li>
        ))}
        {floor.id === 'cloud' && (
          <li>
            <a href={hrefFor('certifications')} data-track="ride-certifications">{CERTS.length} certifications</a>
          </li>
        )}
      </ul>
    </>
  )
}

export default function Ride() {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  // a phone on its side: there is not the height for a plate and its caption
  const short = useMedia('(max-height: 519px)')
  const flat = !hasWebGL() || new URLSearchParams(window.location.search).has('flat')
  const mode: Mode = flat ? 'flat' : reduced || short ? 'still' : 'ride'

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const captionRefs = useRef<(HTMLLIElement | null)[]>([])
  const gaugeRef = useRef<HTMLElement>(null)
  const arrivalRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)

  // These change a handful of times in a whole ride, so they are state. What
  // changes every frame (opacities, the gauge's marker) is written straight to
  // the elements instead, and React never hears about it.
  const [arrived, setArrived] = useState(false)
  const [floorNow, setFloorNow] = useState(0)

  // The page's chrome needs to know it is over the dark: the navbar and the
  // cursor read this. Set before paint, so there is no frame of dark type on
  // a dark stage.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.sky = 'dark'
    // index.html painted the body dark so this page never flashed white while
    // loading; the stage is here now, and the page under it is paper
    root.classList.remove('boot-dark')
    return () => { delete root.dataset.sky }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const host = hostRef.current
    if (!section || !stage || !host) return

    let scene: RideScene | null = null
    let dead = false
    let raf = 0
    let t = 0
    let last = 0
    // empty, so the first pass always writes it: the element may still carry
    // whatever an earlier run of this effect left there
    let tone = ''
    let lit = false
    let floor = 0
    const root = document.documentElement

    // where the reader is, in beats
    const measure = () => {
      const range = section.offsetHeight - stage.offsetHeight
      if (mode !== 'ride' || range <= 0) return 0
      return Math.max(0, Math.min(1, -section.getBoundingClientRect().top / range)) * T_END
    }

    const show = (el: HTMLElement | null, opacity: number, y = 0) => {
      if (!el) return
      el.style.opacity = opacity.toFixed(3)
      el.style.transform = y ? `translate3d(0, ${y.toFixed(1)}px, 0)` : ''
      el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
      // something half faded is not something to click
      el.style.pointerEvents = opacity < 0.6 ? 'none' : ''
    }

    // Everything on the stage that is not the canvas, placed for beat `at`.
    const stageAt = (at: number) => {
      const intro = introAt(at)
      show(introRef.current, intro, -(1 - intro) * 26)
      stage.style.setProperty('--intro', intro.toFixed(3))
      show(cueRef.current, 1 - ramp(at, 0.03, 0.3))

      captionRefs.current.forEach((el, i) => {
        const o = captionAt(at, i)
        // in from below, out through the top: the way the floors themselves go
        const leaving = at > floorBeat(i)
        show(el, o, (1 - o) * (leaving ? -22 : 22))
      })

      const alt = altitude(at)
      const gauge = gaugeRef.current
      if (gauge) {
        gauge.style.setProperty('--alt', (Math.min(alt, FLOORS - 1 + 0.62) / (FLOORS - 1)).toFixed(4))
        show(gauge, Math.min(ramp(at, 0.3, 0.7), 1 - ramp(at, 7.0, 7.3)))
      }
      const nowOn = Math.min(FLOORS - 1, Math.round(alt))
      if (nowOn !== floor) { floor = nowOn; setFloorNow(nowOn) }

      const motto = mottoAt(at)
      show(arrivalRef.current, motto, (1 - motto) * 18)
      const isLit = at > 7.32
      if (isLit !== lit) { lit = isLit; setArrived(isLit) }
      if (paperRef.current) paperRef.current.style.opacity = ease(ramp(at, 7.62, 7.97)).toFixed(3)

      // the shade that keeps the words readable has to lift with the dawn
      stage.style.setProperty('--dark', (1 - ease(ramp(at, 6.75, 7.25))).toFixed(3))

      const nowTone = at > 7.06 ? 'light' : 'dark'
      if (nowTone !== tone) { tone = nowTone; root.dataset.sky = nowTone }
    }

    const draw = (now: number) => {
      if (!scene) return
      scene.seek(t)
      scene.render(now)
    }

    // The picture trails the scroll by a hair. A wheel moves the page in
    // steps; easing towards where it has got to turns the steps into travel.
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      const target = measure()
      t += (target - t) * (1 - Math.exp(-dt * 10))
      if (Math.abs(target - t) < 0.0004) t = target
      stageAt(t)
      draw(now)
    }
    const run = () => { if (!raf && mode === 'ride') { last = 0; raf = requestAnimationFrame(tick) } }
    const rest = () => { cancelAnimationFrame(raf); raf = 0 }

    const resize = () => {
      scene?.resize(stage.clientWidth, stage.clientHeight)
      if (mode === 'still') draw(performance.now())
    }

    // start where the reader already is: a reload half way up should not
    // replay the climb from the bottom
    t = measure()
    stageAt(t)

    let canvas: HTMLCanvasElement | null = null
    if (mode !== 'flat') {
      canvas = document.createElement('canvas')
      canvas.className = 'ride-canvas'
      canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)
      const made = canvas
      // A GPU can take a context back (a driver reset, a phone under memory
      // pressure). The picture goes; the stage's painted ground and every word
      // stay. three.js rebuilds what it needs if the context returns.
      made.addEventListener('webglcontextlost', () => { made.dataset.ready = 'false' })
      made.addEventListener('webglcontextrestored', () => { if (scene) made.dataset.ready = 'true' })
      const lite = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 880
      import('../ride/scene')
        .then(({ startRide }) => startRide(made, { lite, still: mode === 'still' }))
        .then((ride) => {
          if (dead) { ride.dispose(); return }
          scene = ride
          resize()
          draw(performance.now())
          made.dataset.ready = 'true'
        })
        // no picture is not an error worth showing: the stage keeps its
        // painted ground and every word is still there
        .catch(() => { made.remove() })
    }

    const sizes = new ResizeObserver(resize)
    sizes.observe(stage)

    // A ride nobody can see does not need drawing. But it must not stop half
    // way: a jump straight to a section further down the page would otherwise
    // freeze the stage wherever the easing had got to, and leave the navbar
    // dressed for the dark over paper. So on the way out it is put exactly
    // where the scroll says it is.
    const settle = () => { rest(); t = measure(); stageAt(t) }
    const watcher = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : settle()))
    watcher.observe(section)
    const onVisibility = () => (document.hidden ? rest() : run())
    document.addEventListener('visibilitychange', onVisibility)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const box = stage.getBoundingClientRect()
      scene?.point(((e.clientX - box.left) / box.width) * 2 - 1, ((e.clientY - box.top) / box.height) * 2 - 1, true)
    }
    const onLeave = () => scene?.point(0, 0, false)
    stage.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerleave', onLeave)

    // With no ride there is no beat to read the tone from, so it is read from
    // the scroll: dark while this section is still behind the navbar, light
    // once the paper below has reached it.
    const onScroll = () => {
      const nowTone = section.getBoundingClientRect().bottom > 56 ? 'dark' : 'light'
      if (nowTone !== tone) { tone = nowTone; root.dataset.sky = nowTone }
    }
    if (mode !== 'ride') {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    // the terminal's `floor 3` and the command palette send the reader here
    const onFloor = (e: Event) => goToFloor((e as CustomEvent<number>).detail, section, stage)
    window.addEventListener('ride-floor', onFloor)

    return () => {
      dead = true
      rest()
      sizes.disconnect()
      watcher.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('ride-floor', onFloor)
      window.removeEventListener('scroll', onScroll)
      scene?.dispose()
      canvas?.remove()
    }
  }, [mode])

  const riding = mode === 'ride'

  return (
    <section
      ref={sectionRef}
      id="top"
      className="ride"
      data-mode={mode}
      style={riding ? ({ '--ride-scroll': `${T_END * BEAT_VH}svh` } as React.CSSProperties) : undefined}
    >
      {/* Where "#motto" lands: the scroll position at which the signal is
          through the clouds and the sentence is on the page. A real anchor,
          so the navbar's link is a plain link and works from any page. */}
      {riding && <span id="motto" aria-hidden="true" className="ride-motto-anchor" />}
      <div ref={stageRef} className="ride-stage">
        <div ref={hostRef} className="ride-canvas-host" />
        <div className="ride-shade" aria-hidden="true" />

        <div className="ride-copy ride-copy-intro">
          <div ref={introRef} className="ride-intro">
            <h1 className="ride-name lift-in" style={{ animationDelay: '160ms' }}>{PROFILE.name}</h1>

            <Typing still={reduced} />

            <p className="ride-degree lift-in" style={{ animationDelay: '320ms' }}>
              <span>BE(Hons) Computer Systems Engineering</span>
              <span aria-hidden="true" className="ride-dot"> · </span>
              <span>University of Auckland</span>
            </p>
          </div>
        </div>

        {riding && (
          <>
            <ol className="ride-copy ride-copy-floors" aria-label="The stack, floor by floor">
              {STACK.map((floor) => (
                <li key={floor.id} ref={(el) => { captionRefs.current[floor.level] = el }} className="ride-caption">
                  <FloorCopy level={floor.level} heading="h2" />
                </li>
              ))}
            </ol>

            {/* The gauge: the motto's chip and cloud stood on end, with the
                six floors between them. It says where the signal is, and each
                floor on it is a button that takes you there. */}
            <nav ref={gaugeRef} className="ride-gauge" aria-label="Floors of the stack">
              <CloudMark className="ride-gauge-end" size={18} />
              <div className="ride-gauge-rail">
                <span className="ride-gauge-line" aria-hidden="true" />
                <span className="ride-gauge-marker" aria-hidden="true" />
                {STACK.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    className="ride-gauge-stop"
                    style={{ bottom: `${(floor.level / (FLOORS - 1)) * 100}%` }}
                    data-on={floorNow === floor.level}
                    aria-current={floorNow === floor.level ? 'step' : undefined}
                    aria-label={`Floor ${floor.level}: ${floor.name}`}
                    data-track={`ride-floor-${floor.id}`}
                    onClick={() => sectionRef.current && stageRef.current && goToFloor(floor.level, sectionRef.current, stageRef.current)}
                  >
                    <span className="ride-gauge-name">{floor.name}</span>
                    <span className="ride-gauge-code">{floorCode(floor.level)}</span>
                    <span className="ride-gauge-tick" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <ChipMark className="ride-gauge-end" size={16} />
            </nav>

            <div ref={paperRef} className="ride-paper" aria-hidden="true" />

            <div ref={arrivalRef} className="ride-arrival">
              <h2 className="ride-motto"><Motto lit={arrived} /></h2>
            </div>

            {/* The way on: a mouse with its wheel turning, and nothing else. The
                navbar is there for anyone who would rather not ride. */}
            <div ref={cueRef} className="ride-cue">
              <span className="explore-cue">
                <span className="explore-mouse" aria-hidden="true">
                  <span className="explore-wheel" />
                </span>
                <span className="sr-only">Scroll to ride up the stack</span>
              </span>
            </div>
          </>
        )}

        {!riding && (
          <div className="ride-cue">
            <a href="#stack" aria-label="Continue to the stack" className="explore-cue tap-44">
              <span className="explore-mouse" aria-hidden="true">
                <span className="explore-wheel" />
              </span>
              <span className="explore-label">explore</span>
            </a>
          </div>
        )}
      </div>

      {/* No ride: the same six floors, as a page. */}
      {!riding && (
        <div id="stack" className="stack-list">
          <span id="motto" aria-hidden="true" />
          <div className="container-page max-w-6xl">
            <p className="section-kicker">The stack</p>
            <h2 className="section-title"><Motto /></h2>
            <ol>
              {STACK.map((floor) => (
                <li key={floor.id}>
                  <FloorCopy level={floor.level} heading="h3" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}

// Scroll to the beat a floor is best seen at. Plain smooth scrolling: the
// picture follows the scroll, so travelling there is the lift ride itself.
function goToFloor(level: number, section: HTMLElement, stage: HTMLElement) {
  const range = section.offsetHeight - stage.offsetHeight
  if (range <= 0 || !(level >= 0 && level < FLOORS)) return
  const top = section.getBoundingClientRect().top + window.scrollY + (floorBeat(level) / T_END) * range
  window.scrollTo({ top, behavior: 'smooth' })
}
