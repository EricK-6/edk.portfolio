// The site as a filesystem, generated from content.ts.
//
// Every section is a directory and every project, role, credential and skill
// group is a file (each project is a directory of its own: README.md,
// stack.txt, build.log when it has one, and its demo and repo as links).
// Because it is built from the same data the page renders, `cat` can never
// say something the page doesn't — the old hand-written tree had a skills
// file months out of date.

import {
  CERTS, DEGREE, EXPERIENCE, HIGHLIGHTS, PROFILE, PROJECTS, RESUMES, ROLES, SCHOOL, SKILL_GROUPS,
  type Project,
} from '../content'
import { accent, bullet, dim, L, link, rich, strong, type Line } from './lines'

export interface FileNode { type: 'file'; body: () => Line[] }
export interface LinkNode { type: 'link'; href: string; label?: string }
export interface PdfNode { type: 'pdf'; href: string; resume: string }
export interface ExecNode { type: 'exec'; slug: string }
export interface DirNode {
  type: 'dir'
  // the page anchor `cd` scrolls to ('top' for ~)
  anchor: string
  children: Record<string, Node>
}
export type Node = FileNode | LinkNode | PdfNode | ExecNode | DirNode

const file = (body: () => Line[]): FileNode => ({ type: 'file', body })
const dir = (anchor: string, children: Record<string, Node>): DirNode => ({ type: 'dir', anchor, children })
const heading = (text: string): Line => L(strong(text))
const blank: Line = []

// Projects that can be "run": a replay of what they do, in the terminal.
export const EXECUTABLE = new Set(['spottern', 'sentiment-pulse'])

