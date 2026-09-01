import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Section from './Section.jsx'
import { useLayout, usePanelActive } from '../layout.js'

const PROJECTS = [
  {
    title: 'Winnie the Bot',
    tag: '3rd Place · ECSE Design Competition 2025',
    year: '2025',
    period: 'Sep 2025',
    // bracketed short form keys the logo, so the ECSE department credit still
    // flies the University of Auckland mark
    awardedBy: ['Department of Electrical, Computer and Software Engineering (UoA)'],
    role: 'Interactive Companion Robot',
    highlights: [
      'Designed and built the embedded electrical hardware for an AI powered interviewer robot using dual ATmega328P NANO microcontrollers, servos, an AI camera, and audio peripherals to drive simultaneous face tracking, arm movement, and real time voice interaction.',
      "Prototyped and refined the robot's enclosure through iterative 3D printing and multiple design revisions, delivering a compact, durable, and functional physical build that placed 3rd in the UoA ECSE Design Competition.",
    ],
    tech: ['Embedded C', 'ATmega328P NANO', 'Servos', 'AI Camera', 'AutoCAD'],
    image: './winnie.webp',
    video: './winnie.mp4',
    featured: true,
    rank: '3rd',
    color: 'from-amber-500/20 to-rose-500/20',
    initial: 'W',
    links: [],
    // deeper case study shown in the build-log modal
    log: [
      {
        code: '01 · BRIEF',
        body: [
          'Build a companion robot for the UoA ECSE Design Competition 2025 that can hold your gaze, wave, and talk back. An embedded system that reads as a character, not a circuit board.',
        ],
      },
      {
        code: '02 · BUILD',
        body: [
          'Dual ATmega328P NANOs share the workload across servos for head and arm motion, an AI camera for face tracking, and audio peripherals for voice dialogue, all running simultaneously on hardware with no operating system underneath.',
          'The enclosure was 3D modelled and printed across multiple design revisions, packing every board, servo, and speaker into a compact, durable, desk-friendly form factor.',
        ],
      },
      {
        code: '03 · SETBACK',
        body: [
          "The enclosure fought back at the CAD stage. Winnie's parts are doll sized, small enough that measuring them by eye was hopeless and their true dimensions were genuinely hard to pin down.",
          'The fix was proper metrology: vernier calipers and lab grade measurement equipment, one component at a time, recording actual sizes until the numbers could be trusted. Those measurements became the 3D CAD model the final enclosure was built from.',
        ],
      },
      {
        code: '04 · OUTCOME',
        body: [
          '3rd place at the UoA ECSE Design Competition 2025, awarded by the Department of ECSE in September 2025.',
        ],
      },
    ],
  },
  {
    title: 'Spottern!',
    tag: 'Top 8 Finalist · AWS×BNZ AI Hackathon 2026',
    year: '2026',
    period: 'Jul 2026',
    role: 'Statement-level fraud detection platform',
    awardedBy: [
      'Amazon Web Services (AWS)',
      'Bank of New Zealand (BNZ)',
    ],
    highlights: [
      'Built a serverless fraud pipeline with AWS (SNS, Lambda, Textract, Bedrock, DynamoDB), using Claude Opus 4.8 on Bedrock behind a schema validated JSON contract, to extract and flag anomalies across an entire bank statement in one call with cited transaction evidence.',
      'Proposed the approach to BNZ by drawing on prior individual project experience with serverless AWS pipelines, placing top 8 out of 20+ teams.',
    ],
    tech: ['AWS Lambda', 'Amazon Textract', 'Amazon Bedrock', 'Claude Opus 4.8', 'DynamoDB', 'Amazon S3', 'Amazon SNS', 'AWS SAM', 'React.js'],
    image: './spottern.webp',
    featured: true,
    rank: 'Top 8',
    color: 'from-violet-500/20 to-fuchsia-500/20',
    initial: 'S',
    links: [
      { label: 'Deployed DEMO', href: 'https://erick-6.github.io/Spottern/' },
      { label: 'Git repo', href: 'https://github.com/EricK-6/Spottern' },
    ],
  },
  {
    title: 'Sentiment PULSE',
    icon: 'cloud',
    tag: 'AWS · Individual Project',
    year: '2026',
    period: 'May 2026 to Jun 2026',
    role: 'Real-time Sentiment Dashboard',
    highlights: [
      'Built a serverless NLP pipeline with AWS (Kinesis, Lambda, Comprehend, DynamoDB) using AWS SAM, with a dead letter queue for failed batches, to classify streaming text sentiment in real time.',
      'Developed a live React dashboard on AWS Amplify, applying cloud and AI/ML fundamentals from certification study to a hands on project.',
    ],
    tech: ['Amazon Kinesis', 'AWS Lambda', 'Amazon Comprehend', 'DynamoDB', 'AWS SAM', 'GitHub Actions', 'React.js', 'AWS Amplify'],
    image: './pulse.webp',
    video: './pulse.mp4',
    color: 'from-cyan-500/20 to-blue-500/20',
    initial: 'S',
    links: [
      { label: 'Deployed DEMO', href: 'https://master.d3t61ak2oiedfz.amplifyapp.com/' },
      { label: 'Git repo', href: 'https://github.com/EricK-6/sentiment-dashboard' },
    ],
  },
  {
    title: 'KEB Web Design',
    icon: 'globe',
    tag: 'KEB Project Playground 2025 · Team Competition',
    year: '2025',
    period: 'Aug 2025',
    role: 'Homepage for Club',
    hostedBy: ['Korean Engineering Body (KEB)'],
    highlights: [
      "Delivered the Korean Engineering Body's first-ever website using React 19, Vite, and React Bootstrap in order to give the club a centralised hub for events and activities.",
      'Collaborated with senior software students in order to ship a production-ready platform from scratch.',
    ],
    tech: ['HTML/CSS', 'JavaScript', 'React.js'],
    image: './KEBWebDesign.webp',
    color: 'from-sky-500/20 to-indigo-500/20',
    initial: 'K',
    links: [
      { label: 'Deployed DEMO', href: 'https://keb-project.vercel.app/' },
      { label: 'Git repo', href: 'https://github.com/Patrick-Sheng/keb-project' },
    ],
  },
  {
    title: 'Smart Energy Monitor',
    icon: 'zap',
    tag: 'Embedded C · Team Project',
    year: '2025',
    org: 'University of Auckland (UoA)',
    role: 'Embedded Energy Monitoring System',
    highlights: [
      'Designed a dual channel energy monitoring system, using signal conditioned ADC sampling on an ATmega328P, to compute RMS voltage, peak current, and average power in real time.',
      'Built and validated a double layer PCB, using Altium Designer and UART based output, to meet a ±5% full scale accuracy spec across a 2.5 to 7.5 VA load range.',
    ],
    tech: ['C', 'ATmega328P', 'Atmel AVR', 'Altium Designer', 'LTspice', 'Proteus'],
    image: './energy_monitor.webp',
    video: './smart.mp4',
    // the media strip is far wider than it is tall, so a centred crop of this
    // clip lands on bare green PCB; bias it upwards to hold the red
    // seven-segment readout, which is the part that actually moves
    focus: '50% 20%',
    color: 'from-emerald-500/20 to-teal-500/20',
    initial: 'E',
    // Coursework repo: it lives in a private university org, so a link here
    // would 404 for every visitor. The media and the tech list carry the tile.
    links: [],
  },
  {
    title: 'Flappy Universe',
    icon: 'cpu',
    tag: 'VHDL · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'FPGA Game Implementation',
    highlights: [
      'Implemented a Flappy Bird style game in VHDL, using a custom VGA sync generator and PLL based clock division on a DE0-CV FPGA, to render real time sprite based gameplay.',
      'Built a hardware LFSR random number generator, using shift register feedback logic, to procedurally place pipe gaps and drive collision detection and scoring.',
    ],
    tech: ['VHDL', 'DE0-CV FPGA', 'Intel Quartus Prime', 'ModelSim'],
    image: './flappy_universe.webp',
    video: './flappy.mp4',
    color: 'from-lime-500/20 to-green-500/20',
    initial: 'F',
    // Coursework repo: it lives in a private university org, so a link here
    // would 404 for every visitor. The media and the tech list carry the tile.
    links: [],
  },
  {
    title: 'RoastWorks Analytics',
    icon: 'chart',
    tag: 'Python · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'Business Analytics Dashboard',
    highlights: [
      'Built a PyQt6 desktop analytics app powered by pandas for KPI computation and Matplotlib for charting, automating a manual Excel reporting workflow across three business units.',
      "Implemented three forecasting models, combining scikit-learn regression with a custom NumPy build of Holt's Exponential Smoothing, validated with MAE and RMSE.",
    ],
    tech: ['Python', 'PyQt6', 'Pandas', 'Matplotlib', 'NumPy', 'scikit-learn'],
    image: './roastworks.webp',
    color: 'from-orange-500/20 to-amber-500/20',
    initial: 'R',
    // Coursework repo: it lives in a private university org, so a link here
    // would 404 for every visitor. The media and the tech list carry the tile.
    links: [],
  },
  {
    title: 'MealHub',
    icon: 'phone',
    tag: 'Java · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'Android Meal Planning App',
    highlights: [
      'Built an Android recipe and meal planning app in Java with Firebase Firestore, enabling users to browse cuisines, search food items, and persist personalised meal plans.',
      'Implemented a nutrition goal tracking system using SharedPreferences to set and track daily targets.',
    ],
    tech: ['Java', 'Android Studio', 'XML', 'Figma', 'Firebase Firestore'],
    image: './MealHub.webp',
    color: 'from-green-500/20 to-emerald-500/20',
    initial: 'M',
    // Coursework repo: it lives in a private university org, so a link here
    // would 404 for every visitor. The media and the tech list carry the tile.
    links: [],
  },
]

