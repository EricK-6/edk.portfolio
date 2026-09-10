import { useEffect, useState } from 'react'

// The site is one scrolling document. Every section is an <section id="...">
// in reading order, so navigation is nothing but anchors.
//
// This replaces a hash router that gave each section its own route and moved
// between them by hijacking the wheel. That is what made the site feel
// unstable: a trackpad flick emits momentum events for a second or more, and
// a gesture that was meant to read the end of a section instead teleported
// past it. A document has none of those failure modes, and it gets the
// scrollbar, Cmd+F, Back, and deep links back for free.
//
// Smooth scrolling and the header offset are pure CSS (`scroll-behavior` and
// `scroll-padding-top` in index.css), so a plain <a href="#about"> is the
// whole navigation implementation. No click handler, nothing to keep in sync.

// Old links and bookmarks used the '#/about' route form. Rewrite them to the
// anchor form once on boot, before React paints, so an existing bookmark
// still lands on the right section instead of at the top of the page.
export function upgradeLegacyHash() {
  const h = window.location.hash
  if (!h.startsWith('#/')) return
  const id = h.slice(2)
  // '#/' was home; anything else was a section id
  window.location.replace(`${window.location.pathname}${window.location.search}#${id || 'top'}`)
}

// Jump to a section. Setting the hash is deliberate rather than calling
// scrollIntoView: it goes through the same CSS smooth-scroll and
// scroll-padding the anchors use, it leaves a history entry so Back works,
// and it puts the section in the address bar so the URL is copyable.
export function goTo(id) {
  window.location.hash = id === 'home' ? 'top' : id
}

// Landing on a deep link.
//
// The browser scrolls to a fragment while parsing the document — which, in a
// client-rendered app, is before any of the sections exist. So arriving at
// `erickk.cloud/#projects` found no `#projects` to scroll to and silently left
// the reader at the top of the page. Every deep link on the site, and every
// link anyone has already shared, was landing on the intro.
//
// So the landing is redone once React has painted. `instant` on purpose: the
// CSS smooth-scroll is for clicks made on the page, and animating a 7,000px
// journey the moment a page opens is motion nobody asked for.
export function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent((window.location.hash || '').slice(1))
    if (!id) return

    let cancelled = false
    // Late media (four videos and eight stills) changes the height of the
    // document after first paint, so the first landing can drift. It is
    // retried — but never once the reader has taken over, or the page would
    // yank itself back under them.
    let taken = false
    const takeOver = () => { taken = true }

    const land = () => {
      if (cancelled || taken) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }

    // a hash naming nothing should not stay in the address bar for the
    // visitor to copy or bookmark
    const tidy = () => {
      if (cancelled || document.getElementById(id)) return
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    for (const ev of ['wheel', 'touchstart', 'keydown']) {
      window.addEventListener(ev, takeOver, { passive: true, once: true })
    }
    const frame = requestAnimationFrame(land)
    const timer = setTimeout(() => { land(); tidy() }, 300)
    window.addEventListener('load', land)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      window.removeEventListener('load', land)
      for (const ev of ['wheel', 'touchstart', 'keydown']) {
        window.removeEventListener(ev, takeOver)
      }
    }
  }, [])
}

// Which section the reader is currently in, for the navbar's contents index.
//
// One rAF-throttled scroll listener that measures every section and picks the
// last one to have passed under the header. Deriving the answer from all the
// rects at once — rather than from whichever element happened to fire an
// event — is what keeps it from flickering between two neighbours mid-scroll.
//
// `ids` must be a stable reference (a module-level constant); an array built
// inline in render would retrigger this effect on every render.
export function useActiveSection(ids, offset = 96) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean)
      if (!nodes.length) return

      let current = nodes[0]
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= offset) current = node
      }
      // The last section is often too short to ever reach the band, so it
      // would never light up. Hitting the bottom of the document counts as
      // being in it.
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActive(atEnd ? nodes[nodes.length - 1].id : current.id)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    measure()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids, offset])

  return active
}