function projectDir(p: Project): DirNode {
  const children: Record<string, Node> = {
    'README.md': file(() => [
      heading(`# ${p.title}`),
      L(dim(p.role)),
      L(dim([p.tag, p.period ?? p.year].filter(Boolean).join(' · '))),
      blank,
      ...(p.highlights ?? []).map((h) => bullet(...rich(h))),
      ...(p.links.length ? [blank, ...p.links.map((l) => L(dim(`${/demo/i.test(l.label) ? 'demo' : 'repo'}  `), link(l.href.replace(/^https?:\/\//, '').replace(/\/$/, ''), l.href)))] : []),
      ...(p.log ? [blank, L(dim('the full story: '), { text: 'cat build.log', run: `cat ~/projects/${p.slug}/build.log` })] : []),
    ]),
    'stack.txt': file(() => [L((p.tech ?? []).join(', '))]),
  }
  if (p.log) {
    children['build.log'] = file(() => p.log!.flatMap((entry, i) => [
      ...(i ? [blank] : []),
      L(accent(entry.code)),
      ...(entry.flow ?? []).map((st, n) => L(dim(`${String(n + 1).padStart(2, '0')} `), strong(st.node), dim(`  ${st.does}`))),
      ...entry.body.map((para) => L(para)),
    ]))
  }
  for (const l of p.links) children[/demo/i.test(l.label) ? 'demo' : 'repo'] = { type: 'link', href: l.href }
  if (EXECUTABLE.has(p.slug)) children[p.slug] = { type: 'exec', slug: p.slug }
  return dir(p.slug, children)
}

export const ROOT: DirNode = dir('top', {
  'README.md': file(() => [
    heading(`# ${PROFILE.fullName}`),
    L('This is the page you are on, as a filesystem. Every section is a directory; `cd` into one and the page scrolls there.'),
    blank,
    L(dim('start with  '), { text: 'ls', run: 'ls' }, dim('  ·  '), { text: 'cat about/bio.md', run: 'cat about/bio.md' }, dim('  ·  '), { text: 'help', run: 'help' }),
    L(dim('or ask      '), { text: 'ask what have you built on aws?', run: 'ask what have you built on aws?' }),
  ]),
  about: dir('about', {
    'bio.md': file(() => [
      heading(`# ${PROFILE.fullName}`),
      L(`Penultimate-year ${DEGREE.award.split(' · ')[1]} student at ${DEGREE.school.replace(/^The /, 'the ')}, working across AI, cloud computing and robotics.`),
      L('Most of what I build ends up on AWS. Studying for the Solutions Architect certification changed how I get it there: I design for the failure modes now, rather than just wiring services together.'),
      L('Formerly a research assistant at CARES (robot soccer and navigation) and a robotics instructor at ciLab.'),
      blank,
      L(dim('based in '), PROFILE.city, dim(' · '), { text: 'cd ~/contact', run: 'cd ~/contact' }),
    ]),
    'highlights.txt': file(() => HIGHLIGHTS.map((h) => bullet(h))),
  }),
  projects: dir('projects', Object.fromEntries(PROJECTS.map((p) => [p.slug, projectDir(p)]))),
  experience: dir('experience', Object.fromEntries(EXPERIENCE.map((j) => [`${j.id}.md`, file(() => [
    heading(`# ${j.role} · ${j.org}`),
    L(dim(j.period)),
    ...(j.detail ? [L(accent(j.detail))] : []),
    blank,
    ...j.bullets.map((b) => bullet(b)),
  ])]))),
  skills: dir('skills', Object.fromEntries(SKILL_GROUPS.map((g) => [`${g.id}.txt`, file(() => [
    heading(`# ${g.label} (${g.items.length})`),
    L(g.items.join(', ')),
  ])]))),
  education: dir('education', {
    [`${DEGREE.id}.md`]: file(() => [
      heading(`# ${DEGREE.school}`),
      L(DEGREE.award),
      L(dim(`${DEGREE.city} · ${DEGREE.period}`)),
      blank,
      L(dim('concentrations  '), DEGREE.concentrations),
      L(dim('coursework      '), DEGREE.coursework.join(', ')),
    ]),
    [`${SCHOOL.id}.md`]: file(() => [
      heading(`# ${SCHOOL.school}`),
      L(SCHOOL.award),
      L(dim(`${SCHOOL.city} · ${SCHOOL.period}`)),
      L(SCHOOL.note),
      L(dim('diligence awards  '), SCHOOL.diligence.map((d) => `${d.syllabus} ${d.subject}`).join(', ')),
    ]),
  }),
  certifications: dir('certifications', Object.fromEntries(CERTS.map((c) => [`${c.id}.cert`, file(() => [
    heading(`# ${c.name}`),
    L(dim(`${c.issuer} · ${c.tier} · ${c.date}`)),
    L(c.description),
    L(dim('verify  '), link('credly.com ↗', c.credlyUrl)),
  ])]))),
  leadership: dir('leadership', Object.fromEntries(ROLES.map((r) => [`${r.id}.md`, file(() => [
    heading(`# ${r.title}${r.detail ? ` (${r.detail})` : ''}`),
    L(dim(`${r.org} · ${r.period}`)),
    L(r.description),
  ])]))),
  contact: dir('contact', {
    email: { type: 'link', href: `mailto:${PROFILE.email}`, label: PROFILE.email },
    github: { type: 'link', href: PROFILE.github.url, label: `github.com/${PROFILE.github.handle}` },
    linkedin: { type: 'link', href: PROFILE.linkedin.url, label: `linkedin.com/in/${PROFILE.linkedin.handle}` },
    ...Object.fromEntries(RESUMES.map((r) => [`cv-${r.id}.pdf`, { type: 'pdf', href: r.href, resume: r.id } as PdfNode])),
  }),
})

// --- paths -------------------------------------------------------------------

export function getNode(segs: string[]): Node | null {
  let node: Node = ROOT
  for (const s of segs) {
    if (node.type !== 'dir') return null
    const next: Node | undefined = node.children[s]
    if (!next) return null
    node = next
  }
  return node
}

// a cd/ls/cat argument (relative, absolute, ~, .., .) as a path array
export function resolve(cwd: string[], arg?: string): string[] {
  if (!arg || arg === '~' || arg === '/') return []
  const fromRoot = arg.startsWith('/') || arg.startsWith('~')
  let segs = fromRoot ? [] : [...cwd]
  for (const part of arg.replace(/^~/, '').split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') segs = segs.slice(0, -1)
    else segs = [...segs, part]
  }
  return segs
}

export const pathLabel = (segs: string[]) => (segs.length ? `~/${segs.join('/')}` : '~')

// Names people reach for that are not what the directory is called.
const ALIASES: Record<string, string[]> = {
  home: [], top: [], root: [], '~': [],
  work: ['experience'], jobs: ['experience'], job: ['experience'],
  credentials: ['certifications'], certs: ['certifications'], cert: ['certifications'],
  awards: ['projects'], project: ['projects'],
  school: ['education'], uni: ['education'], study: ['education'],
  me: ['about'], bio: ['about'], profile: ['about'],
  stack: ['skills'], tech: ['skills'],
  volunteering: ['leadership'], activities: ['leadership'],
  email: ['contact'], hire: ['contact'],
}

// `cd` is deliberately more forgiving than a real shell. This is a portfolio,
// not a filesystem: anything that names a section or a project gets you there
// from anywhere, so `cd skills` works from inside ~/projects/spottern, and so
// do `cd SKILLS`, `cd skil`, `cd stack` and `cd spottern`. Real paths resolve
// first, so `cd ..` and `cd ~` behave exactly as they always have.
export function findDir(cwd: string[], arg?: string): string[] | null {
  const raw = (arg || '').trim()
  if (!raw || raw === '~' || raw === '/') return []
  const isDir = (segs: string[]) => (getNode(segs)?.type === 'dir' ? segs : null)

  const literal = isDir(resolve(cwd, raw)) ?? isDir(resolve([], raw))
  if (literal) return literal

  const key = raw.replace(/^[~/.]+|\/+$/g, '').toLowerCase()
  if (key in ALIASES) return ALIASES[key]
  const project = findProject(key)
  if (project) return ['projects', project.slug]

  const names = Object.keys(ROOT.children).filter((n) => ROOT.children[n].type === 'dir')
  const exact = names.find((n) => n === key)
  if (exact) return [exact]
  const starts = names.filter((n) => n.startsWith(key))
  if (starts.length === 1) return [starts[0]]
  const has = names.filter((n) => n.includes(key))
  if (has.length === 1) return [has[0]]
  return null
}

// A project by slug, by a unique prefix of its slug or title, or by the short
// names people actually say ("pulse", "winnie", "keb").
export function findProject(raw: string): Project | null {
  const key = raw.toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!key) return null
  const by = (f: (p: Project) => boolean) => PROJECTS.filter(f)
  const hits =
    [by((p) => p.slug === key), by((p) => p.slug.startsWith(key)), by((p) => p.title.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(key)), by((p) => p.slug.split('-').includes(key))]
      .find((list) => list.length === 1)
  return hits?.[0] ?? null
}

// Every file, flattened with its path: what grep and ask search.
export function allFiles(node: Node = ROOT, path: string[] = []): { path: string[]; node: FileNode }[] {
  if (node.type === 'file') return [{ path, node }]
  if (node.type !== 'dir') return []
  return Object.entries(node.children).flatMap(([name, child]) => allFiles(child, [...path, name]))
}
