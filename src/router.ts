import { useEffect, useState } from 'react'
import { PROFILE, PROJECTS } from './content'
import { pageOfAnchor, type Page, type PageId } from './sitemap'

// The site is four pages, each a scrolling document of its own sections.
// Navigation is still nothing but anchors: '#skills' names a section, and the
// page that holds it is the one that renders. Pages scroll normally; the wheel
// is never reinterpreted as travel between them (an earlier router did that,
// and a trackpad's momentum events teleported readers past what they were
// reading).
//
// Smooth scrolling and the header offset are pure CSS (`scroll-behavior` and
// `scroll-padding-top` in index.css), so a link within a page is a plain
// <a href="#skills">.

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
export function goTo(id: string) {
  window.location.hash = id === 'home' ? 'top' : id
}

// A project's slug is an anchor inside Projects, so the terminal can deep-link
// to one.
const EXTRA: Record<string, PageId> = Object.fromEntries(PROJECTS.map((p) => [p.slug, 'work' as PageId]))

const anchorNow = () => decodeURIComponent((window.location.hash || '').slice(1))

// The page the URL points at, kept in step with the address bar. On every
// change of page the reader lands where the link points: the top of the page
// for a page's opening section, otherwise the section itself. A move within
// a page is left to the browser's own anchor scroll.
//
// `instant` on purpose: the CSS smooth-scroll is for clicks on the page, and
// animating a long journey across a page swap is motion nobody asked for.
export function usePage(): Page {
  const [anchor, setAnchor] = useState(anchorNow)
  useEffect(() => {
    const onChange = () => setAnchor(anchorNow())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const page = pageOfAnchor(anchor, EXTRA)

  useEffect(() => {
    document.title = page.id === 'home' ? PROFILE.name : `${page.label} · ${PROFILE.name}`

    const target = anchor && anchor !== 'top' ? anchor : null
    const land = () => {
      const el = target ? document.getElementById(target) : null
      if (el && !(page.sections[0] === target)) el.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    }

    // Late media changes the height of the page after first paint, so the
    // landing is retried — but never once the reader has taken over, or the
    // page would yank itself back under them.
    let taken = false
    const takeOver = () => { taken = true }
    for (const ev of ['wheel', 'touchstart', 'keydown']) {
      window.addEventListener(ev, takeOver, { passive: true, once: true })
    }
    const frame = requestAnimationFrame(land)
    const timer = setTimeout(() => {
      if (!taken) land()
      // a hash naming nothing should not stay in the address bar for the
      // visitor to copy or bookmark
      if (target && !document.getElementById(target)) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }, 300)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      for (const ev of ['wheel', 'touchstart', 'keydown']) {
        window.removeEventListener(ev, takeOver)
      }
    }
    // keyed on the page: a hash change within a page is the browser's job
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id])

  return page
}
