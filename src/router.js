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

const hashFor = (route) => (route === 'home' ? '#/' : `#/${route}`)

export function navigate(route) {
  window.location.hash = hashFor(route)
}

// Same destination, but without leaving a history entry behind. Used to tidy a
// hash that names no page ('#/nonsense') back to '#/': the visitor already sees
// home, so the URL should say so, and Back should still return them to wherever
// they actually came from rather than to the address that never existed.
export function replaceRoute(route) {
  if (window.location.hash === hashFor(route)) return
  window.location.replace(hashFor(route))
}

// Go to a section: every section is its own tile, so this is just a route.
export function goTo(id) {
  navigate(id)
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