// The explorer list is partitioned: the competition wins read as awards, the
// rest as projects. PROJECTS stays a flat, awards-first array so the tab
// indices (and the roving tabindex that walks them) need no group arithmetic —
// a heading is emitted at the top and again where the awards run out.
const groupLabelFor = (i) => {
  if (i === 0) return 'Awards'
  if (PROJECTS[i - 1].featured && !PROJECTS[i].featured) return 'Projects'
  return null
}

// Presentational only: `role="presentation"` keeps the tabs the tablist's sole
// real children, and each award tab already names its placement in the tag
// line underneath, so nothing is lost by hiding these from assistive tech.
// Vertical column on md+, inline divider in the phone's scroll strip.
function GroupLabel({ children, first }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`flex-none self-center whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-grey-400 dark:text-grey-600 md:self-start md:px-4 ${
        first ? 'md:pb-0.5' : 'ml-1 md:ml-0 md:mt-2 md:pb-0.5'
      }`}
    >
      {children}
    </div>
  )
}

export default function Projects() {
  // space mode fits the whole section in one floating panel, so the cards
  // trade some padding and image height for a layout that needs no zoom-out
  const space = useLayout() === 'tile'
  const [sel, setSel] = useState(0)
  const current = PROJECTS[sel]
  const tabRefs = useRef([])

  // roving tabindex: arrows move selection and focus together. Both axes work
  // because the list is a horizontal row on small screens, a column on md+.
  const onTabKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (sel + 1) % PROJECTS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (sel - 1 + PROJECTS.length) % PROJECTS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = PROJECTS.length - 1
    if (next == null) return
    e.preventDefault()
    e.stopPropagation() // arrows here pick a project, not a space-mode panel
    setSel(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Section
      id="projects"
      kicker="Projects"
      title="Things I've built"
      subtitle="A mix of hardware, software, and everything in between. Pick a project from the list to see the details."
    >
      {/* master-detail explorer: every project is visible in the list at a
          glance; one click swaps the detail card. On small screens the list
          becomes a horizontal row of pills above the card. */}
      {/* minmax(0,1fr) (not an implicit auto track): otherwise the chip
          strip's max-content width inflates the column past the viewport
          on phones and the detail card clips */}
      <div className="grid items-start gap-4 grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(220px,300px)_1fr]">
        <div>
          <div
            role="tablist"
            aria-label="Awards and projects"
            className={`no-scrollbar flex overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 ${space ? 'gap-1.5' : 'gap-2'}`}
          >
          {PROJECTS.map((p, i) => (
            <Fragment key={p.title}>
              {groupLabelFor(i) && <GroupLabel first={i === 0}>{groupLabelFor(i)}</GroupLabel>}
              <button
                ref={(el) => (tabRefs.current[i] = el)}
                type="button"
                role="tab"
                id={`project-tab-${i}`}
                aria-selected={i === sel}
                aria-controls="project-panel"
                tabIndex={i === sel ? 0 : -1}
                onClick={() => setSel(i)}
                onKeyDown={onTabKeyDown}
                className={`shrink-0 rounded-xl border px-4 ${space ? 'py-1' : 'py-2.5'} text-left transition md:w-full ${
                  i === sel
                    ? 'border-accent/60 bg-grey-200/80 dark:border-accent-dark/50 dark:bg-grey-900'
                    : 'border-grey-300/70 text-grey-600 hover:border-grey-400 hover:text-grey-900 dark:border-grey-800 dark:text-grey-400 dark:hover:border-grey-700 dark:hover:text-grey-100'
                }`}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium md:whitespace-normal">
                  {p.rank ? <RankChip rank={p.rank} /> : <ProjectIcon type={p.icon} />}
                  {p.title}
                </span>
                <span className="mt-0.5 hidden text-xs text-grey-500 dark:text-grey-500 md:block">{p.tag}</span>
              </button>
            </Fragment>
          ))}
          </div>
          <a
            href="https://github.com/EricK-6"
            target="_blank"
            rel="noreferrer"
            className={`hidden items-center gap-1 px-4 text-xs text-grey-500 underline-offset-2 hover:text-accent hover:underline md:flex ${space ? 'mt-1.5' : 'pt-1 mt-2'}`}
          >
            More on my GitHub →
          </a>
        </div>

        {/* key remount replays the entrance animation on every switch */}
        <div
          key={current.title}
          role="tabpanel"
          id="project-panel"
          aria-labelledby={`project-tab-${sel}`}
          className="min-w-0 animate-fade-in-up"
        >
          <ProjectCard project={current} space={space} />
        </div>
      </div>

      <p className="mt-4 text-sm text-grey-500 dark:text-grey-500 md:hidden">
        More on my <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="underline hover:text-accent dark:hover:text-accent-dark">GitHub</a>.
      </p>
    </Section>
  )
}

