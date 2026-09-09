import { useEffect, useRef } from 'react'

// A cursor of the site's own.
//
// Two parts, because one is not enough to say anything: a small solid dot that
// is exactly where the pointer is, and a ring that arrives a beat later. The
// dot keeps the precision a pointer has to have; the ring is what carries the
// expression — it swells and turns teal over anything you can act on, tightens
// when you press, and gets out of the way entirely over a text field, where the
// system's own I-beam says something this cannot.
//
// It replaces the native arrow only where a native arrow exists to replace:
// `pointer: fine` gates the whole thing, so a phone, a tablet and anything
// driven by touch keep their own behaviour untouched and pay nothing for this.
// Under `prefers-reduced-motion` the ring stops lagging and simply tracks —
// the cursor is not decoration and should not vanish, but its trailing is.

const INTERACTIVE = 'a[href], button, [role="button"], [role="tab"], summary, label, select, [tabindex]:not([tabindex="-1"])'
const TEXTUAL = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    // A coarse pointer has no arrow to replace, and a device with no pointer at
    // all must never be handed one.
    if (!window.matchMedia?.('(pointer: fine)').matches) return undefined

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.classList.add('has-cursor')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let scale = 1
    let targetScale = 1
    let raf = 0
    let seen = false

    const setState = (el) => {
      const overText = !!el?.closest?.(TEXTUAL)
      const overHit = !overText && !!el?.closest?.(INTERACTIVE)
      // over a field the whole cursor stands down and `has-cursor` lets the
      // native caret back through (see index.css)
      document.documentElement.classList.toggle('cursor-text', overText)
      ring.dataset.hit = overHit ? 'true' : 'false'
      dot.dataset.hit = overHit ? 'true' : 'false'
      targetScale = overHit ? 1.55 : 1
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      if (!seen) { seen = true; rx = x; ry = y; ring.dataset.ready = 'true'; dot.dataset.ready = 'true' }
      setState(e.target instanceof Element ? e.target : null)
    }
    const onDown = () => { ring.dataset.press = 'true' }
    const onUp = () => { ring.dataset.press = 'false' }
    const onLeave = () => { ring.dataset.ready = 'false'; dot.dataset.ready = 'false' }
    const onEnter = () => { ring.dataset.ready = 'true'; dot.dataset.ready = 'true' }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const k = reduced ? 1 : 0.19
      rx += (x - rx) * k
      ry += (y - ry) * k
      scale += (targetScale - scale) * (reduced ? 1 : 0.16)
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    // the DOM under a still pointer changes on its own — a tile arrives, a
    // modal opens — and the ring should notice without being moved
    window.addEventListener('blur', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      window.removeEventListener('blur', onLeave)
      document.documentElement.classList.remove('has-cursor', 'cursor-text')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
