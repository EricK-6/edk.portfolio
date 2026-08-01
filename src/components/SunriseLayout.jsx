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

const RISE_MS = 620

export default function SunriseLayout({ order, components, id }) {
  const index = Math.max(0, order.indexOf(id))
  const Component = components[id]
  const home = id === 'home'

  // +1 travelling forward (the next tile rises from below), -1 going back
  // (the previous one lowers from above). One axis, always.
  const [dir, setDir] = useState(1)
  const prevIndex = useRef(index)
  useEffect(() => {
    if (index !== prevIndex.current) {
      setDir(index > prevIndex.current ? 1 : -1)
      prevIndex.current = index
    }
  }, [index])

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
    const blocked = () => {
      if (document.body.style.overflow === 'hidden') return true // modal open
      const el = document.activeElement
      return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
    }
    // Tiles are clipped, not scrollable, and the intro is not even a tile —
    // so in practice both of these are always true and any wheel/swipe/arrow
    // travels. The scroll arithmetic is kept for the case where a tile does
    // overflow (a very short window): without the `scrollable` guard the tile
    // would report "not at the bottom" forever and strand the visitor there.
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
    // leave horizontally-scrollable strips (the Projects list on phones) alone
    const overScrollerX = (node) => {
      for (let el = node; el && el !== document.body; el = el.parentElement) {
        if (el.scrollWidth > el.clientWidth + 4) {
          const ox = getComputedStyle(el).overflowX
          if (ox === 'auto' || ox === 'scroll') return true
        }
      }
      return false
    }

    let lock = 0
    const throttled = (delta) => {
      const now = Date.now()
      if (now < lock) return
      if (go(delta)) lock = now + RISE_MS
    }

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || blocked()) return
      if (e.key === 'ArrowDown' && atBottom()) { e.preventDefault(); throttled(1) }
      else if (e.key === 'ArrowUp' && atTop()) { e.preventDefault(); throttled(-1) }
      else if (e.key === 'PageDown') { e.preventDefault(); throttled(1) }
      else if (e.key === 'PageUp') { e.preventDefault(); throttled(-1) }
    }
    const onWheel = (e) => {
      if (blocked()) return
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax > ay) {
        if (ax < 18 || overScrollerX(e.target)) return
        return
      }
      if (ay < 18) return
      if (e.deltaY > 0 && atBottom()) throttled(1)
      else if (e.deltaY < 0 && atTop()) throttled(-1)
    }
    let touchY = null
    const onTouchStart = (e) => { touchY = e.touches[0]?.clientY ?? null }
    const onTouchEnd = (e) => {
      if (touchY == null || blocked()) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (Math.abs(dy) < 60) return
      if (dy > 0 && atBottom()) throttled(1)
      else if (dy < 0 && atTop()) throttled(-1)
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
          Nothing scrolls inside a tile — a section either fits its screen or
          it is too loose, so the spacing is tightened in tile mode instead.
          The scroller ref stays for the wheel/key handlers, which treat a
          non-scrolling tile as permanently at both its top and bottom edge. */}
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-4 sm:px-6">
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
            <div ref={scroller} className="max-h-[calc(100vh-6.5rem)] overflow-hidden">
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

