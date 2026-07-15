import { useRef, useState } from 'react'
import Section from './Section.jsx'
import { useLayout } from '../layout.js'

const PROJECTS = [
  {
    title: 'Winnie the Bot',
    tag: '3rd Place · ECSE Design Competition 2025',
    year: '2025',
    period: 'Issued by Department of ECSE · Sep 2025',
    org: 'University of Auckland',
    role: 'Awarded for "Winnie the Bot" - Interactive companion robot',
    highlights: [
      'Designed and built the embedded electrical hardware for an AI powered interactive robot using dual ATmega328P NANO microcontrollers, servos, an AI camera, and audio peripherals to enable simultaneous face tracking, arm movement, and voice dialogue.',
      'Contributed to 3D modelling and physical prototyping of the robot enclosure to house all electronics within a compact aesthetic form factor, placing 3rd in the UoA ECSE Design Competition.',
    ],
    tech: ['Embedded C', 'ATmega328P NANO', 'Servos', 'AI Camera', 'AutoCAD'],
    image: './winnie.webp',
    featured: true,
    color: 'from-amber-500/20 to-rose-500/20',
    initial: 'W',
    links: [],
  },
  {
    title: 'Sentiment PULSE',
    icon: 'cloud',
    tag: 'AWS · Individual Project',
    year: '2026',
    period: 'May 2026 – Present',
    role: 'Real-time Sentiment Dashboard',
    highlights: [
      'Built a serverless NLP pipeline on AWS (Kinesis, Lambda, Comprehend, DynamoDB) with AWS SAM in order to classify streaming text sentiment in real time.',
      'Developed a live React dashboard on AWS Amplify to visualise sentiment trends and confidence scores.',
    ],
    tech: ['Amazon Kinesis', 'AWS Lambda', 'Amazon Comprehend', 'DynamoDB', 'AWS SAM', 'React.js', 'AWS Amplify'],
    image: './pulse.webp',
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
    tag: 'KEB Project Playground · Team Competition',
    year: '2025',
    period: 'Jul 2025 – Aug 2025',
    org: 'Korean Engineering Body (KEB)',
    role: 'Homepage for club',
    highlights: [
      "Delivered the Korean Engineering Body's first-ever website using React 19, Vite, and React Bootstrap in order to give the club a centralised hub for events and activities.",
      'Collaborated with senior software students in order to ship a production-ready platform from scratch.',
    ],
    tech: ['JavaScript', 'React.js', 'Vite'],
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
    tag: 'C & Embedded · Team Project',
    year: '2025',
    org: 'University of Auckland',
    role: 'Embedded Energy Monitoring System',
    highlights: [
      'Designed an embedded energy monitoring system using ATmega328P microcontrollers with ADC processing in order to measure and display real-time energy usage.',
      'Produced a validated PCB schematic using Altium Designer in order to achieve accurate signal conditioning.',
    ],
    tech: ['C', 'Atmel AVR', 'ATmega328P', 'Altium Designer', 'LTspice'],
    image: './energy_monitor.webp',
    color: 'from-emerald-500/20 to-teal-500/20',
    initial: 'E',
    links: [
      { label: 'Git repo', href: 'https://github.com/uoa-ece209-2025/ec209-2025-project-2025_team_41' },
    ],
  },
  {
    title: 'Flappy Universe',
    icon: 'cpu',
    tag: 'VHDL · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'FPGA Game Implementation',
    highlights: [
      'Implemented a Flappy Bird-style game in VHDL on an Altera FPGA with VGA output and sprite rendering in order to demonstrate real-time hardware design.',
      'Developed a pixel-priority VHDL pipeline in order to render game scenes at VGA resolution.',
    ],
    tech: ['VHDL', 'Intel Quartus Prime', 'Altera FPGA'],
    image: './flappy_universe.webp',
    color: 'from-lime-500/20 to-green-500/20',
    initial: 'F',
    links: [
      { label: 'Git repo', href: 'https://github.com/jpar483/COMPSYS305_MiniProject' },
    ],
  },
  {
    title: 'RoastWorks Analytics',
    icon: 'chart',
    tag: 'Python · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'Business Analytics Dashboard',
    highlights: [
      'Built a desktop business analytics app with a PyQt6 GUI using pandas and Matplotlib, delivering sales performance dashboards with KPI tracking across three business units.',
      "Implemented a scikit-learn forecasting module using Linear Regression and Holt's Exponential Smoothing.",
    ],
    tech: ['Python', 'Pandas', 'scikit-learn'],
    image: './roastworks.webp',
    color: 'from-orange-500/20 to-amber-500/20',
    initial: 'R',
    links: [
      { label: 'Git repo', href: 'https://github.com/COMPSYS302/project-python-cs302-2026-python-project-24' },
    ],
  },
  {
    title: 'MealHub',
    icon: 'phone',
    tag: 'Java · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'Android Meal Planning App',
    highlights: [
      'Built an Android recipe and meal planning app in Java with Firebase Firestore, enabling users to browse cuisines, search food items, and persist personalised meal plans.',
      'Implemented a nutrition goal tracking system using SharedPreferences to set and track daily targets.',
    ],
    tech: ['Java', 'Android Studio', 'Firebase Firestore', 'RecyclerView', 'SharedPreferences'],
    image: './MealHub.webp',
    color: 'from-green-500/20 to-emerald-500/20',
    initial: 'M',
    links: [
      { label: 'Git repo', href: 'https://github.com/COMPSYS302/project-java-2026-project-java-team-10-1' },
    ],
  },
]

