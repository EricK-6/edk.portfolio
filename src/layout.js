import { createContext, useContext } from 'react'

// Which page layout is active:
//   'scroll' - the classic single long page; nav links scroll to anchors
//   'space'  - sections float in a 3D starfield; the camera flies between them
export const LayoutContext = createContext('space')

export const useLayout = () => useContext(LayoutContext)

// Whether the section is on the space-mode panel the camera is parked at.
// Scroll mode renders everything "active", hence the default. Lets media
// (the project demo videos) pause instead of looping on far-away panels.
export const PanelActiveContext = createContext(true)

export const usePanelActive = () => useContext(PanelActiveContext)
