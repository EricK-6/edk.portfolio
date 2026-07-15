import { useEffect, useState } from 'react'

// Minimal hash-based router. The home page (the bento) lives at '#/' and every
// section is its own page at '#/<id>'. Hash routing keeps deep links and page
// refreshes working on static hosts (GitHub Pages) with no server rewrites,
// and plain <a href="#/about"> links navigate for free via the hashchange event.

// Read the current route id from the URL. '' / '#/' -> 'home'. Also tolerates
// the old bare-anchor form ('#about') so existing links/bookmarks still land.
export function parseRoute() {
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  return h || 'home'
}

export function navigate(route) {
  window.location.hash = route === 'home' ? '/' : `/${route}`
}

// Go to a section, doing the right thing for the active layout: route to its
// page in 'space' mode, or smooth-scroll to its anchor in 'scroll' mode (Hero's
// section id is 'top', so home maps to that).
export function goTo(id, layout) {
  if (layout === 'scroll') {
    const elId = id === 'home' ? 'top' : id
    const el = document.getElementById(elId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      history.replaceState(null, '', `#${elId}`)
    }
  } else {
    navigate(id)
  }
}

export function useRoute() {
  const [route, setRoute] = useState(parseRoute)
  useEffect(() => {
    const onChange = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
