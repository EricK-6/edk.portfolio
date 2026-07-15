import { useSyncExternalStore } from 'react'
import { MENU_IDS } from './sitemap.js'

// Passport stamps: which of the nine stops the visitor has seen, shared
// app-wide and remembered across visits. Kept at module scope (like
// nameReveal.js) so the widget, the hero's VIP-passenger stamp, and the
// navbar flight path all react to the same progress.

export const STAMP_IDS = MENU_IDS // home + the eight sections, reading order

let visited = new Set()
try {
  const saved = JSON.parse(localStorage.getItem('passport') || '[]')
  visited = new Set(saved.filter((id) => STAMP_IDS.includes(id)))
} catch { /* private mode / bad data */ }

const subscribers = new Set()

export function markVisited(id) {
  if (!STAMP_IDS.includes(id) || visited.has(id)) return
  visited = new Set(visited).add(id) // replaced, not mutated: it's the snapshot
  try { localStorage.setItem('passport', JSON.stringify([...visited])) } catch { /* private mode */ }
  subscribers.forEach((fn) => fn())
}

const getVisited = () => visited

export function useVisited() {
  return useSyncExternalStore(
    (cb) => { subscribers.add(cb); return () => subscribers.delete(cb) },
    getVisited,
    getVisited,
  )
}

export const isVipPassenger = (set = visited) => set.size >= STAMP_IDS.length
