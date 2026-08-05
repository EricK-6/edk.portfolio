// The site's pages, in one place. Home is the intro; the other eight are the
// sections, each its own hash route.
//
// This used to also describe the site as a 3x3 spatial grid, which drove a
// navbar minimap and edge arrows that moved you to the adjacent cell. Both are
// gone — travel is one vertical axis now and the navbar is a numbered contents
// list — so the grid and its lookups went with them rather than sitting here
// describing navigation the site no longer has.

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

// Every page in reading order, home first: the navbar's contents index, the
// mobile menu and the passport stamps all walk this.
export const MENU_IDS = [
  'home', 'about', 'projects', 'experience', 'skills',
  'education', 'certifications', 'leadership', 'contact',
]

// Hash for a page link. Every section is its own route ('#/', '#/about').
export const hrefFor = (id) => (id === 'home' ? '#/' : `#/${id}`)
