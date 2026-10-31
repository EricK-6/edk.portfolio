// The site is four pages. Each section keeps its own anchor id, and the URL
// hash is still that id ('#skills'), so every old link and bookmark lands on
// the right page and scrolls to the right place: the page is whichever one
// holds the section.

export type SectionId =
  | 'home' | 'about' | 'experience'
  | 'projects' | 'skills'
  | 'education' | 'certifications' | 'volunteering'
  | 'contact'

export type PageId = 'home' | 'work' | 'background' | 'contact'

export interface Page {
  id: PageId
  label: string
  // in reading order; the first is where the page opens
  sections: readonly SectionId[]
}

export const PAGES: readonly Page[] = [
  { id: 'home', label: 'Home', sections: ['home', 'about', 'experience'] },
  { id: 'work', label: 'Projects', sections: ['projects', 'skills'] },
  { id: 'background', label: 'Background', sections: ['education', 'certifications', 'volunteering'] },
  { id: 'contact', label: 'Contact', sections: ['contact'] },
]


// The pages listed in the nav. Home is left out: the name in the corner is
// the way back to it.
export const NAV_PAGES = PAGES.filter((p) => p.id !== 'home')

// The intro's anchor. 'home' is the id the rest of the app uses for it; 'top'
// is what it is called in the document, so the URL reads '#top'.
export const anchorOf = (id: SectionId) => (id === 'home' ? 'top' : id)

// Every link on the site is a plain anchor; the router decides which page
// holds it.
export const hrefFor = (id: SectionId) => `#${anchorOf(id)}`

export const pageHref = (page: Page) => hrefFor(page.sections[0])

// A project's slug is an anchor inside Projects, so the terminal can deep-link
// to one; anything else that names no section is the intro.
export function pageOfAnchor(anchor: string, extra: Record<string, PageId> = {}): Page {
  const direct = PAGES.find((p) => p.sections.some((s) => anchorOf(s) === anchor))
  if (direct) return direct
  const id = extra[anchor]
  return PAGES.find((p) => p.id === id) ?? PAGES[0]
}
