import { useEffect, useMemo, useRef, useState } from 'react'
import { goTo } from '../router.js'
import { LABELS } from '../sitemap.js'

// 'space' mode: the whole site laid out as panels floating in a 3D starfield.
// Each section sits at a stop along a winding flight path that recedes into
// the distance; navigating flies the camera from panel to panel (one animated
// inverse transform on the world). Pure CSS 3D on the regular DOM sections —
// no WebGL, so content stays selectable, accessible, and routable.

const STEP_Z = 2400 // depth between stops
const FLIGHT_MS = 1150
const SWAY_DEG = 2.4 // max camera sway following the cursor
const MIN_SCALE = 0.58 // fit-to-panel floor; below this, text gets too small
const MAX_SCALE = 1.12 // gentle zoom-to-fill ceiling, so no section looks blown up next to its neighbours
const PANEL_MAX_OFFSET = 152 // viewport space reserved for navbar + HUD + margins
const DESIGN_W = 1104 // sections' designed layout width (container-page + padding)

// "Fit page" for a panel, where the box hugs its content in both dimensions:
// the section keeps its exact document layout at its designed width and is
// uniformly zoomed (never distorted, never reflowed) to fill the free band
// between the navbar and the HUD — up-scaled until it hits the viewport's
// width or height, whichever comes first, or down-scaled when its natural
// height exceeds the cap. The box always hugs the zoomed content. Content
// only scrolls if it is still too tall at MIN_SCALE. The sizer div exists
// because transforms don't change layout size — it converts the scaled
// visual height into real layout height, which is what sizes the box.
function FitPanel({ scrollerRef, maxScale = MAX_SCALE, designWidth = DESIGN_W, dockOffset = 0, children }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const sizerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    const sizer = sizerRef.current
    if (!outer || !inner || !sizer) return
    let raf = 0

    const fit = () => {
      const vw = window.innerWidth - dockOffset // the terminal dock eats width
      const designW = Math.min(designWidth, vw - 48)
      const maxW = vw - 48
      const maxH = window.innerHeight - PANEL_MAX_OFFSET
      if (designW <= 0 || maxH <= 0) return
      inner.style.width = `${designW}px`
      const h = inner.scrollHeight
      const s = Math.min(Math.max(MIN_SCALE, Math.min(maxH / h, maxW / designW)), maxScale)
      inner.style.transform = `scale(${s})`
      inner.style.transformOrigin = 'top left'
      sizer.style.height = `${Math.round(h * s)}px`
      outer.style.width = `${Math.round(designW * s)}px` // box hugs the zoomed content
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fit)
    }
    schedule()
    const ro = new ResizeObserver(schedule)
    ro.observe(outer)
    ro.observe(inner) // content height changes (e.g. picking another project)
    window.addEventListener('resize', schedule)
    document.fonts?.ready?.then(schedule)
    const settle = setTimeout(schedule, 800) // images/fonts settling
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(raf)
      clearTimeout(settle)
    }
  }, [maxScale, designWidth, dockOffset])

  return (
    <div
      ref={(el) => {
        outerRef.current = el
        scrollerRef?.(el)
      }}
      className="overflow-y-auto overscroll-contain"
      style={{ maxHeight: `calc(100vh - ${PANEL_MAX_OFFSET}px)` }}
    >
      <div ref={sizerRef} className="overflow-hidden">
        <div ref={innerRef}>{children}</div>
      </div>
    </div>
  )
}

// winding path: side-to-side sweep, gentle vertical drift, each panel banked
// toward the path so a flight feels like turning, not sliding
const stopFor = (i) => ({
  x: Math.sin(i * 1.7) * 880,
  y: Math.cos(i * 2.3) * 230,
  z: -i * STEP_Z,
  ry: Math.sin(i * 1.7) * -12,
})

// -- background scenery -----------------------------------------------------
// Everything below lives inside the world transform, so it parallaxes with
// the camera for free. Coordinates are hand-placed off the flight path.

