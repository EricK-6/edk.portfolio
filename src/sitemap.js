// The site as a 3x3 spatial grid. Home (the bento) is the centre cell; the
// other eight cells are the section pages. A page's position here drives both
// the navbar minimap and the edge arrows / arrow-key navigation — moving in a
// direction goes to the adjacent cell, and edges (no neighbour) show no arrow.
//
//   Education    About        Experience
//   Credentials  Home         Skills
//   Leadership   Projects     Contact
export const GRID = [
  ['education', 'about', 'experience'],
  ['certifications', 'home', 'skills'],
  ['leadership', 'projects', 'contact'],
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

// The eight section ids in reading order (everything except home).
export const SECTION_IDS = GRID.flat().filter((id) => id !== 'home')

// All pages in a sensible reading order (home first), used by the navbar's
// flight deck and the mobile menu — the grid above is laid out spatially,
// not in reading order.
export const MENU_IDS = [
  'home', 'about', 'projects', 'experience', 'skills',
  'education', 'certifications', 'leadership', 'contact',
]

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

// Hash for a page link. In 'space' mode it's a route ('#/', '#/about'); in
// 'scroll' mode it's the on-page anchor ('#top', '#about').
export const hrefFor = (id, layout = 'space') => {
  if (layout === 'scroll') return id === 'home' ? '#top' : `#${id}`
  return id === 'home' ? '#/' : `#/${id}`
}
