// The site as a 3x3 spatial grid. Home (the bento) is the top-left cell; the
// other eight cells are the section pages. A page's position here drives both
// the navbar minimap and the up/down/left/right directional nav at the bottom
// of each page — moving in a direction goes to the adjacent cell, and edges
// (no neighbour) simply show no arrow.
//
//   Home        About          Experience
//   Education   Projects       Skills
//   Leadership  Credentials    Contact
export const GRID = [
  ['home', 'about', 'experience'],
  ['education', 'projects', 'skills'],
  ['leadership', 'certifications', 'contact'],
]

export const LABELS = {
  home: 'Home',
  about: 'About',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  leadership: 'Leadership',
  certifications: 'Credentials',
  contact: 'Contact',
}

// Short initials for the minimap cells. Two letters where single ones would
// collide (Experience/Education, Credentials/Contact).
export const INITIALS = {
  home: 'H',
  about: 'A',
  experience: 'Ex',
  education: 'Ed',
  projects: 'P',
  skills: 'S',
  leadership: 'L',
  certifications: 'Cr',
  contact: 'Co',
}

// The eight section ids in reading order (everything except home).
export const SECTION_IDS = GRID.flat().filter((id) => id !== 'home')

export function positionOf(id) {
  for (let row = 0; row < GRID.length; row++) {
    const col = GRID[row].indexOf(id)
    if (col !== -1) return { row, col }
  }
  return null
}

export function cellAt(row, col) {
  return GRID[row]?.[col] ?? null
}

// Hash for a page link. In 'box' mode it's a route ('#/', '#/about'); in
// 'scroll' mode it's the on-page anchor ('#top', '#about').
export const hrefFor = (id, layout = 'box') => {
  if (layout === 'scroll') return id === 'home' ? '#top' : `#${id}`
  return id === 'home' ? '#/' : `#/${id}`
}