// real constellation shapes (normalised 0-100): the Southern Cross for the
// Auckland connection, plus three northern classics
// each is parked beside a stretch of the flight path (roughly two stops), so
// wherever the camera parks, something hangs in the void beside the panel
const CONSTELLATIONS = [
  {
    name: 'CRUX', x: 2600, y: -560, z: -3600, size: 300,
    pts: [[50, 8], [18, 45], [46, 92], [82, 52], [62, 62]],
    links: [[0, 2], [1, 3]],
  },
  {
    name: 'ORION', x: -3300, y: 280, z: -8800, size: 420,
    pts: [[24, 14], [70, 18], [38, 48], [50, 51], [62, 54], [28, 88], [76, 84]],
    links: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    name: 'URSA MAJOR', x: 3300, y: 460, z: -13600, size: 400,
    pts: [[8, 56], [24, 46], [40, 38], [54, 36], [70, 28], [90, 36], [86, 56], [58, 52]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]],
  },
  {
    name: 'CASSIOPEIA', x: -2400, y: -1000, z: -18200, size: 340,
    pts: [[8, 60], [28, 30], [48, 55], [68, 25], [88, 50]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'SCORPIUS', x: 2700, y: 640, z: -7000, size: 380,
    pts: [[12, 16], [20, 26], [26, 38], [32, 52], [40, 64], [52, 72], [66, 70], [78, 58], [88, 64], [82, 76]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  {
    name: 'LYRA', x: -2700, y: -800, z: -11400, size: 260,
    pts: [[50, 10], [38, 34], [62, 38], [44, 62], [68, 66]],
    links: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    name: 'PLEIADES', x: 2500, y: -900, z: -17000, size: 220,
    pts: [[30, 40], [42, 30], [55, 38], [66, 28], [48, 52], [60, 58], [38, 64]],
    links: [],
  },
  {
    name: 'CYGNUS', x: -1700, y: 150, z: -22200, size: 360,
    pts: [[50, 10], [50, 50], [50, 88], [16, 40], [84, 62]],
    links: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
]

function Constellation({ c }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500/80 dark:text-grey-300/80"
      style={{ transform: `translate3d(${c.x}px, ${c.y}px, ${c.z}px)` }}
    >
      <svg width={c.size} height={c.size} viewBox="0 0 100 100" fill="none">
        {c.links.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={c.pts[a][0]} y1={c.pts[a][1]} x2={c.pts[b][0]} y2={c.pts[b][1]}
            stroke="currentColor" strokeWidth="0.35" opacity="0.45"
          />
        ))}
        {c.pts.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r="1.4" fill="currentColor" />
        ))}
      </svg>
      <div className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.35em] opacity-40">
        {c.name}
      </div>
    </div>
  )
}

const PLANETS = [
  { x: -1400, y: -780, z: -5600, size: 150, ring: true },
  { x: 3400, y: -460, z: -15600, size: 240, ring: false },
  { x: -900, y: 900, z: -20600, size: 120, ring: true },
]

function Planet({ p }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2"
      style={{ transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)` }}
    >
      <svg width={p.size} height={p.size} viewBox="0 0 100 100" fill="none" className="text-grey-500/70 dark:text-grey-300/70">
        <defs>
          <radialGradient id={`pl-${p.z}`} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="26" fill={`url(#pl-${p.z})`} />
        {p.ring && (
          <ellipse cx="50" cy="50" rx="44" ry="13" transform="rotate(-18 50 50)" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        )}
      </svg>
    </div>
  )
}

// big soft colour glows deep in the volume (gradient falloff only — cheaper
// than blur filters)
const NEBULAS = [
  { x: 1800, y: -420, z: -9800, size: 1000, rgb: '34,211,238' }, // cyan
  { x: -1900, y: 480, z: -16600, size: 1100, rgb: '167,139,250' }, // violet
  { x: 0, y: 100, z: -23000, size: 1700, rgb: '52,211,153' }, // emerald
]

function Nebula({ n }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 rounded-full opacity-50 dark:opacity-100"
      style={{
        width: n.size,
        height: n.size,
        marginLeft: -n.size / 2,
        marginTop: -n.size / 2,
        transform: `translate3d(${n.x}px, ${n.y}px, ${n.z}px)`,
        backgroundImage: `radial-gradient(circle, rgba(${n.rgb},0.2), rgba(${n.rgb},0.07) 45%, transparent 70%)`,
      }}
    />
  )
}

const SHOOTING_STARS = [
  { x: 900, y: -640, z: -1200, duration: '9s', delay: '3s' },
  { x: -500, y: -560, z: -10800, duration: '14s', delay: '8s' },
  { x: 700, y: -700, z: -18600, duration: '17s', delay: '5s' },
]

// a tilted spiral galaxy that slowly rotates in its own plane, hanging high
// above the middle of the flight path
function Galaxy() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500/70 dark:text-grey-300/70"
      style={{ transform: 'translate3d(600px, -1250px, -12600px) rotateX(58deg)' }}
    >
      <svg
        width="280" height="280" viewBox="0 0 100 100" fill="none"
        className="galaxy-spin"
        style={{ animation: 'galaxy-spin 90s linear infinite' }}
      >
        <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.7" />
        <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.15" />
        <path d="M53 47 C 70 42, 84 32, 82 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <path d="M47 53 C 30 58, 16 68, 18 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <path d="M56 52 C 66 60, 68 72, 58 82" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.22" />
        <path d="M44 48 C 34 40, 32 28, 42 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.22" />
        {[[78, 20], [26, 76], [62, 76], [36, 24]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="currentColor" opacity="0.6" />
        ))}
      </svg>
    </div>
  )
}