// The awards carry their placement instead of a glyph: an identical star on
// both entries repeated the amber ring and tag line without adding anything,
// where the rank tells them apart. A fixed min-width keeps the two award
// titles aligned with each other; the icon rows below start at their own x.
function RankChip({ rank }) {
  return (
    <span className="min-w-[2.6rem] flex-none rounded bg-award-soft/20 px-1 py-0.5 text-center font-mono text-[10px] font-semibold uppercase leading-none tracking-tight text-award">
      {rank}
    </span>
  )
}

// small identifying glyph per project shown in the explorer list (the two
// competition wins carry a RankChip instead)
// A hue per project so the list stays scannable at a glance. These sit one
// stop darker than the originals and at 80% opacity: full-strength 500s were
// a rainbow competing with the award chips directly above them, and a single
// flat grey went too far the other way and vanished on the glass.
const ICON_STYLES = {
  shield: 'text-violet-600/80',
  cloud: 'text-sky-600/80',
  globe: 'text-indigo-600/80',
  zap: 'text-yellow-600/80',
  cpu: 'text-lime-700/80',
  chart: 'text-orange-600/80',
  phone: 'text-emerald-600/80',
}

const ICON_PATHS = {
  shield: (
    <>
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-3M13 17V8M18 17V5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M12 18h.01" />
    </>
  ),
}

