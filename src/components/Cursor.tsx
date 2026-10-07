import { useEffect, useRef } from 'react'

// A cursor of the site's own: a small dot exactly where the pointer is, and a
// short trail of fading dots behind it. It looks the same over everything: it
// never grows or changes when it reaches something clickable.
//
// The dot is moved straight from the pointer event, with no easing, so it can
// never lag the real pointer. The trail is a particle dropped at most every
// 30ms that fades and shrinks away over 0.6s and then removes itself, so
// nothing accumulates. Over a text field the whole thing stands down and the
// system's own I-beam shows through, which says something a dot cannot.
//
// It replaces the native arrow only where a native arrow exists to replace:
// `pointer: fine` gates all of it, so a phone, a tablet and anything driven
// by touch keep their own behaviour and pay nothing for this. Under
// `prefers-reduced-motion` the trail is dropped and the dot stays: the cursor
// is not decoration and should not vanish, but the trailing is motion.

const TEXTUAL = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
const TRAIL_EVERY_MS = 30
const TRAIL_LIFE_MS = 600

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A coarse pointer has no arrow to replace, and a device with no pointer at
    // all must never be handed one.
    if (!window.matchMedia?.('(pointer: fine)').matches) return undefined

    const dot = dotRef.current
    const trail = trailRef.current
    if (!dot || !trail) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.classList.add('has-cursor')

    let lastDrop = 0
    let overText = false

    const place = (x: number, y: number) => {
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const onMove = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null
      overText = !!el?.closest?.(TEXTUAL)
      document.documentElement.classList.toggle('cursor-text', overText)
      dot.dataset.ready = 'true'
      place(e.clientX, e.clientY)

      if (reduced || overText) return
      const now = performance.now()
      if (now - lastDrop < TRAIL_EVERY_MS) return
      lastDrop = now
      const p = document.createElement('div')
      p.className = 'cursor-particle'
      p.style.left = `${e.clientX}px`
      p.style.top = `${e.clientY}px`
      trail.appendChild(p)
      setTimeout(() => p.remove(), TRAIL_LIFE_MS)
    }
    const onLeave = () => { dot.dataset.ready = 'false' }
    const onEnter = () => { dot.dataset.ready = 'true' }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    // switching away from the window hides it until the pointer comes back
    window.addEventListener('blur', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      window.removeEventListener('blur', onLeave)
      trail.replaceChildren()
      document.documentElement.classList.remove('has-cursor', 'cursor-text')
    }
  }, [])

  return (
    <>
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