// a comet with a long fading tail, drifting between Skills and Education
function Comet() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500 dark:text-grey-200"
      style={{ transform: 'translate3d(-2100px, -520px, -12200px) rotate(-22deg)' }}
    >
      <span
        className="block h-[3px] w-48 rounded-full"
        style={{ backgroundImage: 'linear-gradient(90deg, transparent, currentColor)' }}
      />
      <span
        className="absolute -right-1 -top-[3px] h-2.5 w-2.5 rounded-full bg-current"
        style={{ boxShadow: '0 0 12px currentColor' }}
      />
    </div>
  )
}

// a cratered moon near the end of the flight
function Moon() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500/80 dark:text-grey-300/80"
      style={{ transform: 'translate3d(1750px, -380px, -20300px)' }}
    >
      <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="moon-shade" cx="38%" cy="35%" r="72%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="url(#moon-shade)" />
        <circle cx="42" cy="40" r="5" fill="currentColor" opacity="0.18" />
        <circle cx="60" cy="56" r="7" fill="currentColor" opacity="0.14" />
        <circle cx="48" cy="64" r="3.5" fill="currentColor" opacity="0.18" />
      </svg>
    </div>
  )
}

// a little satellite keeping watch between About and Projects
function Satellite() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500/80 dark:text-grey-300/80"
      style={{ transform: 'translate3d(1550px, 780px, -5200px) rotate(-14deg)' }}
    >
      <svg width="96" height="58" viewBox="0 0 100 60" fill="none" stroke="currentColor">
        {/* solar panels */}
        <rect x="4" y="24" width="28" height="14" rx="1.5" strokeWidth="1.5" opacity="0.7" />
        <path d="M13 24v14M22 24v14" strokeWidth="1" opacity="0.5" />
        <rect x="68" y="24" width="28" height="14" rx="1.5" strokeWidth="1.5" opacity="0.7" />
        <path d="M77 24v14M86 24v14" strokeWidth="1" opacity="0.5" />
        {/* body + antenna */}
        <rect x="38" y="20" width="24" height="22" rx="3" strokeWidth="1.8" opacity="0.9" />
        <path d="M50 20V8" strokeWidth="1.5" opacity="0.8" />
        <circle cx="50" cy="6" r="2.4" fill="currentColor" stroke="none" opacity="0.9" />
      </svg>
    </div>
  )
}

// a loose band of asteroids drifting across the Education stretch
const ASTEROIDS = [
  [-1500, 520, -12400, 5], [-900, 640, -13100, 3], [-300, 580, -12700, 4],
  [200, 700, -13400, 3], [800, 540, -12500, 5], [1400, 660, -13000, 3],
  [1900, 600, -13600, 4], [-1100, 820, -13800, 3], [500, 860, -12900, 3],
  [1100, 780, -13300, 4], [-500, 900, -13500, 3], [2300, 720, -12600, 3],
]

