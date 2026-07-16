import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { goTo } from '../router.js'
import { LABELS } from '../sitemap.js'
import { PanelActiveContext } from '../layout.js'

// 'space' mode: the whole site laid out as panels floating in a 3D scene.
// The flight path is a solar-system vortex (à la the helical solar system
// animations): the axis runs into the depth, home sits at its centre up
// front, the middle sections orbit the axis as they recede — right and up,
// over the top, around — and contact returns to the centre at the far end,
// where the sun (light theme) / a glowing nebula core (dark) waits on the
// axis. Navigating corkscrews the camera from stop to stop (one animated
// inverse transform on the world). Pure CSS 3D on the regular DOM sections —
// no WebGL, so content stays selectable, accessible, and routable.
// The scenery is themed: dark mode flies through space (stars, constellations,
// nebulas), light mode through a daytime sky (clouds, sun, birds, a balloon) —
// each set is toggled purely with hidden/dark: classes so the theme wipe
// carries the whole world with it.

const FLIGHT_MS = 1150
const ARC_MS = FLIGHT_MS + 250 // corkscrew flights get a little longer than the old straight hop
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

// solar-vortex flight path: the axis runs into the depth. Home (i = 0) and
// contact (i = 8) sit on the axis; the seven sections between orbit it — the
// first hop heads up-right, then the orbit carries on clockwise (seen from
// the cockpit) while receding. Each orbiting stop banks (ry), pitches (rx)
// and rolls (rz) gently toward the axis, so parking there tilts the whole
// world around the visitor. A home -> contact jump flies straight down the
// middle of the tunnel of orbiting panels.
const STEP_Z = 2000 // depth gained per stop
const ORBIT_RX = 900 // orbit radius, horizontal
const ORBIT_RY = 560 // orbit radius, vertical (flatter: screens are wide)
const START_DEG = 40 // first hop heads up and to the right
const STEP_DEG = 72 // orbit advance per stop (7 stops = 1.2 revolutions)

const STOPS = Array.from({ length: 9 }, (_, i) => {
  if (i === 0 || i === 8) return { x: 0, y: 0, z: -i * STEP_Z, ry: 0, rx: 0, rz: 0 }
  const th = ((START_DEG + (i - 1) * STEP_DEG) * Math.PI) / 180
  return {
    x: Math.sin(th) * ORBIT_RX,
    y: -Math.cos(th) * ORBIT_RY,
    z: -i * STEP_Z,
    ry: Math.sin(th) * -14, // yaw toward the axis
    rx: Math.cos(th) * -9, // pitch toward the axis
    rz: Math.sin(th) * -8, // roll into the orbit
  }
})

const stopFor = (i) => STOPS[Math.max(0, Math.min(i, STOPS.length - 1))]

// the world transform that parks the camera at a stop: the exact inverse of
// the stop's own transform (translate, then yaw/pitch/roll), so the active
// panel is always perfectly head-on
const camT = (c) =>
  `rotateZ(${-c.rz}deg) rotateX(${-c.rx}deg) rotateY(${-c.ry}deg) translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`

// the overview camera: mostly frontal, nudged up and to the side. The
// scale3d squashes the vortex's depth to less than half before the pull-back,
// packing all nine cards into one glanceable cluster with only a mild
// near/far size difference.
const OVERVIEW_T =
  'translate3d(0px, 0px, -7200px) rotateX(-10deg) rotateY(-24deg) scale3d(1, 1, 0.45) translate3d(0px, 0px, 8000px)'

// on the map, stops fan outward from the axis (positions spread, cards stay
// their size) so the nine cards separate instead of stacking on the axis —
// the cards are wider than the flight orbit itself
const OVERVIEW_SPREAD = 2.4

// home and contact sit ON the axis, so the fan-out can't separate them:
// contact (index 8) would hide dead-centre behind everything. Nudge it into
// the map's empty centre-bottom instead.
const OVERVIEW_NUDGE = { 8: { x: -400, y: 2100 } }

// -- background scenery -----------------------------------------------------
// Everything below lives inside the world transform, so it parallaxes with
// the camera for free. Coordinates are hand-placed off the flight path.

