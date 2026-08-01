import { createContext, useContext } from 'react'

// There is one layout: 'tile' — every section rides the sunrise photo as its
// own frosted glass tile, and travel between them is vertical. The context is
// kept (rather than deleted) because sections still ask whether they are being
// rendered into a tile, which is tighter than document spacing: the print
// document renders the same components with `'page'` instead.
export const LayoutContext = createContext('tile')

export const useLayout = () => useContext(LayoutContext)

// Whether the section is the tile currently on stage. Lets media (the project
// demo videos) pause instead of looping out of sight.
export const PanelActiveContext = createContext(true)

export const usePanelActive = () => useContext(PanelActiveContext)