export default function SpaceLayout({ order, components, id, dockOffset = 0 }) {
  // on phones the terminal overlays the page instead of pushing it
  const [isWide, setIsWide] = useState(() => window.matchMedia('(min-width: 640px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const onChange = () => setIsWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const off = isWide ? dockOffset : 0
  const index = Math.max(0, order.indexOf(id))
  const indexRef = useRef(index)
  indexRef.current = index
  const scrollers = useRef([])
  const coolingRef = useRef(false)
  const swayRef = useRef(null)
  const reduce = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const fly = (dir) => {
    const target = order[indexRef.current + dir]
    if (!target || coolingRef.current) return false
    coolingRef.current = true
    setTimeout(() => { coolingRef.current = false }, FLIGHT_MS + 120)
    goTo(target, 'space')
    return true
  }

  // each panel is its own page: land at its top after every flight
  useEffect(() => {
    scrollers.current[index]?.scrollTo({ top: 0 })
  }, [index])

  // wheel / arrow keys / touch: the active panel scrolls its own content
  // first; pushing past its top or bottom edge flies to the neighbour
  useEffect(() => {
    const blocked = () => {
      if (document.body.style.overflow === 'hidden') return true // modal open
      const el = document.activeElement
      return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
    }
    const sc = () => scrollers.current[indexRef.current]
    const atTop = () => { const s = sc(); return !s || s.scrollTop <= 2 }
    const atBottom = () => {
      const s = sc()
      return !s || s.scrollTop + s.clientHeight >= s.scrollHeight - 2
    }
    // walk up from the wheel target: is it inside a horizontally-scrollable
    // box (the Projects carousel)? Leave those wheels alone.
    const overScrollerX = (node) => {
      for (let el = node; el && el !== document.body; el = el.parentElement) {
        if (el.scrollWidth > el.clientWidth + 4) {
          const ox = getComputedStyle(el).overflowX
          if (ox === 'auto' || ox === 'scroll') return true
        }
      }
      return false
    }

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || blocked()) return
      if (e.key === 'ArrowRight') { e.preventDefault(); fly(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); fly(-1) }
      else if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); fly(1) }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); fly(-1) }
    }
    const onWheel = (e) => {
      if (blocked()) return
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax > ay) {
        if (ax < 18 || overScrollerX(e.target)) return
        if (fly(e.deltaX > 0 ? 1 : -1)) e.preventDefault() // block back-swipe
      } else {
        if (ay < 18) return
        if (e.deltaY > 0 && atBottom()) fly(1)
        else if (e.deltaY < 0 && atTop()) fly(-1)
      }
    }
    let touchY = null
    const onTouchStart = (e) => { touchY = e.touches[0]?.clientY ?? null }
    const onTouchEnd = (e) => {
      if (touchY == null || blocked()) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (Math.abs(dy) < 60) return
      if (dy > 0 && atBottom()) fly(1)
      else if (dy < 0 && atTop()) fly(-1)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
    // handlers read live position via refs, so they bind once
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // subtle camera sway following the cursor (mouse only), for depth feel
  useEffect(() => {
    if (reduce) return
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      const el = swayRef.current
      if (!el) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      el.style.transform = `rotateX(${(-ny * SWAY_DEG).toFixed(2)}deg) rotateY(${(nx * SWAY_DEG).toFixed(2)}deg)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce])

  // a fixed starfield scattered through the flight volume — because the stars
  // live inside the world transform, depth parallax during flights is free
  const stars = useMemo(() => {
    const depth = order.length * STEP_Z + 3200
    return Array.from({ length: 260 }, () => ({
      x: (Math.random() - 0.5) * 7200,
      y: (Math.random() - 0.5) * 4200,
      z: 700 - Math.random() * depth,
      s: Math.random() < 0.8 ? 2 : Math.random() < 0.8 ? 3 : 4,
      o: 0.25 + Math.random() * 0.65,
    }))
  }, [order.length])

  const cam = stopFor(index)

  return (
    <main
      className="fixed right-0 top-16 bottom-0 overflow-hidden bg-gradient-to-b from-grey-200 to-white transition-[left] duration-300 ease-out dark:from-black dark:to-grey-950"
      style={{ left: off, perspective: '1200px', perspectiveOrigin: '50% 45%' }}
    >
      {/* camera sway wrapper (cursor parallax) */}
      <div
        ref={swayRef}
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* the world: the camera flight is this one animated inverse transform */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-cam.ry}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`,
            transition: reduce ? 'none' : `transform ${FLIGHT_MS}ms cubic-bezier(0.66, 0.05, 0.25, 1)`,
          }}
        >
          {stars.map((st, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 rounded-full bg-grey-500 dark:bg-white"
              style={{
                width: st.s,
                height: st.s,
                opacity: st.o,
                transform: `translate3d(${st.x}px, ${st.y}px, ${st.z}px)`,
                boxShadow: st.s > 2 ? '0 0 8px currentColor' : undefined,
              }}
            />
          ))}

          {NEBULAS.map((n) => <Nebula key={n.z} n={n} />)}
          {CONSTELLATIONS.map((c) => <Constellation key={c.name} c={c} />)}
          {PLANETS.map((p) => <Planet key={p.z} p={p} />)}
          <Galaxy />
          <Comet />
          <Moon />
          <Satellite />
          {ASTEROIDS.map(([x, y, z, s]) => (
            <span
              key={`${x}-${z}`}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 bg-grey-500/70 dark:bg-grey-400/70"
              style={{
                width: s,
                height: s * 0.8,
                borderRadius: '42%',
                transform: `translate3d(${x}px, ${y}px, ${z}px) rotate(${(x + z) % 60}deg)`,
              }}
            />
          ))}
          {SHOOTING_STARS.map((sh) => (
            <div
              key={sh.z}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate3d(${sh.x}px, ${sh.y}px, ${sh.z}px)` }}
            >
              <span
                className="shooting-star block h-0.5 w-36 rounded-full text-grey-500 dark:text-white"
                style={{
                  backgroundImage: 'linear-gradient(90deg, transparent, currentColor)',
                  animation: `shooting-star ${sh.duration} linear infinite`,
                  animationDelay: sh.delay,
                  opacity: 0,
                }}
              />
            </div>
          ))}

          {order.map((pid, i) => {
            const s = stopFor(i)
            const d = Math.abs(i - index)
            const active = i === index
            const Component = components[pid]
            return (
              // NOTE: panels must stay opacity:1 — Chrome flattens translucent
              // participants of a preserve-3d context to DOM paint order, which
              // breaks both depth sorting and hit testing. Distance dimming is
              // done by the veil inside, and z-index mirrors proximity so
              // nearer panels win paint order and clicks.
              <div
                key={pid}
                className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotateY(${s.ry}deg)`,
                  zIndex: order.length - d,
                }}
              >
                {/* the wrapper shrink-wraps the box, whose size comes from the
                    content (FitPanel sizes itself in both dimensions). The
                    -36px bias centres it in the free band between the navbar
                    and the HUD rather than in the stage. */}
                <div
                  className="absolute"
                  style={{ transform: 'translate(-50%, calc(-50% - 36px))' }}
                >
                  <div
                    {...(!active && { inert: '' })}
                    className={`w-fit overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-grey-950 ${
                      active
                        ? 'border-accent/40 dark:border-accent-dark/40'
                        : 'border-grey-300/70 dark:border-grey-800/70'
                    }`}
                  >
                    <FitPanel
                      scrollerRef={(el) => (scrollers.current[i] = el)}
                      maxScale={pid === 'education' ? 1 : undefined}
                      // home is the boarding pass (max-w-4xl card): hug it;
                      // leadership is wide (max-w-7xl serpentine): give it room
                      designWidth={pid === 'home' ? 950 : pid === 'leadership' ? 1360 : undefined}
                      dockOffset={off}
                    >
                      <Component />
                    </FitPanel>
                  </div>
                  {/* distance fog: dims panels the further they are from the camera */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[5] rounded-2xl bg-white dark:bg-black"
                    style={{
                      opacity: d === 0 ? 0 : d === 1 ? 0.55 : d === 2 ? 0.8 : 0.9,
                      transition: `opacity ${FLIGHT_MS}ms ease`,
                    }}
                  />
                  {/* dimmed neighbours are one big "fly here" button */}
                  {!active && (
                    <button
                      type="button"
                      aria-label={`Fly to ${LABELS[pid]}`}
                      onClick={() => goTo(pid, 'space')}
                      className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* HUD: flight position, jump dots, and controls */}
      <div
        className="pointer-events-none fixed right-0 bottom-3 z-30 flex flex-col items-center gap-1.5 transition-[left] duration-300 ease-out"
        style={{ left: off }}
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-grey-300/70 bg-white/85 px-4 py-1.5 shadow-lg backdrop-blur dark:border-grey-800/70 dark:bg-black/70">
          <button
            type="button"
            onClick={() => fly(-1)}
            disabled={index === 0}
            aria-label="Previous section"
            className="text-lg leading-none text-grey-600 transition hover:text-accent disabled:opacity-30 dark:text-grey-300 dark:hover:text-accent-dark"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {order.map((pid, i) => (
              <button
                key={pid}
                type="button"
                aria-label={`Fly to ${LABELS[pid]}`}
                onClick={() => goTo(pid, 'space')}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-6 bg-accent dark:bg-accent-dark'
                    : 'w-1.5 bg-grey-400/70 hover:bg-grey-500 dark:bg-grey-600/70 dark:hover:bg-grey-400'
                }`}
              />
            ))}
          </div>
          <span className="min-w-[6.5rem] text-center font-mono text-xs text-grey-600 dark:text-grey-300">
            {String(index + 1).padStart(2, '0')}/{String(order.length).padStart(2, '0')} · {LABELS[id] ?? LABELS.home}
          </span>
          <button
            type="button"
            onClick={() => fly(1)}
            disabled={index === order.length - 1}
            aria-label="Next section"
            className="text-lg leading-none text-grey-600 transition hover:text-accent disabled:opacity-30 dark:text-grey-300 dark:hover:text-accent-dark"
          >
            ›
          </button>
        </div>
        <div className="font-mono text-[10px] text-grey-500/80">
          scroll · ← → · or click a floating panel to fly to it
        </div>
      </div>
    </main>
  )
}
