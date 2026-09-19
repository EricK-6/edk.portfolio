// The site's sections, in reading order. One scrolling document, so these are
// anchors on the page rather than routes — 'home' is the intro at the top.

export const LABELS: Record<SectionId, string> = {
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

// Reading order, home first: the navbar's contents index, the mobile menu and
// the command palette all walk this.
export const MENU_IDS = [
  'home', 'about', 'projects', 'experience', 'skills',
  'education', 'certifications', 'leadership', 'contact',
] as const

export type SectionId = (typeof MENU_IDS)[number]

// Home is the cover, so it is not numbered; the eight sections run 01 to 08.
// Module-level and frozen because `useActiveSection` keys an effect on it.
export const SECTION_IDS = MENU_IDS.filter((id) => id !== 'home')

// The intro's anchor. 'home' is the id the rest of the app uses for it; 'top'
// is what it is called in the document, so the URL reads '#top'.
export const anchorOf = (id: SectionId) => (id === 'home' ? 'top' : id)

// Every link on the site is a plain anchor into the same document.
export const hrefFor = (id: SectionId) => `#${anchorOf(id)}`

// What the scrollspy watches: the anchor ids as they actually appear in the
// document, intro included. It has to be the anchors, not MENU_IDS — the
// intro's element is <section id="top">, so looking up 'home' found nothing,
// the intro dropped out of the list, and 'About' was reported as the current
// section while the reader was still looking at the photograph.
export const SPY_IDS = MENU_IDS.map(anchorOf)
