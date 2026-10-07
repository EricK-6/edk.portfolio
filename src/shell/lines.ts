// What the terminal prints: lines made of segments.
//
// A segment is text with, optionally, a tone, a colour, or something it does
// when pressed — run a command, open a link, download a file. Keeping output
// as data rather than JSX is what makes two things possible: every name the
// shell prints can be a button (so a visitor who has never used a terminal
// can still click their way around it), and output can be piped, because the
// plain text of any line is just its segments joined.

export type Tone = 'dim' | 'strong' | 'accent' | 'ok' | 'warn'

export interface Seg {
  text: string
  tone?: Tone
  color?: string // a literal colour, for neofetch's swatches
  run?: string // pressing it runs this command
  href?: string // pressing it opens this link in a new tab
  download?: boolean // with href: download it rather than open it
  // the first segment of a line only: rendered as a fixed column, so the
  // rest of the line wraps with a hanging indent. Keep it short (a bullet,
  // a type letter, a commit hash): it never wraps itself.
  gutter?: boolean
}

export type Line = Seg[]

export const t = (text: string, tone?: Tone): Seg => ({ text, tone })
export const dim = (text: string): Seg => ({ text, tone: 'dim' })
export const strong = (text: string): Seg => ({ text, tone: 'strong' })
export const accent = (text: string): Seg => ({ text, tone: 'accent' })
export const cmd = (text: string, run = text): Seg => ({ text, run })
export const link = (text: string, href: string): Seg => ({ text, href })

// A line from plain strings and segments mixed.
export const L = (...parts: (string | Seg)[]): Line => parts.map((p) => (typeof p === 'string' ? { text: p } : p))

export const plain = (line: Line) => line.map((s) => s.text).join('')

// `**bold**` in content becomes a strong segment, the same emphasis the page
// gives it.
export function rich(text: string): Line {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? strong(part) : { text: part }))
}

// A bullet whose wrapped lines hang under the text, not under the dot.
export const bullet = (...parts: (string | Seg)[]): Line => [{ text: '· ', tone: 'dim', gutter: true }, ...L(...parts)]