export default function Projects() {
  // space mode fits the whole section in one floating panel, so the cards
  // trade some padding and image height for a layout that needs no zoom-out
  const space = useLayout() === 'space'
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
      subtitle="A mix of hardware, software, and everything in between. Click a project on panel to see more details."
    >
      {/* master-detail explorer: every project is visible in the list at a
          glance; one click swaps the detail card. On small screens the list
          becomes a horizontal row of pills above the card. */}
      <div className="grid items-start gap-4 md:grid-cols-[minmax(220px,300px)_1fr]">
        <div>
          <div
            role="tablist"
            aria-label="Projects"
            className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
          >
          {PROJECTS.map((p, i) => (
            <button
              key={p.title}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`project-tab-${i}`}
              aria-selected={i === sel}
              aria-controls="project-panel"
              tabIndex={i === sel ? 0 : -1}
              onClick={() => setSel(i)}
              onKeyDown={onTabKeyDown}
              className={`shrink-0 rounded-xl border px-4 ${space ? 'py-2' : 'py-2.5'} text-left transition md:w-full ${
                i === sel
                  ? 'border-accent/60 bg-grey-200/80 dark:border-accent-dark/50 dark:bg-grey-900'
                  : 'border-grey-300/70 text-grey-600 hover:border-grey-400 hover:text-grey-900 dark:border-grey-800 dark:text-grey-400 dark:hover:border-grey-700 dark:hover:text-grey-100'
              }`}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium md:whitespace-normal">
                {p.featured && (
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="flex-none text-amber-500 dark:text-amber-400">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
                <ProjectIcon type={p.icon} />
                {p.title}
              </span>
              <span className="mt-0.5 hidden text-xs text-grey-500 dark:text-grey-500 md:block">{p.tag}</span>
            </button>
          ))}
          </div>
          <a
            href="https://github.com/EricK-6"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 px-4 pt-1 mt-2 text-xs text-grey-500 underline-offset-2 hover:text-accent hover:underline dark:text-grey-500 dark:hover:text-accent-dark md:flex"
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

// small identifying glyph per project shown in the explorer list (Winnie the
// Bot carries the amber award star via `featured` instead)
const ICON_STYLES = {
  cloud: 'text-sky-500 dark:text-sky-400',
  globe: 'text-indigo-500 dark:text-indigo-400',
  zap: 'text-yellow-500 dark:text-yellow-400',
  cpu: 'text-lime-600 dark:text-lime-400',
  chart: 'text-orange-500 dark:text-orange-400',
  phone: 'text-emerald-500 dark:text-emerald-400',
}

const ICON_PATHS = {
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
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${ICON_STYLES[type] ?? ''}`}
    >
      {ICON_PATHS[type]}
    </svg>
  )
}

function ProjectCard({ project, space }) {
  const { title, tag, year, period, org, role, highlights, tech, color, initial, image, featured, links } = project
  return (
    <article className={`card flex h-full flex-col overflow-hidden ${space ? 'p-4' : ''} ${featured ? 'ring-2 ring-amber-400/60 dark:ring-amber-500/40' : ''}`}>
      <div className={`relative ${space ? '-m-4 mb-4 h-28' : '-m-6 mb-6 h-44'} overflow-hidden ${image ? 'bg-grey-100 dark:bg-grey-800' : `bg-gradient-to-br ${color} flex items-center justify-center`}`}>
        {image ? (
          <img src={image} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
        <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest ${featured ? 'text-amber-600 dark:text-amber-400' : 'text-accent dark:text-accent-dark'}`}>
          {featured && (
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {tag}
        </div>
        <h3 className={`mt-1 font-semibold ${space ? 'text-lg' : 'text-xl'}`}>{title}</h3>
        {period && <div className="mt-0.5 text-sm text-grey-500 dark:text-grey-500">{period}</div>}
        {org && <div className="mt-0.5 text-sm text-grey-500 dark:text-grey-500">Associated with {org}</div>}
        <div className="mt-2 text-sm font-medium text-grey-700 dark:text-grey-300">:: {role}</div>

        {highlights?.length > 0 && (
          <ul className={`${space ? 'mt-2.5' : 'mt-4'} space-y-1.5 text-sm text-grey-700 dark:text-grey-300`}>
            {highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent dark:bg-accent-dark" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {tech?.length > 0 && (
          <div className={`${space ? 'mt-3' : 'mt-5'} flex flex-wrap gap-1.5`}>
            {tech.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {links?.length > 0 && (
          <div className={`${space ? 'mt-3' : 'mt-5'} flex flex-wrap gap-4`}>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline dark:text-accent-dark"
              >
                {l.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
