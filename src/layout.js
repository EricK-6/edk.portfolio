import { createContext, useContext } from 'react'

// Which page layout is active:
//   'box'    - one section per page, with the minimap + directional grid nav
//   'scroll' - the classic single long page; nav links scroll to anchors
//   'space'  - sections float in a 3D starfield; the camera flies between them
export const LayoutContext = createContext('box')

export const useLayout = () => useContext(LayoutContext)
