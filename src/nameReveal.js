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

// The boarding pass prints the passenger name by itself shortly after load,
// so the name is never left grey for visitors who don't type (recruiters
// skimming, anyone on a phone). Manual typing remains as an easter egg:
// any keypress cancels the printer and hands the keyboard over.
let autoTimer = null
let autoStarted = false

export function autoCheckIn(delayMs = 900) {
  if (autoStarted || typed >= NAME.length) return
  autoStarted = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setNameTyped(NAME.length)
    return
  }
  const tick = () => {
    setNameTyped(getNameTyped() + 1)
    if (getNameTyped() < NAME.length) autoTimer = setTimeout(tick, 75)
  }
  autoTimer = setTimeout(tick, delayMs)
}

export function cancelAutoCheckIn() {
  clearTimeout(autoTimer)
  autoStarted = true // the visitor took the keyboard; don't restart
}
