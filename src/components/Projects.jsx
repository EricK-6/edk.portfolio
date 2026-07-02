import { useEffect, useRef } from 'react'
import Section from './Section.jsx'

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
    period: 'May 2026 – Present',
    role: 'Real-time Serverless Data pipeline',
    highlights: [
      'Built a serverless NLP pipeline on AWS (Kinesis, Lambda, Comprehend, DynamoDB) with AWS SAM in order to classify streaming text sentiment in real time.',
      'Developed a live React dashboard on AWS Amplify to visualise sentiment trends and confidence scores.',
    ],
    tech: ['Amazon Kinesis', 'AWS Lambda', 'Amazon Comprehend', 'DynamoDB', 'AWS SAM', 'React.js', 'AWS Amplify'],
    image: './pulse.png',
    color: 'from-cyan-500/20 to-blue-500/20',
    initial: 'S',
    links: [
      { label: 'Deployed DEMO', href: 'https://master.d3t61ak2oiedfz.amplifyapp.com/' },
      { label: 'Git repo', href: 'https://github.com/EricK-6/sentiment-dashboard' },
    ],
  },
  {
    title: 'Smart Energy Monitor',
    tag: 'C & Embedded · Team Project',
    year: '2025',
    org: 'University of Auckland',
    role: 'Embedded Energy Monitoring System',
    highlights: [
      'Designed an embedded energy monitoring system using ATmega328P microcontrollers with ADC processing in order to measure and display real-time energy usage.',
      'Produced a validated PCB schematic using Altium Designer in order to achieve accurate signal conditioning.',
    ],
    tech: ['C', 'Atmel AVR', 'ATmega328P', 'Altium Designer', 'LTspice'],
    image: './energy_monitor.png',
    color: 'from-emerald-500/20 to-teal-500/20',
    initial: 'E',
    links: [
      { label: 'Git repo', href: 'https://github.com/uoa-ece209-2025/ec209-2025-project-2025_team_41' },
    ],
  },
  {
    title: 'Flappy Universe',
    tag: 'VHDL · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'FPGA Game Implementation',
    highlights: [
      'Implemented a Flappy Bird-style game in VHDL on an Altera FPGA with VGA output and sprite rendering in order to demonstrate real-time hardware design.',
      'Developed a pixel-priority VHDL pipeline in order to render game scenes at VGA resolution.',
    ],
    tech: ['VHDL', 'Intel Quartus Prime', 'Altera FPGA'],
    image: './flappy_universe.png',
    color: 'from-lime-500/20 to-green-500/20',
    initial: 'F',
    links: [
      { label: 'Git repo', href: 'https://github.com/jpar483/COMPSYS305_MiniProject' },
    ],
  },
  {
    title: 'RoastWorks Analytics',
    tag: 'Python · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'Business Analytics Dashboard',
    highlights: [
      'Built a desktop business analytics app with a PyQt6 GUI using pandas and Matplotlib, delivering sales performance dashboards with KPI tracking across three business units.',
      "Implemented a scikit-learn forecasting module using Linear Regression and Holt's Exponential Smoothing.",
    ],
    tech: ['Python', 'Pandas', 'scikit-learn'],
    image: './roastworks.png',
    color: 'from-orange-500/20 to-amber-500/20',
    initial: 'R',
    links: [
      { label: 'Git repo', href: 'https://github.com/COMPSYS302/project-python-cs302-2026-python-project-24' },
    ],
  },
  {
    title: 'MealHub',
    tag: 'Java · Team Project',
    year: '2026',
    org: 'University of Auckland',
    role: 'Android Meal Planning App',
    highlights: [
      'Built an Android recipe and meal planning app in Java with Firebase Firestore, enabling users to browse cuisines, search food items, and persist personalised meal plans.',
      'Implemented a nutrition goal tracking system using SharedPreferences to set and track daily targets.',
    ],
    tech: ['Java', 'Android Studio', 'Firebase Firestore', 'RecyclerView', 'SharedPreferences'],
    image: './MealHub.png',
    color: 'from-green-500/20 to-emerald-500/20',
    initial: 'M',
    links: [
      { label: 'Git repo', href: 'https://github.com/COMPSYS302/project-java-2026-project-java-team-10-1' },
    ],
  },
  {
    title: 'KEB Web Design',
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
    image: './KEBWebDesign.png',
    color: 'from-sky-500/20 to-indigo-500/20',
    initial: 'K',
    links: [
      { label: 'Deployed DEMO', href: 'https://keb-project.vercel.app/' },
      { label: 'Git repo', href: 'https://github.com/Patrick-Sheng/keb-project' },
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
      <ProjectsCarousel projects={PROJECTS} />

      <p className="mt-8 text-sm text-grey-500 dark:text-grey-500">
        More on my <a href="https://github.com/EricK-6" target="_blank" rel="noreferrer" className="underline hover:text-accent dark:hover:text-accent-dark">GitHub</a>.
      </p>
    </Section>
  )
}

