import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const PROJECTS = [
  {
    title: 'Winnie the Bot',
    tag: '3rd Place — ECSE Design Competition',
    year: '2025',
    role: 'Team · Hardware & software integration',
    description:
      'An interactive robot featuring face recognition, speech input/output, servo-based movement, and ChatGPT-powered dialogue. I contributed across hardware integration, Python interfacing, and exhibition materials.',
    highlights: [
      'Face recognition + speech pipeline',
      'ChatGPT-driven dialogue loop',
      'Servo-based expressive movement',
    ],
    tech: ['Python', 'Embedded C', 'ChatGPT API', 'OpenCV', 'Servos'],
    image: './winnie.jpg',
    featured: true,
    color: 'from-amber-500/20 to-rose-500/20',
    initial: 'W',
    links: [],
  },
  {
    title: 'Sentiment PULSE',
    tag: 'AWS · Individual Project',
    year: '2026',
    role: 'Solo · Cloud & front-end',
    description:
      'A serverless sentiment analysis pipeline on AWS — Kinesis, Lambda, Comprehend, and DynamoDB — paired with a live React dashboard featuring hand-drawn SVG visualisations. Provisioned end-to-end with SAM Infrastructure as Code and deployed via AWS Amplify.',
    highlights: [
      'Serverless pipeline: Kinesis → Lambda → Comprehend → DynamoDB',
      'Live React dashboard with hand-drawn SVG visualisations',
      'SAM IaC, deployed on AWS Amplify',
    ],
    tech: ['AWS', 'Lambda', 'Kinesis', 'Comprehend', 'DynamoDB', 'SAM', 'React', 'Amplify'],
    image: './sentiment_pulse.png',
    color: 'from-cyan-500/20 to-blue-500/20',
    initial: 'S',
    links: [
      { label: 'View project', href: 'https://github.com/EricK-6/sentiment-dashboard' },
    ],
  },
  {
    title: 'Smart Energy Monitor',
    tag: 'Embedded Systems Design',
    year: '2025',
    role: 'Team · Firmware + PCB',
    description:
      'An embedded system that measures and displays real-time household energy usage. Built on ATmega microcontrollers with full-stack embedded work — sensor interfacing, ADC data handling, signal conditioning, PCB design, and simulation.',
    highlights: [
      'ATmega firmware in embedded C',
      'Altium PCB design + LTspice simulation',
      'ADC pipeline with signal conditioning',
    ],
    tech: ['ATmega', 'Embedded C', 'Altium', 'LTspice', 'ADC'],
    image: './energy-monitor.png',
    color: 'from-emerald-500/20 to-teal-500/20',
    initial: 'E',
    links: [
      { label: 'View project', href: 'https://github.com/uoa-ece209-2025/ec209-2025-labs-dkim766' },
    ],
  },
  {
    title: 'KEB Project Playground',
    tag: 'Web Design',
    year: '2025',
    role: 'Team · Front-end',
    description:
      'A React-based website for the Korean Engineering Body (KEB) at UoA, showcasing events and executives. Collaborated with senior students on Figma designs and implemented interactive layouts and reusable components.',
    highlights: [
      'React component architecture',
      'Figma → code collaboration',
      'Responsive interactive layouts',
    ],
    tech: ['React', 'JavaScript', 'Figma', 'HTML/CSS'],
    image: './keb.png',
    color: 'from-sky-500/20 to-indigo-500/20',
    initial: 'K',
    links: [
      { label: 'View project', href: 'https://github.com/Patrick-Sheng/keb-project' },
    ],
  },
  {
    title: 'RoastWorks Analytics',
    tag: 'Team Project',
    year: '2026',
    role: 'Team · Data & analytics',
    description:
      'A Python desktop analytics app built with PyQt6 and pandas that automated a full-day Excel reporting workflow into under 30 seconds. Includes three time-series forecasting models with holdout MAE/RMSE validation and configurable horizons.',
    highlights: [
      'Full-day Excel workflow reduced to <30 seconds',
      'Three time-series forecasting models',
      'Holdout MAE/RMSE validation with configurable horizons',
    ],
    tech: ['Python', 'PyQt6', 'pandas'],
    image: './roastworks.png',
    color: 'from-orange-500/20 to-amber-500/20',
    initial: 'R',
    links: [
      { label: 'View project', href: 'https://github.com/COMPSYS302/project-python-cs302-2026-python-project-24' },
    ],
  },
]

export default function Projects() {
  return (
    <Section
      id="projects"
      kicker="Projects"
      title="Things I've built"
      subtitle="A mix of hardware, software, and everything in between. Each project stretched a different part of the Computer Systems Engineering stack."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
        More on my <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="underline hover:text-accent dark:hover:text-accent-dark">GitHub</a>.
      </p>
    </Section>
  )
}

function ProjectCard({ project }) {
  const { title, tag, year, role, description, highlights, tech, color, initial, image, featured, links } = project
  return (
    <article className={`card flex flex-col overflow-hidden ${featured ? 'ring-2 ring-amber-400/60 dark:ring-amber-500/40' : ''}`}>
      <div className={`relative -m-6 mb-6 h-44 overflow-hidden ${image ? 'bg-zinc-100 dark:bg-zinc-800' : `bg-gradient-to-br ${color} flex items-center justify-center`}`}>
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.3),transparent_50%)]" />
            <span className="relative text-6xl font-extrabold text-white/90 drop-shadow-sm">{initial}</span>
          </>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-800 backdrop-blur dark:bg-zinc-900/80 dark:text-zinc-200">
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
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        <div className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">{role}</div>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {description}
        </p>

        {highlights?.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            {highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent dark:bg-accent-dark" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {tech?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {links?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-4">
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
