// Which controls visitors actually use, counted as GoatCounter events.
//
// The script tag in index.html counts the one pageview. This adds a named
// event for the clicks worth knowing about: which résumé gets opened, which
// demos and repos, whether anyone reads a build log, opens the terminal or
// presses ⌘K. Every decision about the page so far has been made by taste;
// these are the numbers to check the next one against.
//
// Event names are stable, lowercase paths (`resume-software`, `demo-spottern`,
// `terminal-cmd-ls`) so the GoatCounter dashboard groups them. Nothing about
// the visitor is sent beyond what the pageview already sends, and count.js
// ignores localhost by itself, so local clicking never pollutes the numbers.

interface GoatCounter {
  count?: (vars: { path: string; title?: string; event?: boolean }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

export function track(event: string) {
  try {
    window.goatcounter?.count?.({ path: event, title: event, event: true })
  } catch {
    /* blocked or not loaded yet: there is nothing to count with */
  }
}

// One listener for the whole document: anything carrying `data-track` reports
// its name when clicked. Captured, so a handler that stops propagation (the
// card flips, the modal) cannot swallow it, and on `auxclick` too, because a
// middle-click opening a demo in a new tab is still a click on the demo.
export function trackClicks() {
  const onClick = (e: MouseEvent) => {
    if (e.type === 'auxclick' && e.button !== 1) return // right-click is not a choice
    const el = e.target instanceof Element ? e.target.closest('[data-track]') : null
    const name = el?.getAttribute('data-track')
    if (name) track(name)
  }
  document.addEventListener('click', onClick, true)
  document.addEventListener('auxclick', onClick, true)
}
