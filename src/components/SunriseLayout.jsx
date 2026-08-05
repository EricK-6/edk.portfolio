import { useEffect, useRef, useState } from 'react'
import { PanelActiveContext } from '../layout.js'
import { navigate } from '../router.js'

// The sunrise stage. One photograph is fixed behind the whole site and every
// section rides on top of it as a single frosted glass tile.
//
// Deliberately not a 3D scene. The layout this replaced parked its panels on
// an orbit inside nested preserve-3d contexts, which is what made travel
// direction feel arbitrary and — worse — made Chrome resolve clicks to a
// wrapper instead of the controls painted on the tile. Everything here is
// ordinary 2D flow, so a tile's hit box is exactly where it is drawn.

// Matches the 760ms tile-rise / tile-descend animations in index.css. A shorter
// lock let a second wheel notch land while the tile was still settling, which
// restarted the animation from its first keyframe.
const RISE_MS = 760

export default function SunriseLayout({ order, components, id }) {
  const index = Math.max(0, order.indexOf(id))
  const Component = components[id]
  const home = id === 'home'

  // +1 travelling forward (the next tile rises from below), -1 going back
  // (the previous one lowers from above). One axis, always.
  //
  // Derived during render, not in an effect: `key` remounts the tile the moment
  // the route changes, so a direction that only arrives afterwards meant every
  // backward move painted one frame of the forward animation and then swapped
  // class mid-flight — which restarts the animation from opacity 0, and reads
  // as a flicker. Adjusting state during render re-renders before the browser
  // paints, so the tile mounts already knowing which way it is going.
  const [dir, setDir] = useState(1)
  const [seenIndex, setSeenIndex] = useState(index)
  if (index !== seenIndex) {
    setDir(index > seenIndex ? 1 : -1)
    setSeenIndex(index)
  }

  const scroller = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

  // land at the top of each tile after every move
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [id])

  const go = (delta) => {
    const next = indexRef.current + delta
    if (next < 0 || next >= order.length) return false
    navigate(order[next])
    return true
  }

  // wheel / keys / touch: the tile scrolls its own content first, and only a
  // push past its top or bottom edge moves to the neighbouring tile
  useEffect(() => {
    const modalOpen = () => document.body.style.overflow === 'hidden'
    const typing = () => {
      const el = document.activeElement
      return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
    }
    // A panel that scrolls its own content and must never be mistaken for the
    // page: the terminal dock. It marks itself, rather than being sniffed for,
    // so a wheel inside it scrolls its log and nothing else.
    const inOwnScroller = (node) => !!node?.closest?.('[data-travel-ignore]')

    // A tile scrolls its own content first; only a push past its top or bottom
    // edge travels. Sections do overflow — Leadership on a phone runs hundreds
    // of pixels past the tile — so this is the normal path, not a fallback.
    const scrollable = () => {
      const s = scroller.current
      return !!s && getComputedStyle(s).overflowY !== 'hidden' && s.scrollHeight > s.clientHeight + 2
    }
    const atTop = () => !scrollable() || scroller.current.scrollTop <= 2
    const atBottom = () => {
      if (!scrollable()) return true
      const s = scroller.current
      return s.scrollTop + s.clientHeight >= s.scrollHeight - 2
    }

    let lock = 0
    const throttled = (delta) => {
      const now = Date.now()
      if (now < lock) return
      if (go(delta)) lock = now + RISE_MS
    }

    // Keys are blocked while a field has focus — the terminal's own prompt uses
    // the arrows for its history. The wheel is not: the dock is a side panel
    // with the page fully visible beside it, and holding focus in its prompt
    // used to make the whole site look frozen to a trackpad.
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || modalOpen() || typing()) return
      if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); throttled(1) }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); throttled(-1) }
      else if (e.key === 'PageDown') { e.preventDefault(); throttled(1) }
      else if (e.key === 'PageUp') { e.preventDefault(); throttled(-1) }
    }
    const gestureBlocked = (target) => modalOpen() || inOwnScroller(target)
    const onWheel = (e) => {
      if (gestureBlocked(e.target)) return
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax > ay) return // travel is one vertical axis; sideways is never it
      if (ay < 18) return
      if (e.deltaY > 0 && atBottom()) throttled(1)
      else if (e.deltaY < 0 && atTop()) throttled(-1)
    }
    // A swipe is judged by where it started as well as where it ended: without
    // the opening edge, the same flick that scrolls a tile to its bottom also
    // counts as the push past it, and the visitor overshoots the section they
    // were reading.
    let touchY = null
    let startedAtTop = false
    let startedAtBottom = false
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null
      startedAtTop = atTop()
      startedAtBottom = atBottom()
    }
    const onTouchEnd = (e) => {
      const from = touchY
      touchY = null
      if (from == null || gestureBlocked(e.target)) return
      const dy = from - (e.changedTouches[0]?.clientY ?? from)
      if (Math.abs(dy) < 60) return
      if (dy > 0 && startedAtBottom && atBottom()) throttled(1)
      else if (dy < 0 && startedAtTop && atTop()) throttled(-1)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
    // handlers read live position through refs, so they bind once
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // No padding for the terminal dock here: the app wrapper already reserves
    // that width, and applying it in both places pushed the tile twice as far
    // as the dock is wide. The backdrop is fixed, so the photograph still
    // fills the viewport while the tile re-centres in what is left.
    <main className="relative flex-1">
      <SunriseBackdrop soft={home} />

      {/* The intro is not a tile: it sits straight on the photograph, and the
          first tile then rises over it. `key` remounts on every move so the
          rise/descend animation replays.
          Tile mode tightens the spacing so a section aims to fit its screen —
          but aiming is not arriving, and when it overflows the tile scrolls
          rather than swallowing the rest. It was clipped before: on a phone
          that silently ate three of the five Leadership entries and half the
          Contact page, with no scrollbar and no way to reach them. */}
      <div className="stage-min flex items-center justify-center px-4 py-4 sm:px-6">
        {home ? (
          <div key={id} className={`w-full max-w-3xl ${dir > 0 ? 'tile-rise' : 'tile-descend'}`}>
            <PanelActiveContext.Provider value>
              <Component />
            </PanelActiveContext.Provider>
          </div>
        ) : (
          <div
            key={id}
            className={`glass-tile w-full max-w-5xl overflow-hidden ${dir > 0 ? 'tile-rise' : 'tile-descend'}`}
          >
            <div
              ref={scroller}
              className="tile-max overflow-y-auto overscroll-contain"
            >
              <div className="tile-contents">
                <PanelActiveContext.Provider value>
                  <Component />
                </PanelActiveContext.Provider>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// The photograph, fixed behind everything. A gentle white wash on top keeps
// the blown-out sun from fighting the tile that sits over it.
//
// `soft` is for the intro, which has no tile to sit on. Rather than paint a
// panel behind the words, the photograph itself steps back: it defocuses a
// little and a wide haze settles over the whole frame, the way a lens racks
// focus to the foreground. The readability comes from the same place the
// atmosphere does, so there is no shape on screen to notice.
function SunriseBackdrop({ soft = false }) {
  return (
    <div className="sunrise-backdrop fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <img
        src="./qt.jpg"
        srcSet="./qt-sm.jpg 1000w, ./qt.jpg 2000w"
        sizes="100vw"
        alt=""
        decoding="async"
        fetchPriority="high"
        className={`h-full w-full object-cover transition-[filter,transform] duration-700 ease-out ${
          soft ? 'scale-[1.03] blur-[5px]' : ''
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-white/35" />
      {/* the intro's haze: full-frame, so it has no edge to read as a shape */}
      <div
        className={`hero-haze absolute inset-0 transition-opacity duration-700 ease-out ${
          soft ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

