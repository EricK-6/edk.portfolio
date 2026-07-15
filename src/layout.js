import { createContext, useContext } from 'react'

// Which page layout is active:
//   'scroll' - the classic single long page; nav links scroll to anchors
//   'space'  - sections float in a 3D starfield; the camera flies between them
export const LayoutContext = createContext('space')

export const useLayout = () => useContext(LayoutContext)
