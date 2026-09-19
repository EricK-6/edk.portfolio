import { useEffect, useState, type RefObject } from 'react'

// Is this element currently in the viewport?
//
// It exists for the project demo clips. They used to be gated on a
// `PanelActiveContext` — which section is the one tile on stage — because the
// old layout kept every section mounted and only ever showed one. A scrolling
// document has no such thing as "on stage", so the honest question is whether
// the video is actually on screen, and the answer keeps doing the same job:
// a looping clip three screens above the reader is pure battery drain.
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = '200px') {
  const [onScreen, setOnScreen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return onScreen
}
