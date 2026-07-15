import { useSyncExternalStore } from 'react'

// Progress of the hero "type my name" challenge, shared app-wide. Kept at module
// scope so it (a) survives the Hero remounting on layout switches / space-mode
// navigation, and (b) lets the navbar hints disappear once the name is typed.
export const NAME = 'Eric Kim'

let typed = 0
const subscribers = new Set()

export function getNameTyped() {
  return typed
}

export function setNameTyped(n) {
  const next = Math.max(0, Math.min(n, NAME.length))
  if (next === typed) return
  typed = next
  subscribers.forEach((fn) => fn())
}

export function useNameTyped() {
  return useSyncExternalStore(
    (cb) => { subscribers.add(cb); return () => subscribers.delete(cb) },
    getNameTyped,
    getNameTyped,
  )
}