function ProjectIcon({ type }) {
  if (!type) return null
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${ICON_STYLES[type] ?? ''}`}
    >
      {ICON_PATHS[type]}
    </svg>
  )
}

function ProjectCard({ project, space }) {
  const { title, tag, year, period, org, role, awardedBy, hostedBy, highlights, tech, color, initial, image, video, focus, featured, links, log } = project
  const [logOpen, setLogOpen] = useState(false)

  // the demo clip only plays while its panel is the one on camera — space
  // mode keeps every section mounted, and a looping video on a hidden panel
  // is pure battery drain
  const panelActive = usePanelActive()
  const videoRef = useRef(null)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (panelActive) v.play().catch(() => { /* autoplay policy: poster stays */ })
    else v.pause()
  }, [panelActive])

  return (
    <article className={`card flex h-full flex-col overflow-hidden ${space ? 'p-4' : ''} ${featured ? 'ring-2 ring-award-soft/60' : ''}`}>
      <div className={`relative ${space ? '-m-4 mb-3 h-24' : '-m-6 mb-6 h-44'} overflow-hidden ${image || video ? 'bg-grey-100 dark:bg-grey-800' : `bg-gradient-to-br ${color} flex items-center justify-center`}`}>
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={image}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label={`${title} demo`}
            className="h-full w-full object-cover"
            style={focus ? { objectPosition: focus } : undefined}
          />
        ) : image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={focus ? { objectPosition: focus } : undefined}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.3),transparent_50%)]" />
            <span className="relative text-6xl font-extrabold text-white/90 drop-shadow-sm">{initial}</span>
          </>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-grey-100/80 px-2.5 py-1 text-xs font-medium text-grey-800 backdrop-blur dark:bg-grey-900/80 dark:text-grey-200">
          {year}
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        {/* no award glyph here: the amber ring and this amber tag line already
            mark the card, and the tag names the placement in words */}
        <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest ${featured ? 'text-award' : 'text-accent'}`}>
          {tag}
        </div>
        <h3 className={`mt-1 font-semibold ${space ? 'text-lg' : 'text-xl'}`}>{title}</h3>
        {period && <div className="mt-0.5 text-sm text-grey-500 dark:text-grey-500">{period}</div>}
        <div className="mt-2 text-sm font-medium text-grey-700 dark:text-grey-300">:: {role}</div>
        {(awardedBy || hostedBy || org) && (
          <Affiliation
            label={awardedBy ? 'Awarded by' : hostedBy ? 'Hosted by' : 'Associated with'}
            names={awardedBy ?? hostedBy ?? [org]}
            space={space}
          />
        )}

        {highlights?.length > 0 && (
          <ul className={`${space ? 'mt-2' : 'mt-4'} ${space ? 'space-y-1' : 'space-y-1.5'} text-sm sm:text-justify text-grey-700 dark:text-grey-300`}>
            {highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent dark:bg-accent-dark" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {tech?.length > 0 && (
          <div className={`${space ? 'mt-2' : 'mt-5'} flex flex-wrap gap-1.5`}>
            {tech.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {(links?.length > 0 || log) && (
          <div className={`${space ? 'mt-2.5' : 'mt-5'} flex flex-wrap items-center gap-3`}>
            {log && (
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="tap-44 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline dark:text-accent-dark"
              >
                Open the build log →
              </button>
            )}
            {links?.map((l) => {
              const demo = /demo/i.test(l.label)
              const git = l.href.includes('github.com')
              return (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-44 inline-flex items-center gap-1.5 rounded-lg border border-grey-400/70 bg-grey-100 px-3 py-1.5 text-sm font-medium text-grey-900 transition hover:bg-grey-200 dark:border-grey-700 dark:bg-grey-900 dark:text-grey-100 dark:hover:bg-grey-800"
                >
                  {demo && <LiveLed />}
                  {git && <GitHubIcon />}
                  {l.label}
                  {!demo && !git && ' →'}
                </a>
              )
            })}
          </div>
        )}
      </div>
      {logOpen && <BuildLogModal project={project} onClose={() => setLogOpen(false)} />}
    </article>
  )
}

// Who stood behind the project: the body that handed out the award, the
// organisation that ran the event, or the university it sat under. For the
// award entries the awarding body IS half the credential, so it gets a proper
// credit strip — the real logo plus the organisation's name — rather than the
// run-on grey sentence it used to share. Names carry their own short form in
// brackets ("Bank of New Zealand (BNZ)"), which keys the logo and is also the
// fallback badge for any organisation whose mark we don't hold.
const LOGOS = {
  AWS: './aws.jpg',
  BNZ: './bnz.jpg',
  KEB: './KEB.webp',
  UoA: './UoA.jpg',
}

const shortForm = (name) => {
  const bracketed = name.match(/\(([^)]+)\)/)
  if (bracketed) return bracketed[1]
  const initials = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('')
  return initials.slice(0, 4) || name.slice(0, 2).toUpperCase()
}
const fullName = (name) => name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()

function Affiliation({ label, names, space }) {
  return (
    <div className={space ? 'mt-2.5' : 'mt-3'}>
      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey-400 dark:text-grey-600">
        {label}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {names.map((name) => {
          const key = shortForm(name)
          const logo = LOGOS[key]
          return (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-lg border border-grey-300/80 bg-grey-100 py-1 pl-1.5 pr-2.5 dark:border-grey-800 dark:bg-grey-900/60"
            >
              {logo ? (
                // one fixed height, width free: the square marks (AWS, BNZ,
                // UoA, KEB) come out as 24px tiles and CODE's wide wordmark
                // keeps its 3:1 proportions instead of being squashed square
                <img
                  src={logo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-6 w-auto max-w-[4.5rem] flex-none rounded object-contain"
                />
              ) : (
                // fallback badge stays neutral grey — an accent-tinted one
                // turned emerald in dark mode and read as a status pill
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded bg-grey-200 px-1.5 font-mono text-[10px] font-bold tracking-wider text-grey-600 dark:bg-grey-800 dark:text-grey-400">
                  {key}
                </span>
              )}
              <span className="text-xs font-medium text-grey-700 dark:text-grey-300">{fullName(name)}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// blinking green LED marking a live deployed demo — same light as the hero's
// "Open to internships" status
function LiveLed() {
  return (
    <span aria-hidden="true" className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}

// Case-study modal styled as a flight log. Rendered through a portal because
// space mode's 3D transforms would otherwise hijack position:fixed.
function BuildLogModal({ project, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    // freeze the page behind the modal; SpaceLayout reads this to pause
    // its wheel/arrow flight handlers too
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Build log: ${project.title}`}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-grey-300 bg-white shadow-2xl dark:border-grey-800 dark:bg-grey-950"
      >
        <div className="flex items-center justify-between border-b border-grey-200 px-5 py-3.5 dark:border-grey-800">
          <div className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-grey-500">
            Build log · {project.title}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close build log"
            className="rounded-lg p-1 text-grey-500 hover:bg-grey-200 hover:text-grey-800 dark:hover:bg-grey-900 dark:hover:text-grey-100"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-5 px-5 py-5">
          {project.log.map((entry) => (
            <section key={entry.code}>
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent dark:text-accent-dark">
                {entry.code}
              </h4>
              {entry.body.map((para) => (
                <p key={para} className="mt-1.5 text-sm sm:text-justify leading-relaxed text-grey-700 dark:text-grey-300">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