function ProjectsCarousel({ projects }) {
  const scrollerRef = useRef(null)
  const apiRef = useRef({})
  const N = projects.length
  // three identical copies give a seamless infinite loop in both directions
  const loop = [...projects, ...projects, ...projects]

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const centerOffset = (i) => {
      const c = el.children[i]
      return c.offsetLeft + c.offsetWidth / 2 - el.clientWidth / 2
    }
    // exact width of one copy (distance between matching cards in adjacent copies)
    const copyWidth = () => el.children[2 * N].offsetLeft - el.children[N].offsetLeft

    // coverflow-style 3D tilt: the centred card sits flat and full size while
    // its neighbours rotate away, shrink, and recede in depth
    const render3d = () => {
      const viewCenter = el.scrollLeft + el.clientWidth / 2
      const step = el.children[0].offsetWidth + 24
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i]
        const cc = child.offsetLeft + child.offsetWidth / 2
        const delta = (cc - viewCenter) / step
        const ad = Math.min(Math.abs(delta), 1)
        const clamped = Math.max(-1.5, Math.min(1.5, delta))
        child.style.transform = `rotateY(${clamped * -32}deg) scale(${1 - ad * 0.22}) translateZ(${-ad * 170}px)`
        child.style.opacity = `${1 - ad * 0.3}`
        child.style.zIndex = `${100 - Math.round(Math.abs(delta) * 10)}`
      }
    }

    const nearestIndex = () => {
      const viewCenter = el.scrollLeft + el.clientWidth / 2
      let n = 0
      let best = Infinity
      for (let i = 0; i < el.children.length; i++) {
        const cc = el.children[i].offsetLeft + el.children[i].offsetWidth / 2
        const d = Math.abs(cc - viewCenter)
        if (d < best) {
          best = d
          n = i
        }
      }
      return n
    }

    // keep the given card index inside the middle copy with an invisible jump
    // (the copies are identical), so the loop never reaches an end
    const normalize = (idx) => {
      const cw = copyWidth()
      if (idx < N) {
        el.scrollLeft += cw
        return idx + N
      }
      if (idx >= 2 * N) {
        el.scrollLeft -= cw
        return idx - N
      }
      return idx
    }

    // self-contained eased scroll tween (more reliable than native smooth scroll)
    let snapRaf = 0
    const animateTo = (target) => {
      cancelAnimationFrame(snapRaf)
      const start = el.scrollLeft
      const dist = target - start
      if (Math.abs(dist) < 1) {
        render3d()
        return
      }
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 380)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        el.scrollLeft = start + dist * eased
        render3d()
        if (p < 1) snapRaf = requestAnimationFrame(tick)
      }
      snapRaf = requestAnimationFrame(tick)
    }

    // glide the nearest card to the exact centre once scrolling settles, so
    // every card takes its turn fully centred and grown to full size
    const settleSnap = () => {
      const nearest = normalize(nearestIndex())
      animateTo(centerOffset(nearest))
    }

    // prev / next buttons
    apiRef.current.go = (dir) => {
      cancelAnimationFrame(snapRaf)
      const nearest = normalize(nearestIndex())
      const t = el.children[nearest + dir]
      if (t) animateTo(t.offsetLeft + t.offsetWidth / 2 - el.clientWidth / 2)
    }

    // start centered on the middle copy
    el.scrollLeft = centerOffset(N)
    render3d()

    let raf = 0
    let settle = 0
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; render3d() })
      clearTimeout(settle)
      settle = setTimeout(settleSnap, 140)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    // let a vertical wheel / trackpad scroll drive the horizontal carousel,
    // so scrolling brings the next card to the centre (and grows it)
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (!delta) return
      cancelAnimationFrame(snapRaf) // don't fight the user mid-snap
      el.scrollLeft += delta
      e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    const ro = new ResizeObserver(() => {
      el.scrollLeft = centerOffset(N)
      render3d()
    })
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      ro.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(snapRaf)
      clearTimeout(settle)
    }
  }, [N])

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Projects carousel"
        className="no-scrollbar flex gap-6 overflow-x-auto px-[6%] py-10 [perspective:1600px]"
      >
        {loop.map((p, i) => {
          const clone = i < N || i >= 2 * N
          return (
            <div
              key={i}
              aria-hidden={clone || undefined}
              className="shrink-0 grow-0 basis-[86%] sm:basis-[64%] lg:basis-[52%]"
            >
              <ProjectCard project={p} clone={clone} />
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => apiRef.current.go?.(-1)}
        aria-label="Previous project"
        className="absolute left-1 sm:left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-grey-300 bg-grey-100/90 text-grey-700 shadow-md backdrop-blur transition hover:bg-grey-200 hover:text-accent dark:border-grey-700 dark:bg-grey-900/90 dark:text-grey-200 dark:hover:text-accent-dark"
      >
        <ChevronIcon dir="left" />
      </button>
      <button
        type="button"
        onClick={() => apiRef.current.go?.(1)}
        aria-label="Next project"
        className="absolute right-1 sm:right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-grey-300 bg-grey-100/90 text-grey-700 shadow-md backdrop-blur transition hover:bg-grey-200 hover:text-accent dark:border-grey-700 dark:bg-grey-900/90 dark:text-grey-200 dark:hover:text-accent-dark"
      >
        <ChevronIcon dir="right" />
      </button>
    </div>
  )
}

function ChevronIcon({ dir }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

function ProjectCard({ project, clone }) {
  const { title, tag, year, period, org, role, highlights, tech, color, initial, image, featured, links } = project
  return (
    <article className={`card flex h-full flex-col overflow-hidden ${featured ? 'ring-2 ring-amber-400/60 dark:ring-amber-500/40' : ''}`}>
      <div className={`relative -m-6 mb-6 h-44 overflow-hidden ${image ? 'bg-grey-100 dark:bg-grey-800' : `bg-gradient-to-br ${color} flex items-center justify-center`}`}>
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
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        {period && <div className="mt-0.5 text-sm text-grey-500 dark:text-grey-500">{period}</div>}
        {org && <div className="mt-0.5 text-sm text-grey-500 dark:text-grey-500">Associated with {org}</div>}
        <div className="mt-2 text-sm font-medium text-grey-700 dark:text-grey-300">:: {role}</div>

        {highlights?.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-grey-700 dark:text-grey-300">
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
                tabIndex={clone ? -1 : undefined}
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
