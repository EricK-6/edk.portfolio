// The shell: commands, pipes, and what happens when someone types something
// that isn't a command at all.
//
// Two kinds of visitor open this. Developers will try `ls -l`, `grep aws`,
// `git log` and `fortune | kiwisay`, and those should work the way their
// fingers expect. Everyone else will type `projects`, `hire` or "what have you
// built on aws?", and the shell should meet them there too: a typo gets a
// correction, a section or project name gets opened, and a question gets
// answered from the site's own content. Nothing here is a canned script, so
// it can never claim something the page doesn't.

import { CERTS, PROFILE, PROJECTS, RESUMES, SKILL_GROUPS } from '../content'
import { allFiles, EXECUTABLE, findDir, findProject, getNode, pathLabel, resolve, ROOT, type DirNode, type Node } from './fs'
import { accent, bullet, cmd, dim, L, link, plain, strong, t, type Line, type Seg } from './lines'
import { runPulse, runSpottern } from './replays'

export interface Ctx {
  cwd: string[]
  setCwd: (segs: string[]) => void
  print: (...lines: Line[]) => void // for output that arrives later
  clear: () => void
  close: () => void
  history: string[]
  goTo: (anchor: string) => void
  openProject: (slug: string, what: 'log' | 'details') => void
  openUrl: (href: string) => void
  download: (href: string) => void
  later: (fn: () => void, ms: number) => void // a timer the dock cancels on unmount
  small: boolean // a phone: page-moving commands get out of the way
}

// `piped`: something reads this output, so print it the way a pipe wants it
interface Io { ctx: Ctx; stdin: Line[] | null; out: Line[]; piped?: boolean }

interface Command {
  name: string
  aliases?: string[]
  group: Group
  usage: string
  summary: string
  filter?: boolean // reads stdin, so it can sit after a |
  live?: boolean // prints later, so it can't be piped from
  run: (args: string[], io: Io) => void
}

type Group = 'look around' | 'read' | 'about eric' | 'live' | 'play' | 'shell'
const GROUPS: Group[] = ['look around', 'read', 'about eric', 'live', 'play', 'shell']