// real constellation shapes (normalised 0-100): the Southern Cross for the
// Auckland connection, plus three northern classics
// each is parked beside a stretch of the flight path (roughly two stops), so
// wherever the camera parks, something hangs in the void beside the panel
// parked in a slow ring around the vortex axis, spread through the depth, so
// every stop on the orbit has something hanging in the void beside it
const CONSTELLATIONS = [
  {
    name: 'CRUX', x: 0, y: -2300, z: -1600, size: 300,
    pts: [[50, 8], [18, 45], [46, 92], [82, 52], [62, 62]],
    links: [[0, 2], [1, 3]],
  },
  {
    name: 'ORION', x: 2700, y: -1600, z: -3800, size: 420,
    pts: [[24, 14], [70, 18], [38, 48], [50, 51], [62, 54], [28, 88], [76, 84]],
    links: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    name: 'URSA MAJOR', x: 3800, y: -300, z: -6000, size: 400,
    pts: [[8, 56], [24, 46], [40, 38], [54, 36], [70, 28], [90, 36], [86, 56], [58, 52]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]],
  },
  {
    name: 'CASSIOPEIA', x: 2700, y: 1500, z: -8200, size: 340,
    pts: [[8, 60], [28, 30], [48, 55], [68, 25], [88, 50]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'SCORPIUS', x: 0, y: 2300, z: -10400, size: 380,
    pts: [[12, 16], [20, 26], [26, 38], [32, 52], [40, 64], [52, 72], [66, 70], [78, 58], [88, 64], [82, 76]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  {
    name: 'LYRA', x: -2700, y: 1500, z: -12600, size: 260,
    pts: [[50, 10], [38, 34], [62, 38], [44, 62], [68, 66]],
    links: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    name: 'PLEIADES', x: -3700, y: -300, z: -14200, size: 220,
    pts: [[30, 40], [42, 30], [55, 38], [66, 28], [48, 52], [60, 58], [38, 64]],
    links: [],
  },
  {
    name: 'CYGNUS', x: -2700, y: -1700, z: -15800, size: 360,
    pts: [[50, 10], [50, 50], [50, 88], [16, 40], [84, 62]],
    links: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
]

function Constellation({ c }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 hidden text-grey-300/80 dark:block"
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
  { x: -3000, y: -900, z: -2800, size: 150, ring: true },
  { x: 3300, y: 1100, z: -7400, size: 240, ring: false },
  { x: -3000, y: 1000, z: -11800, size: 120, ring: true },
]

function Planet({ p }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 hidden dark:block"
      style={{ transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)` }}
    >
      <svg width={p.size} height={p.size} viewBox="0 0 100 100" fill="none" className="text-grey-300/70">
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
  { x: 3000, y: -1500, z: -5200, size: 1000, rgb: '34,211,238' }, // cyan
  { x: -3100, y: 1500, z: -10200, size: 1100, rgb: '167,139,250' }, // violet
  { x: 0, y: 0, z: -18800, size: 1900, rgb: '52,211,153' }, // emerald core: the vortex's "sun"
]

function Nebula({ n }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 hidden rounded-full dark:block"
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
  { x: 1600, y: -1300, z: -1200, duration: '9s', delay: '3s' },
  { x: -2400, y: 900, z: -8800, duration: '14s', delay: '8s' },
  { x: 1400, y: 1500, z: -15200, duration: '17s', delay: '5s' },
]

// a tilted spiral galaxy that slowly rotates in its own plane, hanging high
// above the middle of the flight path
function Galaxy() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 hidden text-grey-300/70 dark:block"
      style={{ transform: 'translate3d(-3300px, -2100px, -8800px) rotateX(58deg)' }}
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
      className="absolute left-1/2 top-1/2 hidden text-grey-200 dark:block"
      style={{ transform: 'translate3d(3000px, 1600px, -13400px) rotate(-22deg)' }}
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
      className="absolute left-1/2 top-1/2 hidden text-grey-300/80 dark:block"
      style={{ transform: 'translate3d(2900px, -1500px, -13600px)' }}
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
      className="absolute left-1/2 top-1/2 hidden text-grey-300/80 dark:block"
      style={{ transform: 'translate3d(2600px, -1500px, -4600px) rotate(-14deg)' }}
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

// -- daytime scenery (light theme) -------------------------------------------
// The same flight volume, but sky instead of space: clouds at every depth
// (parallax for free, like the stars), a warm sun, gliding gulls, and one
// hot-air balloon. All dark:hidden — the theme wipe swaps worlds wholesale.

function Cloud({ c }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 dark:hidden"
      style={{ transform: `translate3d(${c.x}px, ${c.y}px, ${c.z}px)`, opacity: c.o }}
    >
      <svg
        width={c.s}
        height={c.s * 0.5}
        viewBox="0 0 100 50"
        className="cloud-drift"
        style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
      >
        {/* soft grey-blue body with a white crown, so clouds read on the
            white page background */}
        <ellipse cx="30" cy="34" rx="22" ry="13" fill="#e7ecf3" />
        <ellipse cx="74" cy="34" rx="19" ry="12" fill="#e7ecf3" />
        <ellipse cx="52" cy="38" rx="34" ry="11" fill="#e7ecf3" />
        <ellipse cx="52" cy="24" rx="24" ry="16" fill="#f4f6f9" />
        <ellipse cx="46" cy="20" rx="14" ry="9" fill="#ffffff" />
        <ellipse cx="52" cy="45" rx="30" ry="5" fill="#d4dbe5" opacity="0.7" />
      </svg>
    </div>
  )
}

function Sun() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 rounded-full dark:hidden"
      style={{
        width: 1100,
        height: 1100,
        marginLeft: -550,
        marginTop: -550,
        // dead centre on the vortex axis, past contact: the whole journey
        // orbits around (and towards) the sun. Monotone silver — the light
        // theme stays strictly white and grey.
        transform: 'translate3d(0px, 0px, -18500px)',
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(212,219,229,0.85) 18%, rgba(212,219,229,0.3) 45%, transparent 68%)',
      }}
    />
  )
}

// classic gull glyph: two wing arcs
const BIRDS = [
  { x: 950, y: -600, z: -950, s: 26 },
  { x: 1090, y: -520, z: -1050, s: 18 },
  { x: 800, y: -690, z: -850, s: 16 },
  { x: -2500, y: 1100, z: -6200, s: 26 },
  { x: -2340, y: 1200, z: -6360, s: 18 },
  { x: 2200, y: -1400, z: -10600, s: 24 },
  { x: -900, y: -1700, z: -14400, s: 22 },
]

function Bird({ b }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-600/70 dark:hidden"
      style={{ transform: `translate3d(${b.x}px, ${b.y}px, ${b.z}px)` }}
    >
      <svg width={b.s} height={b.s / 2} viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M2 9 Q 7 3, 12 8 Q 17 3, 22 9" />
      </svg>
    </div>
  )
}

// a striped hot-air balloon drifting outside the orbit near the start
// (grey like everything else: the light theme is monotone)
function Balloon() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 text-grey-500/80 dark:hidden"
      style={{ transform: 'translate3d(2800px, 800px, -3600px)' }}
    >
      <svg width="100" height="132" viewBox="0 0 60 80" className="balloon-bob">
        <path
          d="M30 3 C 15 3, 8 16, 8 27 C 8 39, 20 49, 25 55 L 35 55 C 40 49, 52 39, 52 27 C 52 16, 45 3, 30 3 Z"
          fill="currentColor"
          opacity="0.32"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M30 3 C 24 14, 24 44, 27 55 M30 3 C 36 14, 36 44, 33 55" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        <path d="M25 55 L26 64 M35 55 L34 64" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <rect x="24" y="64" width="12" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
      </svg>
    </div>
  )
}

// a loose asteroid ring circling the vortex axis at mid-journey
const ASTEROIDS = [
  [0, -1920, -9200, 4], [1200, -1660, -9400, 3], [2080, -960, -9150, 5],
  [2400, 0, -9450, 3], [2080, 960, -9250, 4], [1200, 1660, -9500, 3],
  [0, 1920, -9300, 5], [-1200, 1660, -9100, 3], [-2080, 960, -9400, 4],
  [-2400, 0, -9200, 3], [-2080, -960, -9350, 3], [-1200, -1660, -9250, 4],
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

  // overview: pinch out (or the HUD button) pulls the camera right back to
  // see the whole vortex at a glance; every panel becomes a click target
  const [overview, setOverview] = useState(false)
  const overviewRef = useRef(false)
  overviewRef.current = overview

  const fly = (dir) => {
    const target = order[indexRef.current + dir]
    if (!target || coolingRef.current) return false
    coolingRef.current = true
    setTimeout(() => { coolingRef.current = false }, ARC_MS + 80)
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
      if (overviewRef.current) {
        // parked out at the overview: only the way back is on the keyboard
        if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); setOverview(false) }
        return
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); fly(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); fly(-1) }
      else if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); fly(1) }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); fly(-1) }
    }
    const onWheel = (e) => {
      if (blocked()) return
      // trackpad pinches arrive as ctrl+wheel (mice: hold ctrl and scroll):
      // pinch out -> overview of the whole vortex, pinch in -> back
      if (e.ctrlKey) {
        e.preventDefault() // keep the browser's page zoom out of it
        if (e.deltaY > 4 && !overviewRef.current) setOverview(true)
        else if (e.deltaY < -4 && overviewRef.current) setOverview(false)
        return
      }
      if (overviewRef.current) return // wheel doesn't fly on the map
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
    // Safari reports trackpad pinches through gesture events instead
    const onGestureStart = (e) => e.preventDefault()
    const onGestureChange = (e) => {
      e.preventDefault()
      if (e.scale < 0.8 && !overviewRef.current) setOverview(true)
      else if (e.scale > 1.25 && overviewRef.current) setOverview(false)
    }
    // raw two-finger pinch (Android / touch screens): track the distance
    // between the fingers; shrinking opens the overview, spreading closes it
    const touchDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    let pinchStart = null
    let touchY = null
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null
      pinchStart = e.touches.length === 2 ? touchDist(e.touches) : null
    }
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || pinchStart == null || blocked()) return
      e.preventDefault() // the pinch is ours, not the browser zoom's
      const ratio = touchDist(e.touches) / pinchStart
      if (ratio < 0.72 && !overviewRef.current) { setOverview(true); pinchStart = touchDist(e.touches) }
      else if (ratio > 1.35 && overviewRef.current) { setOverview(false); pinchStart = touchDist(e.touches) }
    }
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) pinchStart = null
      if (touchY == null || blocked() || overviewRef.current) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (Math.abs(dy) < 60) return
      if (dy > 0 && atBottom()) fly(1)
      else if (dy < 0 && atTop()) fly(-1)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('gesturestart', onGestureStart)
    window.addEventListener('gesturechange', onGestureChange)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('gesturestart', onGestureStart)
      window.removeEventListener('gesturechange', onGestureChange)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
    // handlers read live position via refs, so they bind once
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 2D click layer for the map: Chrome's hit-testing cannot reach buttons on
  // panels deep inside the preserve-3d scene (pointer events land on the flat
  // ancestors — verified with elementFromPoint), so once the zoom-out settles
  // we measure each panel's projected screen box and lay a plain screen-space
  // button over it. Bulletproof clicks, keyboard-focusable, hover ring free.
  const mainRef = useRef(null)
  const panelBoxRefs = useRef([])
  const [mapRects, setMapRects] = useState(null)
  useEffect(() => {
    if (!overview) { setMapRects(null); return }
    const measure = () => {
      const mainEl = mainRef.current
      if (!mainEl) return
      const mr = mainEl.getBoundingClientRect()
      setMapRects(
        order
          .map((pid, i) => {
            const el = panelBoxRefs.current[i]
            if (!el) return null
            const r = el.getBoundingClientRect()
            return { pid, left: r.left - mr.left, top: r.top - mr.top, width: r.width, height: r.height }
          })
          .filter(Boolean)
      )
    }
    const t = setTimeout(measure, ARC_MS + 120) // after the zoom settles
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [overview, order])

  // subtle camera sway following the cursor (mouse only), for depth feel.
  // Frozen (and reset) on the overview map so click targets hold still.
  useEffect(() => {
    if (overview && swayRef.current) swayRef.current.style.transform = ''
  }, [overview])
  useEffect(() => {
    if (reduce) return
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      if (overviewRef.current) return
      const el = swayRef.current
      if (!el) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      el.style.transform = `rotateX(${(-ny * SWAY_DEG).toFixed(2)}deg) rotateY(${(nx * SWAY_DEG).toFixed(2)}deg)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce])

  // a fixed starfield scattered along the vortex corridor — because the
  // stars live inside the world transform, parallax during flights is free
  const stars = useMemo(
    () =>
      Array.from({ length: 260 }, () => ({
        x: (Math.random() - 0.5) * 12000,
        y: (Math.random() - 0.5) * 8000,
        z: 1200 - Math.random() * 21000,
        s: Math.random() < 0.8 ? 2 : Math.random() < 0.8 ? 3 : 4,
        o: 0.25 + Math.random() * 0.65,
      })),
    []
  )

  // the light theme's equivalent: clouds along the whole corridor
  const clouds = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        x: (Math.random() - 0.5) * 10000,
        y: (Math.random() - 0.5) * 6200,
        z: 800 - Math.random() * 19000,
        s: 150 + Math.random() * 280,
        o: 0.5 + Math.random() * 0.5,
        dur: 45 + Math.random() * 45,
        delay: -Math.random() * 60, // desynchronise the drift cycles
      })),
    []
  )

  // camera flights: interpolating the orbit between stops IS the corkscrew —
  // the world sweeps past as the camera rides the helix, and long jumps (HUD
  // dots) fly straight down the middle of the tunnel. The camera target is a
  // single transform string (a stop, or the overview vantage), animated with
  // WAAPI keyframes; the final state lives in style.transform so interrupts
  // and non-animating browsers stay correct.
  const worldRef = useRef(null)
  const flightAnimRef = useRef(null)
  const lastTargetRef = useRef(null)
  const target = overview ? OVERVIEW_T : camT(stopFor(index))
  useLayoutEffect(() => {
    const el = worldRef.current
    if (!el || lastTargetRef.current === target) return
    const firstRun = lastTargetRef.current == null
    lastTargetRef.current = target
    if (reduce || firstRun || typeof el.animate !== 'function') {
      flightAnimRef.current?.cancel()
      el.style.transform = target
      return
    }
    // capture the live transform BEFORE cancelling, so an interrupted flight
    // continues smoothly from wherever the camera actually is
    const current = getComputedStyle(el).transform
    flightAnimRef.current?.cancel()
    el.style.transform = target
    flightAnimRef.current = el.animate(
      [{ transform: current === 'none' ? target : current }, { transform: target }],
      { duration: ARC_MS, easing: 'cubic-bezier(0.55, 0.05, 0.28, 1)' }
    )
  }, [target, reduce])

  return (
    <main
      ref={mainRef}
      className="fixed right-0 top-16 bottom-0 overflow-hidden bg-gradient-to-b from-grey-200 to-white transition-[left] duration-300 ease-out dark:from-black dark:to-grey-950"
      style={{ left: off, perspective: '1200px', perspectiveOrigin: '50% 45%' }}
    >
      {/* camera sway wrapper (cursor parallax) */}
      <div
        ref={swayRef}
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* the world: the camera flight is one animated inverse transform,
            driven by the WAAPI arc keyframes above */}
        <div
          ref={worldRef}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {/* night sky (dark theme) */}
          {stars.map((st, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 hidden rounded-full bg-white dark:block"
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
              className="absolute left-1/2 top-1/2 hidden bg-grey-400/70 dark:block"
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
              className="absolute left-1/2 top-1/2 hidden dark:block"
              style={{ transform: `translate3d(${sh.x}px, ${sh.y}px, ${sh.z}px)` }}
            >
              <span
                className="shooting-star block h-0.5 w-36 rounded-full text-white"
                style={{
                  backgroundImage: 'linear-gradient(90deg, transparent, currentColor)',
                  animation: `shooting-star ${sh.duration} linear infinite`,
                  animationDelay: sh.delay,
                  opacity: 0,
                }}
              />
            </div>
          ))}

          {/* daytime sky (light theme) */}
          <Sun />
          {clouds.map((c, i) => <Cloud key={i} c={c} />)}
          {BIRDS.map((b) => <Bird key={`${b.x}-${b.z}`} b={b} />)}
          <Balloon />

          {order.map((pid, i) => {
            const s = stopFor(i)
            const d = Math.abs(i - index)
            const active = i === index
            const Component = components[pid]
            const nudge = OVERVIEW_NUDGE[i]
            const px = overview ? s.x * OVERVIEW_SPREAD + (nudge?.x ?? 0) : s.x
            const py = overview ? s.y * OVERVIEW_SPREAD + (nudge?.y ?? 0) : s.y
            return (
              // NOTE: panels must stay opacity:1 — Chrome flattens translucent
              // participants of a preserve-3d context to DOM paint order, which
              // breaks both depth sorting and hit testing. Distance dimming is
              // done by the veil inside, and z-index mirrors proximity so
              // nearer panels win paint order and clicks. Only the immediate
              // neighbour is previewed; anything further is hidden outright —
              // unless the overview map is open, which shows every stop.
              <div
                key={pid}
                className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{
                  transformStyle: 'preserve-3d',
                  // on the map, positions fan outward and cards grow a touch
                  // so every stop is individually visible
                  transform: `translate3d(${px}px, ${py}px, ${s.z}px) rotateY(${s.ry}deg) rotateX(${s.rx}deg) rotateZ(${s.rz}deg) scale(${overview ? 1.2 : 1})`,
                  transition: reduce ? undefined : `transform ${ARC_MS}ms ease`,
                  // map paint order follows the route (home in front); in
                  // flight it mirrors proximity so neighbours win clicks
                  zIndex: overview ? order.length - i : order.length - d,
                  visibility: overview || d <= 1 ? undefined : 'hidden',
                }}
              >
                {/* the wrapper shrink-wraps the box, whose size comes from the
                    content (FitPanel sizes itself in both dimensions). The
                    -36px bias centres it in the free band between the navbar
                    and the HUD rather than in the stage. */}
                <div
                  ref={(el) => (panelBoxRefs.current[i] = el)}
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
                      <PanelActiveContext.Provider value={active}>
                        <Component />
                      </PanelActiveContext.Provider>
                    </FitPanel>
                  </div>
                  {/* distance fog: the neighbour is a dim preview in flight;
                      the map shows every card at full brightness */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[5] rounded-2xl bg-white dark:bg-black"
                    style={{
                      opacity: overview || d === 0 ? 0 : d === 1 ? 0.55 : 1,
                      transition: `opacity ${ARC_MS}ms ease`,
                    }}
                  />
                  {/* the dimmed neighbour is one big "fly here" button; on the
                      map these 3D buttons are unreachable by the pointer, so
                      the screen-space click layer takes over instead */}
                  {!active && !overview && (
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

      {/* the map's screen-space click layer (see mapRects above) */}
      {overview && mapRects && (
        <div className="absolute inset-0 z-20">
          {mapRects.map((r) => (
            <button
              key={r.pid}
              type="button"
              aria-label={`Fly to ${LABELS[r.pid]}`}
              onClick={() => { goTo(r.pid, 'space'); setOverview(false) }}
              className="absolute cursor-pointer rounded-xl border-2 border-transparent transition hover:border-accent/70 hover:bg-accent/5 focus-visible:border-accent dark:hover:border-accent-dark/70 dark:hover:bg-accent-dark/10 dark:focus-visible:border-accent-dark"
              style={{ left: r.left - 10, top: r.top - 10, width: r.width + 20, height: r.height + 20 }}
            />
          ))}
        </div>
      )}

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
          <button
            type="button"
            onClick={() => setOverview((o) => !o)}
            aria-label={overview ? 'Return to the current section' : 'See the whole flight path'}
            aria-pressed={overview}
            title={overview ? 'Back to section' : 'Whole flight at a glance'}
            className={`ml-1 transition ${
              overview
                ? 'text-accent dark:text-accent-dark'
                : 'text-grey-600 hover:text-accent dark:text-grey-300 dark:hover:text-accent-dark'
            }`}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-18 12 12)" />
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
        <div className="font-mono text-[10px] text-grey-500/80">
          {/* touch screens have no arrow keys or wheel: swap the verbs */}
          {window.matchMedia('(pointer: coarse)').matches
            ? overview
              ? 'tap a panel to fly to it · pinch in to return'
              : 'swipe · tap a dim panel · pinch out for the map'
            : overview
              ? 'click a panel to fly to it · pinch in or esc to return'
              : 'scroll · ← → · pinch out to see the whole flight'}
        </div>
      </div>
    </main>
  )
}