const err = (name: string, msg: string, ...rest: Seg[]): Line => L(strong(`${name}: `), msg, ...rest)
const flags = (args: string[]) => ({ set: new Set(args.filter((a) => /^-\w/.test(a)).flatMap((a) => [...a.slice(1)])), rest: args.filter((a) => !/^-\w/.test(a)) })
const nOf = (args: string[], fallback = 10) => {
  const i = args.findIndex((a) => a === '-n')
  const n = i >= 0 ? Number(args[i + 1]) : Number((args.find((a) => /^-\d+$/.test(a)) ?? '').slice(1))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// --- names as buttons --------------------------------------------------------

// how a filesystem entry prints, and what pressing it does
function entry(name: string, node: Node, at: string[]): Seg {
  const p = pathLabel([...at, name])
  switch (node.type) {
    case 'dir': return { text: `${name}/`, tone: 'strong', run: `cd ${p}` }
    case 'exec': return { text: `${name}*`, tone: 'ok', run: `./${node.slug}` }
    case 'link': return { text: `${name}@`, run: `open ${p}` }
    default: return { text: name, run: `cat ${p}` }
  }
}

function highlight(text: string, re: RegExp): Seg[] {
  return text.split(re).map((part, i) => (i % 2 ? accent(part) : { text: part }))
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// --- search ------------------------------------------------------------------

const STOP = new Set('a an and any are as at be been by can could did do does eric for from have has how i in is it its me my of on or so tell that the their there this to us was what which who why with you your yours about ever here experience experiences built build made done worked work working stuff things thing anything some'.split(' '))
const SYNONYMS: Record<string, string[]> = {
  cloud: ['aws', 'lambda', 'serverless', 'dynamodb', 'bedrock', 'kinesis', 'terraform'],
  aws: ['lambda', 'bedrock', 'dynamodb', 'kinesis', 'comprehend', 'textract', 'amplify'],
  hardware: ['embedded', 'pcb', 'fpga', 'atmega328p', 'vhdl', 'altium', 'servos'],
  embedded: ['atmega328p', 'firmware', 'pcb', 'microcontrollers'],
  ai: ['bedrock', 'claude', 'comprehend', 'machine', 'nlp', 'camera'],
  ml: ['machine', 'learning', 'comprehend', 'forecasting', 'scikit-learn'],
  web: ['react', 'website', 'javascript', 'typescript', 'vite'],
  frontend: ['react', 'website', 'javascript', 'html/css'],
  robot: ['robotics', 'ros', 'turtlebot2', 'winnie', 'servos'],
  robots: ['robotics', 'ros', 'turtlebot2', 'winnie'],
  robotics: ['robot', 'ros', 'turtlebot2', 'winnie', 'servos', 'olympiad'],
  fraud: ['spottern', 'anomalies'],
  data: ['pandas', 'analytics', 'dynamodb', 'sql'],
  lead: ['leadership', 'executive', 'volunteered', 'led'],
  led: ['leadership', 'executive', 'lead', 'founding'],
  leadership: ['executive', 'founding', 'led', 'team'],
  award: ['place', 'finalist', 'awarded', 'diligence'],
  awards: ['place', 'finalist', 'awarded'],
  teach: ['instructor', 'tutorial', 'students'],
  game: ['flappy', 'fpga'],
  android: ['mealhub', 'java'],
}

function terms(q: string) {
  const words = q.toLowerCase().replace(/[^a-z0-9+#./ -]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
  return words.map((w) => w.replace(/'s$/, '')).filter(Boolean)
}

interface Hit { path: string[]; score: number; best: string }

function search(q: string, limit = 3): Hit[] {
  const ws = terms(q)
  if (!ws.length) return []
  const weighted = ws.flatMap((w) => [[w, 3], ...(SYNONYMS[w] ?? []).map((s) => [s, 1] as const)] as [string, number][])
  return allFiles()
    .map(({ path, node }) => {
      const lines = node.body().map(plain)
      const title = (path.join(' ') + ' ' + (lines[0] ?? '')).toLowerCase()
      const text = lines.join(' ').toLowerCase()
      let score = 0
      for (const [w, weight] of weighted) {
        const singular = w.length > 3 ? w.replace(/s$/, '') : w
        if (title.includes(singular)) score += 2 * weight
        if (text.includes(singular)) score += weight
      }
      const best = lines.slice(1).find((l) => weighted.some(([w]) => l.toLowerCase().includes(w))) ?? lines[0] ?? ''
      return { path, score, best }
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    // a weak third match is noise next to two strong ones
    .filter((h, _, all) => h.score >= all[0].score * 0.4)
    // A project is several files (README, stack, build log); a person asking
    // "what have you built on aws?" wants projects, not three stack.txt files.
    // So hits inside a project count once, as the project, at its best score.
    .filter((h, i, all) => h.path[0] !== 'projects' || all.findIndex((o) => o.path[0] === 'projects' && o.path[1] === h.path[1]) === i)
    .slice(0, limit)
}

function hitLines(hits: Hit[]): Line[] {
  return hits.flatMap((h) => {
    const project = h.path[0] === 'projects' ? PROJECTS.find((x) => x.slug === h.path[1]) : undefined
    if (project) {
      return [L(cmd(project.title, `open ${project.slug}`), dim(`  ${project.blurb}`)), L(dim('  '), cmd('README', `cat ~/projects/${project.slug}/README.md`), ...(project.log ? [dim(' · '), cmd('build.log', `cat ~/projects/${project.slug}/build.log`)] : []))]
    }
    const p = pathLabel(h.path)
    const snippet = h.best.replace(/^#\s*/, '')
    return [L(cmd(p, `cat ${p}`)), L(dim('  '), dim(snippet.length > 120 ? snippet.slice(0, 117) + '…' : snippet))]
  })
}

// Questions with one right answer go straight to it; everything else is a
// search of the files.
function answer(q: string, ctx: Ctx): Line[] {
  const s = q.toLowerCase()
  if (/\b(hire|hiring|available|availability|intern(ship)?s?|job|jobs|opportunit|open to|work with|collaborat)/.test(s)) {
    return [
      L("I'm open to interesting conversations, side projects and collaborations, so don't hesitate to reach out."),
      L(dim('email  '), link(PROFILE.email, `mailto:${PROFILE.email}`), dim('  ·  '), cmd('cv', 'cv'), dim('  ·  '), cmd('sudo hire-me')),
    ]
  }
  if (/\b(cv|resume|résumé)\b/.test(s)) return run1('cv', ctx)
  if (/\b(contact|email|reach|message|linkedin)\b/.test(s)) return run1('social', ctx)
  if (/\b(where|located|location|based|live|timezone|time is it)\b/.test(s)) {
    return [L(`${PROFILE.city}. It's `, strong(nzTime()), ' there now.')]
  }
  if (/\b(who are you|about you|yourself|introduce)\b/.test(s)) return run1('cat ~/about/bio.md', ctx)
  if (/\b(degree|study|studying|graduat|university|uni)\b/.test(s)) return run1('cat ~/education/uoa.md', ctx)
  if (/\b(certif|certs?\b|credential|qualified)/.test(s)) {
    return CERTS.map((c) => bullet(strong(c.name), dim(` · ${c.date} · `), link('verify ↗', c.credlyUrl)))
  }
  if (/\b(skills?|stack|languages?|tools|technologies|tech you)\b/.test(s)) {
    return SKILL_GROUPS.map((g) => [{ text: `${g.label}: `, tone: 'dim' as const }, t(g.items.join(', '))])
  }
  const hits = search(q)
  if (!hits.length) return [L(dim("nothing on the page matches that. try "), cmd('ls'), dim(', '), cmd('help'), dim(' or a single word, like '), cmd('grep aws'))]
  return [L(dim(`${hits.length === 1 ? 'the best match' : `the ${hits.length} best matches`} on the page:`)), ...hitLines(hits)]
}

const nzTime = () => {
  try { return new Intl.DateTimeFormat('en-NZ', { timeZone: PROFILE.timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()) }
  catch { return 'whatever time it is' }
}

// run one command line and collect what it prints (for answers that are
// really another command)
function run1(line: string, ctx: Ctx): Line[] {
  const out: Line[] = []
  const [name, ...args] = tokenize(line)
  find(name)?.run(args, { ctx, stdin: null, out })
  return out
}

// --- the commands ------------------------------------------------------------

const FORTUNES = [
  '"The most effective debugging tool is still careful thought, coupled with judiciously placed print statements." (Brian Kernighan)',
  '"Simplicity is prerequisite for reliability." (Edsger Dijkstra)',
  '"First, solve the problem. Then, write the code." (John Johnson)',
  '"Any sufficiently advanced technology is indistinguishable from magic." (Arthur C. Clarke)',
  '"Weeks of coding can save you hours of planning." (unknown)',
  "There are 10 types of people: those who understand binary and those who don't.",
  'It works on my machine. (every engineer, eventually)',
  'A clean solder joint is worth a thousand debug sessions.',
  'Kinesis delivers at least once. Plan accordingly.',
]

const relTime = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

const COMMANDS: Command[] = [
  {
    name: 'ls', group: 'look around', usage: 'ls [-l] [path]', summary: 'list a section, or every project with -l',
    run(args, { ctx, out, piped }) {
      const { set, rest } = flags(args)
      const segs = rest[0] ? (findDir(ctx.cwd, rest[0]) ?? resolve(ctx.cwd, rest[0])) : ctx.cwd
      const node = getNode(segs)
      if (!node) { out.push(err('ls', `no such file or directory: ${rest[0]}`)); return }
      if (node.type !== 'dir') { out.push(L(entry(segs.at(-1) ?? '', node, segs.slice(0, -1)))); return }
      const names = Object.keys(node.children)
      // one per line into a pipe, the way a real ls does, so grep can pick
      if (piped && !set.has('l')) { out.push(...names.map((n) => L(entry(n, node.children[n], segs)))); return }
      if (!set.has('l')) {
        out.push(names.flatMap((n, i) => [...(i ? [t('  ')] : []), entry(n, node.children[n], segs)]))
        return
      }
      const inProjects = segs.length === 1 && segs[0] === 'projects'
      for (const n of names) {
        const child = node.children[n]
        const meta =
          child.type === 'dir' ? (inProjects ? PROJECTS.find((p) => p.slug === n)?.blurb ?? '' : `${Object.keys(child.children).length} items`)
          : child.type === 'link' ? `→ ${child.href.replace(/^(https?:\/\/|mailto:)/, '')}`
          : child.type === 'pdf' ? 'pdf, downloads'
          : child.type === 'exec' ? 'runnable: a replay of the project'
          : `${child.body().length} lines`
        out.push([{ text: child.type === 'dir' ? 'd ' : child.type === 'link' ? 'l ' : child.type === 'exec' ? 'x ' : '- ', tone: 'dim', gutter: true }, entry(n, child, segs), dim(`  ${meta}`)])
      }
    },
  },
  {
    name: 'cd', group: 'look around', usage: 'cd <section|project>', summary: 'go there (the page scrolls with you)',
    run(args, { ctx, out }) {
      const segs = findDir(ctx.cwd, args[0])
      if (!segs) {
        out.push(err('cd', `no section called '${args[0]}'. try: `, ...Object.keys(ROOT.children).filter((n) => ROOT.children[n].type === 'dir').flatMap((n, i) => [...(i ? [dim(', ')] : []), cmd(n, `cd ${n}`)])))
        return
      }
      ctx.setCwd(segs)
      ctx.goTo((getNode(segs) as DirNode).anchor)
    },
  },
  { name: 'pwd', group: 'look around', usage: 'pwd', summary: 'where you are', run(_, { ctx, out }) { out.push(L(pathLabel(ctx.cwd))) } },
  {
    name: 'tree', group: 'look around', usage: 'tree [path]', summary: 'the whole site at a glance',
    run(args, { ctx, out }) {
      const segs = args[0] ? (findDir(ctx.cwd, args[0]) ?? resolve(ctx.cwd, args[0])) : ctx.cwd
      const node = getNode(segs)
      if (!node || node.type !== 'dir') { out.push(err('tree', `${args[0]}: not a directory`)); return }
      out.push(L(strong(pathLabel(segs))))
      let dirs = 0, files = 0
      const walk = (d: DirNode, at: string[], prefix: string) => {
        const names = Object.keys(d.children)
        names.forEach((n, i) => {
          const last = i === names.length - 1
          const child = d.children[n]
          out.push(L(dim(prefix + (last ? '└── ' : '├── ')), entry(n, child, at)))
          if (child.type === 'dir') { dirs++; walk(child, [...at, n], prefix + (last ? '    ' : '│   ')) } else files++
        })
      }
      walk(node, segs, '')
      out.push([], L(dim(`${dirs} directories, ${files} files`)))
    },
  },
  {
    name: 'open', group: 'look around', usage: 'open <project|section|cv|github|…>', summary: 'show it on the page (projects open their build log)',
    run(args, { ctx, out }) {
      const what = args.join(' ').trim()
      const go = (anchor: string) => { ctx.goTo(anchor); if (ctx.small) ctx.later(ctx.close, 450) }
      if (!what) { out.push(L(dim('usage: open <project|section|cv|github|linkedin|email>  e.g. '), cmd('open spottern'))); return }
      const key = what.toLowerCase()
      // a path first: `open .`, `open ~/projects/spottern/demo`
      const node = getNode(resolve(ctx.cwd, what))
      const project = findProject(key) ?? (node?.type === 'dir' ? findProject(node.anchor) : null)
      if (project) {
        const what2 = project.log ? 'log' : 'details'
        out.push(L(dim('→ '), project.title, dim(project.log ? ': opening its build log' : ': turning its card over')))
        ctx.goTo(project.slug)
        ctx.later(() => ctx.openProject(project.slug, what2), 500)
        if (ctx.small && !project.log) ctx.later(ctx.close, 450)
        return
      }
      if (node?.type === 'link') { out.push(L(dim('→ '), node.href)); ctx.openUrl(node.href); return }
      if (node?.type === 'pdf') { out.push(...run1(`cv ${node.resume}`, ctx)); return }
      if (/^(cv|resume|résumé)\b/.test(key)) { out.push(...run1(`cv ${key.split(/\s+/)[1] ?? ''}`, ctx)); return }
      if (key === 'github' || key === 'linkedin') { const url = PROFILE[key].url; out.push(L(dim('→ '), url)); ctx.openUrl(url); return }
      if (key === 'email' || key === 'mail') { out.push(L(dim('→ '), PROFILE.email)); ctx.openUrl(`mailto:${PROFILE.email}`); return }
      if (key === 'source' || key === 'repo') { out.push(L(dim('→ '), PROFILE.repo)); ctx.openUrl(PROFILE.repo); return }
      const cert = CERTS.find((c) => c.id.startsWith(key.replace(/\s+/g, '-')) || c.short.toLowerCase() === key)
      if (cert) { out.push(L(dim('→ verifying on Credly: '), cert.name)); ctx.openUrl(cert.credlyUrl); return }
      const segs = findDir(ctx.cwd, what)
      if (segs) { const d = getNode(segs) as DirNode; out.push(L(dim('→ '), pathLabel(segs))); go(d.anchor); return }
      out.push(err('open', `nothing called '${what}'. try `, cmd('ls ~/projects'), dim(' or '), cmd('open spottern')))
    },
  },
  {
    name: 'cat', group: 'read', usage: 'cat <file>', summary: 'read a file', filter: true,
    run(args, { ctx, stdin, out }) {
      if (!args.length) { if (stdin) out.push(...stdin); else out.push(L(dim('usage: cat <file>  e.g. '), cmd('cat ~/about/bio.md'))); return }
      for (const arg of args) {
        let segs = resolve(ctx.cwd, arg)
        let node = getNode(segs)
        // forgiving: `cat spottern` reads the project's README, and a file
        // name that exists exactly once anywhere is found from anywhere
        if (!node) {
          const project = findProject(arg)
          const unique = allFiles().filter((f) => f.path.at(-1) === arg)
          if (project) segs = ['projects', project.slug, 'README.md']
          else if (unique.length === 1) segs = unique[0].path
          node = getNode(segs)
        }
        if (node?.type === 'dir' && node.children['README.md']) { segs = [...segs, 'README.md']; node = getNode(segs) }
        if (!node) { out.push(err('cat', `${arg}: no such file. `, cmd('ls'), dim(' shows what is here'))); continue }
        if (node.type === 'dir') { out.push(err('cat', `${arg}: is a directory. try `, cmd(`ls ${arg}`))); continue }
        if (node.type === 'link') { out.push(L(link(node.label ?? node.href.replace(/^https?:\/\//, ''), node.href))); continue }
        if (node.type === 'pdf') { out.push(...run1(`cv ${node.resume}`, ctx)); continue }
        if (node.type === 'exec') { out.push(err('cat', `${arg}: binary file. run it: `, cmd(`./${node.slug}`))); continue }
        out.push(...node.body())
      }
    },
  },
  {
    name: 'grep', group: 'read', usage: 'grep [-v|-c|-l] <word> [path]', summary: 'search every file (or a pipe), any case', filter: true,
    run(args, { ctx, stdin, out }) {
      const { set, rest } = flags(args)
      const [pattern, where] = rest
      if (!pattern) { out.push(L(dim('usage: grep <word>  e.g. '), cmd('grep terraform'))); return }
      const re = new RegExp(`(${escapeRe(pattern)})`, 'gi')
      const test = (s: string) => { re.lastIndex = 0; const hit = re.test(s); re.lastIndex = 0; return set.has('v') ? !hit : hit }
      if (stdin) {
        const kept = stdin.filter((l) => test(plain(l)))
        if (set.has('c')) out.push(L(String(kept.length)))
        else out.push(...kept.map((l) => (set.has('v') ? l : highlight(plain(l), re))))
        return
      }
      const scope = where ? pathLabel(findDir(ctx.cwd, where) ?? resolve(ctx.cwd, where)) : '~'
      const files = allFiles().filter((f) => pathLabel(f.path).startsWith(scope))
      let count = 0
      for (const f of files) {
        const lines = f.node.body().map(plain).filter(test)
        if (!lines.length) continue
        const p = pathLabel(f.path)
        count += lines.length
        if (set.has('l')) { out.push(L(cmd(p, `cat ${p}`))); continue }
        if (set.has('c')) { out.push(L(cmd(p, `cat ${p}`), dim(`: ${lines.length}`))); continue }
        // the path inline, not as a gutter: a long path would leave a phone
        // nothing to wrap the match into
        for (const line of lines.slice(0, 4)) out.push([{ text: `${p.replace(/^~\//, '')}: `, run: `cat ${p}`, tone: 'dim' }, ...highlight(line.replace(/^#\s*/, ''), re)])
      }
      if (!count) out.push(L(dim(`no matches for '${pattern}'. `), cmd(`ask ${pattern}`), dim(' looks a little wider')))
    },
  },
  { name: 'head', group: 'read', usage: 'head [-n N]', summary: 'first lines of a pipe', filter: true, run(args, { stdin, out }) { out.push(...(stdin ?? []).slice(0, nOf(args))) } },
  { name: 'tail', group: 'read', usage: 'tail [-n N]', summary: 'last lines of a pipe', filter: true, run(args, { stdin, out }) { out.push(...(stdin ?? []).slice(-nOf(args))) } },
  {
    name: 'wc', group: 'read', usage: 'wc [-l]', summary: 'count lines, words, characters', filter: true,
    run(args, { stdin, out }) {
      const text = (stdin ?? []).map(plain)
      if (flags(args).set.has('l')) { out.push(L(String(text.length))); return }
      out.push(L(`${text.length} lines  ${text.join(' ').split(/\s+/).filter(Boolean).length} words  ${text.join('\n').length} chars`))
    },
  },
  {
    name: 'sort', group: 'read', usage: 'sort [-r]', summary: 'sort a pipe', filter: true,
    run(args, { stdin, out }) {
      const sorted = [...(stdin ?? [])].sort((a, b) => plain(a).localeCompare(plain(b)))
      out.push(...(flags(args).set.has('r') ? sorted.reverse() : sorted))
    },
  },
  {
    name: 'ask', group: 'about eric', usage: 'ask <anything>', summary: 'a question in plain words, answered from the page',
    run(args, { ctx, out }) {
      if (!args.length) { out.push(L(dim('ask me something, e.g. '), cmd('ask what have you built on aws?'))); return }
      out.push(...answer(args.join(' '), ctx))
    },
  },
  {
    name: 'whoami', group: 'about eric', usage: 'whoami', summary: 'who is this',
    run(_, { out }) { out.push(L("visitor, a curious one. The person you're here for is ", cmd(PROFILE.fullName, 'cat ~/about/bio.md'), t('.'))) },
  },
  {
    name: 'neofetch', aliases: ['fastfetch'], group: 'about eric', usage: 'neofetch', summary: 'the system specs, so to speak',
    run(_, { out }) {
      const skills = SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0)
      const awarded = PROJECTS.filter((p) => p.featured).length
      const byIssuer = [...new Set(CERTS.map((c) => c.issuer))].map((i) => `${i} ×${CERTS.filter((c) => c.issuer === i).length}`).join(', ')
      const row = (k: string, v: string | Seg) => L(accent(k.padEnd(11)), v)
      out.push(
        L(dim(' ┌┴┴┴┐          '), t('.--.', 'accent')),
        L(dim('─┤ ▪ ├───────── '), t('(    ).', 'accent')),
        L(dim(' └┬┬┬┘        '), t('(___.__)', 'accent')),
        [],
        L(strong('visitor'), dim('@'), strong('erickk.cloud')),
        L(dim('────────────────────')),
        row('name', PROFILE.fullName),
        row('os', 'BE(Hons) Computer Systems Eng.'),
        row('host', 'University of Auckland'),
        row('kernel', 'from silicon to serverless'),
        row('location', `${PROFILE.city} · ${nzTime()}`),
        row('projects', `${PROJECTS.length} (${awarded} awarded)`),
        row('certs', `${CERTS.length} (${byIssuer})`),
        row('packages', `${skills} skills in ${SKILL_GROUPS.length} groups`),
        row('shell', 'erickk-sh 2.0'),
        row('resolution', `${window.innerWidth}x${window.innerHeight}`),
        row('theme', 'paper · teal'),
        [],
        ['#fbfaf9', '#e8e5e0', '#635c57', '#1c1917', '#0f766e', '#115e59', '#92400e', '#1e3a8a'].map((color) => ({ text: '███', color })),
      )
    },
  },
  {
    name: 'cv', aliases: ['resume'], group: 'about eric', usage: 'cv <software|hardware>', summary: 'download a résumé',
    run(args, { ctx, out }) {
      const key = (args[0] ?? '').toLowerCase()
      const r = RESUMES.find((x) => (x.aliases as readonly string[]).includes(key))
      if (!r) { out.push(L(dim('two résumés: '), cmd('software', 'cv software'), dim(' · '), cmd('hardware', 'cv hardware'))); return }
      out.push(L(dim(`↓ downloading the ${r.label.toLowerCase()} CV…`)))
      ctx.download(r.href)
    },
  },
  {
    name: 'social', aliases: ['links', 'contact'], group: 'about eric', usage: 'social', summary: 'where else to find me',
    run(_, { out }) {
      out.push(
        L(dim('email     '), link(PROFILE.email, `mailto:${PROFILE.email}`)),
        L(dim('github    '), link(`github.com/${PROFILE.github.handle}`, PROFILE.github.url)),
        L(dim('linkedin  '), link(`linkedin.com/in/${PROFILE.linkedin.handle}`, PROFILE.linkedin.url)),
      )
    },
  },
  {
    name: 'status', group: 'live', usage: 'status', summary: 'live systems check', live: true,
    run(_, { ctx, out }) {
      const okLine = (label: string, value: string, ok = true) => L(dim(label.padEnd(15)), value, t(ok ? '  [ OK ]' : '  [ ?? ]', ok ? 'ok' : 'dim'))
      out.push(L(dim('querying live systems…')), okLine('sys/website', 'erickk.cloud: you are here'), okLine('sys/local-time', `${nzTime()} in Auckland`))
      fetch(`https://api.github.com/users/${PROFILE.github.handle}/events/public?per_page=1`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((events) => {
          const e = events?.[0]
          if (!e) throw new Error('no events')
          const action = (e.type || '').replace('Event', '').toLowerCase() || 'activity'
          ctx.print(okLine('sys/github', `${action} on ${e.repo?.name?.split('/')[1] ?? 'a repo'}, ${relTime(e.created_at)}`))
        })
        .catch(() => ctx.print(okLine('sys/github', 'live check unreachable', false)))
    },
  },
  {
    name: 'git', group: 'live', usage: 'git log [-n N]', summary: "this site's real commit history", live: true,
    run(args, { ctx, out }) {
      if (args[0] !== 'log') { out.push(err('git', 'only `git log` works in here; this shell is read-only. try ', cmd('git log'))); return }
      const n = Math.min(nOf(args, 5), 20)
      out.push(L(dim(`fetching the last ${n} commits to ${PROFILE.repo.replace('https://github.com/', '')}…`)))
      fetch(`https://api.github.com/repos/${PROFILE.repo.replace('https://github.com/', '')}/commits?per_page=${n}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((commits: { sha: string; html_url: string; commit: { message: string; author: { date: string } } }[]) => {
          ctx.print(...commits.map((c) => [{ text: c.sha.slice(0, 7), href: c.html_url, tone: 'warn' as const, gutter: true }, dim(` ${relTime(c.commit.author.date).padEnd(8)}`), t(c.commit.message.split('\n')[0])]))
        })
        .catch(() => ctx.print(L(dim('github is not answering right now (rate limits are 60 an hour). the history is at '), link('the repo ↗', `${PROFILE.repo}/commits/main`))))
    },
  },
  {
    name: 'ping', group: 'live', usage: 'ping', summary: 'a real round trip to this site', live: true,
    run(args, { ctx, out }) {
      const host = args[0]?.replace(/^https?:\/\//, '') ?? 'erickk.cloud'
      if (!/^(erickk\.cloud|localhost|127\.0\.0\.1)/.test(host)) { out.push(err('ping', `only erickk.cloud answers from in here, not ${host}`)); return }
      out.push(L(dim(`PING ${location.host || 'erickk.cloud'} over ${location.protocol.replace(':', '')}, fetching favicon.png`)))
      const times: number[] = []
      const once = (seq: number) => {
        const t0 = performance.now()
        fetch(`./favicon.png?ping=${Date.now()}`, { cache: 'no-store' })
          .then((r) => r.blob())
          .then((b) => {
            const ms = performance.now() - t0
            times.push(ms)
            ctx.print(L(`${b.size} bytes: seq=${seq} time=${ms.toFixed(1)} ms`))
            if (seq < 4) ctx.later(() => once(seq + 1), 400)
            else ctx.print(L(dim(`4 sent, 4 back. min/avg/max = ${Math.min(...times).toFixed(1)}/${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)}/${Math.max(...times).toFixed(1)} ms`)))
          })
          .catch(() => ctx.print(err('ping', 'no answer. are you offline?')))
      }
      once(1)
    },
  },
  { name: 'date', group: 'live', usage: 'date', summary: 'the time here, and in Auckland', run(_, { out }) { out.push(L(new Date().toString()), L(dim('in Auckland: '), nzTime())) } },
  {
    name: 'run', group: 'play', usage: 'run <project>', summary: 'replay what a project does (also ./spottern)', live: true,
    run(args, { ctx, out }) {
      const p = findProject(args[0] ?? '')
      if (!p) { out.push(L(dim('runnable: '), ...[...EXECUTABLE].flatMap((s, i) => [...(i ? [dim(' · ')] : []), cmd(`./${s}`)]))); return }
      if (p.slug === 'spottern') { runSpottern(ctx.print, ctx.later); return }
      if (p.slug === 'sentiment-pulse') { runPulse(ctx.print, ctx.later); return }
      out.push(L(`${p.title} is ${p.video ? 'hardware or a game you have to see, not run' : 'not runnable from here'}. `, cmd(`open ${p.slug}`), dim(p.video ? ' shows the clip' : ' shows it')))
    },
  },
  { name: 'fortune', group: 'play', usage: 'fortune', summary: 'a fortune cookie for engineers (try | kiwisay)', run(_, { out }) { out.push(L(FORTUNES[Math.floor(Math.random() * FORTUNES.length)])) } },
  {
    name: 'kiwisay', aliases: ['cowsay'], group: 'play', usage: 'kiwisay <words>', summary: 'cowsay, but a kiwi', filter: true,
    run(args, { stdin, out }) {
      const text = (args.length ? args.join(' ') : (stdin ?? []).map(plain).join(' ')) || 'kia ora!'
      const lines: string[] = []
      let cur = ''
      for (const w of text.split(/\s+/)) { if (cur && (cur + ' ' + w).length > 30) { lines.push(cur); cur = w } else cur = cur ? `${cur} ${w}` : w }
      lines.push(cur)
      const width = Math.max(...lines.map((l) => l.length))
      out.push(L(` ${'_'.repeat(width + 2)}`))
      lines.forEach((l, i) => {
        const [a, b] = lines.length === 1 ? ['<', '>'] : i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|']
        out.push(L(`${a} ${l.padEnd(width)} ${b}`))
      })
      out.push(
        L(` ${'-'.repeat(width + 2)}`),
        L('    \\'),
        L('     \\     ', accent('__')),
        L('          ', accent('(o \\___________')),
        L('      ', accent('___/   )')),
        L('     ', accent('(______/')),
        L('        ', accent('|  |')),
      )
    },
  },
  {
    name: 'sudo', group: 'play', usage: 'sudo hire-me', summary: 'you know you want to',
    run(args, { ctx, out }) {
      if (args.join(' ').toLowerCase().replace(/\s+/g, '-') !== 'hire-me') { out.push(L('nice try, but you do not have root here. (unless… ', cmd('sudo hire-me'), t(')'))); return }
      out.push(
        L(dim('[sudo] password for visitor: ********')),
        L('access granted. root privileges: emotional only.'),
        L('initiating recruitment protocol…'),
        L(dim('→ opening mail: '), link(PROFILE.email, `mailto:${PROFILE.email}?subject=Hello`)),
      )
      ctx.later(() => ctx.openUrl(`mailto:${PROFILE.email}?subject=Hello`), 900)
    },
  },
  { name: 'echo', group: 'shell', usage: 'echo <text>', summary: 'say it back', run(args, { out }) { out.push(L(args.join(' '))) } },
  {
    name: 'history', group: 'shell', usage: 'history', summary: 'what you typed (!! repeats the last)',
    run(_, { ctx, out }) { ctx.history.slice(-20).forEach((h, i, all) => out.push(L(dim(String(ctx.history.length - all.length + i + 1).padStart(4) + '  '), cmd(h)))) },
  },
  { name: 'clear', group: 'shell', usage: 'clear', summary: 'clear the screen (or ctrl+L)', run(_, { ctx }) { ctx.clear() } },
  { name: 'exit', aliases: ['close', 'quit'], group: 'shell', usage: 'exit', summary: 'close the terminal (or esc)', run(_, { ctx }) { ctx.close() } },
  {
    name: 'help', aliases: ['man'], group: 'shell', usage: 'help [command]', summary: 'this list, or one command in detail',
    run(args, { out }) {
      if (args[0]) {
        const c = find(args[0].replace(/^\.\//, ''))
        if (!c) { out.push(err('help', `no command called '${args[0]}'`)); return }
        out.push(L(strong(c.usage)), L(c.summary), ...(c.aliases ? [L(dim(`also: ${c.aliases.join(', ')}`))] : []), ...(c.filter ? [L(dim('reads a pipe: '), cmd(`fortune | ${c.name === 'kiwisay' ? 'kiwisay' : 'wc -l'}`))] : []))
        return
      }
      for (const g of GROUPS) {
        const names = COMMANDS.filter((c) => c.group === g)
        out.push([{ text: g.padEnd(12), tone: 'dim', gutter: true }, ...names.flatMap((c, i) => [...(i ? [t('  ')] : []), cmd(c.name === 'git' ? 'git log' : c.name === 'run' ? './spottern' : c.name, c.name === 'git' ? 'git log' : c.name === 'run' ? './spottern' : `help ${c.name}`)])])
      }
      out.push([], L(dim('press any command for its details. pipes work: '), cmd('ls ~/skills | grep cloud')), L(dim('or skip all that and just ask: '), cmd('ask are you open to work?')))
    },
  },
]

function find(name: string): Command | undefined {
  const n = name.toLowerCase()
  return COMMANDS.find((c) => c.name === n || c.aliases?.includes(n))
}

export const COMMAND_NAMES = COMMANDS.flatMap((c) => [c.name, ...(c.aliases ?? [])]).sort()

// --- parsing -----------------------------------------------------------------

function tokenize(s: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

// split on | outside quotes
function stages(s: string): string[] {
  const parts: string[] = []
  let cur = '', q = ''
  for (const ch of s) {
    if (q) { if (ch === q) q = ''; cur += ch }
    else if (ch === '"' || ch === "'") { q = ch; cur += ch }
    else if (ch === '|') { parts.push(cur); cur = '' }
    else cur += ch
  }
  parts.push(cur)
  return parts.map((p) => p.trim())
}

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  }
  return d[a.length][b.length]
}

// --- running a line ----------------------------------------------------------

export interface Result {
  out: Line[]
  event: string // what analytics records: the command name, never its arguments
}

export function execute(raw: string, ctx: Ctx): Result {
  const out: Line[] = []
  let line = raw.trim()
  if (!line) return { out, event: '' }

  // history expansion, the two that matter
  if (line === '!!' || /^!\d+$/.test(line)) {
    const prev = line === '!!' ? ctx.history.at(-1) : ctx.history[Number(line.slice(1)) - 1]
    if (!prev) return { out: [err('erickk-sh', `${line}: event not found`)], event: 'history' }
    out.push(L(dim(prev)))
    line = prev
  }

  // `./spottern` is `run spottern`
  if (line.startsWith('./')) line = `run ${line.slice(2)}`

  const parts = stages(line)
  let stdin: Line[] | null = null
  for (let i = 0; i < parts.length; i++) {
    const [name, ...args] = tokenize(parts[i])
    const c = name ? find(name) : undefined
    if (!c) {
      if (parts.length === 1) return { out: [...out, ...fallback(line, ctx)], event: 'unknown' }
      return { out: [...out, err('erickk-sh', `command not found: ${name ?? '(empty)'}`)], event: 'unknown' }
    }
    if (i > 0 && !c.filter) return { out: [...out, err(c.name, "doesn't read from a pipe. these do: ", ...COMMANDS.filter((x) => x.filter).flatMap((x, n) => [...(n ? [dim(', ')] : []), cmd(x.name, `help ${x.name}`)]))], event: c.name }
    if (i < parts.length - 1 && c.live) return { out: [...out, err(c.name, "its output arrives live, so it can't be piped")], event: c.name }
    const stageOut: Line[] = []
    c.run(args, { ctx, stdin, out: stageOut, piped: i < parts.length - 1 })
    stdin = stageOut
    if (i === parts.length - 1) out.push(...stageOut)
  }
  const first = find(tokenize(parts[0])[0])
  return { out, event: first?.name ?? 'unknown' }
}

// Not a command. In order: a typo of one, the name of a section or project,
// a question, a word that appears on the page.
function fallback(line: string, ctx: Ctx): Line[] {
  const [word, ...rest] = tokenize(line)
  const w = word.toLowerCase()
  const near = COMMAND_NAMES
    .map((n) => ({ n, d: distance(w, n) }))
    .filter(({ n, d }) => d <= (n.length > 4 ? 2 : 1))
    .sort((a, b) => a.d - b.d)[0]
  if (/^(hire|hiring|available|internships?|jobs?|cv|resume|contact|email)$/.test(w)) return answer(line, ctx)
  if (near && !rest.length && !findProject(w) && !findDir([], w)) {
    return [L(strong('command not found: '), word, dim('. did you mean '), cmd(near.n, [near.n, ...rest].join(' ')), dim('?'))]
  }
  if (near && rest.length) {
    return [L(strong('command not found: '), word, dim('. did you mean '), cmd([near.n, ...rest].join(' ')), dim('?'))]
  }
  if (!rest.length && (findProject(w) || findDir([], w))) {
    return [L(dim(`'${word}' isn't a command, but it's here: `), cmd(`open ${word}`), dim(' · '), cmd(findProject(w) ? `cat ${word}` : `cd ${word}`))]
  }
  if (rest.length || /\?$/.test(line)) return answer(line, ctx)
  const hits = search(word)
  if (hits.length) return [L(dim(`'${word}' isn't a command, but it is on the page:`)), ...hitLines(hits)]
  return [L(strong('command not found: '), word, dim('. type '), cmd('help'), dim(', or just ask a question.'))]
}

// --- completion and suggestions ----------------------------------------------

function pathCandidates(cwd: string[], token: string, only?: 'dir' | 'file'): string[] {
  const slash = token.lastIndexOf('/')
  const base = slash === -1 ? cwd : resolve(cwd, token.slice(0, slash) || '/')
  const node = getNode(base)
  if (!node || node.type !== 'dir') return []
  const head = slash === -1 ? '' : token.slice(0, slash + 1)
  return Object.entries(node.children)
    .filter(([, n]) => !only || (only === 'dir' ? n.type === 'dir' : n.type !== 'dir'))
    .map(([name, n]) => head + name + (n.type === 'dir' ? '/' : ''))
}

// Every way the current word could end, for Tab: the ghost text shows the
// first, and a second Tab lists them all.
export function candidates(input: string, cwd: string[]): string[] {
  if (/\s$/.test(input) && !input.trim()) return []
  const words = input.split(/\s+/)
  const last = words.at(-1) ?? ''
  const startsWith = (list: string[]) => [...new Set(list)].filter((c) => c.toLowerCase().startsWith(last.toLowerCase()) && c !== last).sort()
  if (words.length === 1) return startsWith([...COMMAND_NAMES, ...[...EXECUTABLE].map((s) => `./${s}`)])
  const c = words[0].toLowerCase()
  const sections = Object.keys(ROOT.children).filter((n) => ROOT.children[n].type === 'dir')
  if (c === 'cd' || c === 'tree') return startsWith([...pathCandidates(cwd, last, 'dir'), ...sections, ...PROJECTS.map((p) => p.slug)])
  if (c === 'ls') return startsWith([...pathCandidates(cwd, last), ...sections])
  if (c === 'cat' || c === 'grep' && words.length > 2) return startsWith([...pathCandidates(cwd, last), ...PROJECTS.map((p) => p.slug)])
  if (c === 'open') return startsWith([...PROJECTS.map((p) => p.slug), ...sections, 'cv', 'github', 'linkedin', 'email', ...pathCandidates(cwd, last)])
  if (c === 'run') return startsWith([...EXECUTABLE])
  if (c === 'cv' || c === 'resume') return startsWith(RESUMES.map((r) => r.id))
  if (c === 'help' || c === 'man') return startsWith(COMMANDS.map((x) => x.name))
  if (c === 'git') return startsWith(['log'])
  if (c === 'sudo') return startsWith(['hire-me'])
  return []
}

// The row of next steps under the prompt, for anyone who would rather press
// than type. They follow where you are.
export function suggestions(cwd: string[]): string[] {
  const here = getNode(cwd)
  if (cwd[0] === 'projects' && cwd[1]) {
    const p = PROJECTS.find((x) => x.slug === cwd[1])
    return [
      'cat README.md',
      ...(p?.log ? ['cat build.log'] : []),
      ...(EXECUTABLE.has(cwd[1]) ? [`./${cwd[1]}`] : []),
      `open ${cwd[1]}`,
      'cd ..',
    ].slice(0, 4)
  }
  if (cwd[0] === 'projects') return ['ls -l', 'open spottern', './sentiment-pulse', 'cd ~']
  if (cwd.length && here?.type === 'dir') {
    const first = Object.keys(here.children)[0]
    return ['ls', ...(first ? [`cat ${first}`] : []), `grep ${cwd[0] === 'skills' ? 'aws' : 'auckland'}`, 'cd ~']
  }
  return ['help', 'neofetch', 'ls ~/projects', 'ask what have you built on aws?']
}
