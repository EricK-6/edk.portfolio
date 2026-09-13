import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Section from './Section.jsx'
import { useOnScreen } from '../useOnScreen.js'

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
      'Designed and built the embedded electrical hardware for an AI powered interviewer robot using **dual ATmega328P NANO** microcontrollers, servos, an AI camera, and audio peripherals to drive simultaneous face tracking, arm movement, and real time voice interaction.',
      "Prototyped and refined the robot's enclosure through **iterative 3D printing** and multiple design revisions, delivering a compact, durable, and functional physical build that **placed 3rd** in the UoA ECSE Design Competition.",
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
    role: 'Statement-level Fraud Detection Platform',
    awardedBy: [
      'Amazon Web Services (AWS)',
      'Bank of New Zealand (BNZ)',
    ],
    highlights: [
      'Built a serverless fraud pipeline with **AWS (SNS, Lambda, Textract, Bedrock, DynamoDB)**, using Claude Opus 4.8 on Bedrock behind a **schema validated JSON contract**, to extract and flag anomalies across an entire bank statement in one call with cited transaction evidence.',
      'Proposed the approach to **BNZ** by drawing on prior individual project experience with serverless AWS pipelines, placing **top 8 out of 20+ teams**.',
    ],
    tech: ['AWS Lambda', 'Amazon Textract', 'Amazon Bedrock', 'Claude Opus 4.8', 'DynamoDB', 'Amazon S3', 'Amazon SNS', 'AWS SAM', 'React.js'],
    image: './spottern.webp', // also the video's poster
    video: './spottern.mp4',
    // 2940x1436. A dashboard is the one thing you cannot crop — a slice off
    // each end takes the readout with it — so this clip keeps its own shape
    // instead of being fitted to the row, and centres against the text beside
    // it. Everything else has no `aspect` and fills the row normally.
    aspect: 'aspect-[2940/1436]',
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
      'Built a serverless NLP pipeline with **AWS (Kinesis, Lambda, Comprehend, DynamoDB)** using AWS SAM, with a dead letter queue for failed batches, to classify streaming text sentiment in real time.',
      'Developed a **live React dashboard** on AWS Amplify, applying cloud and AI/ML fundamentals from certification study to a hands on project.',
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
      "Delivered the Korean Engineering Body's **first-ever website** using React 19, Vite, and React Bootstrap, giving the club a centralised hub for events and activities.",
      'Collaborated with senior software students to ship a **production-ready platform** from scratch.',
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
      'Designed a dual channel energy monitoring system, using **signal conditioned ADC sampling** on an **ATmega328P**, to compute RMS voltage, peak current, and average power in real time.',
      'Built and validated a **double layer PCB**, using **Altium Designer** and UART based output, to meet a **±5% full scale** accuracy spec across a 2.5 to 7.5 VA load range.',
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
      'Implemented a Flappy Bird style game in **VHDL**, using a custom VGA sync generator and PLL based clock division on a **DE0-CV FPGA**, to render real time sprite based gameplay.',
      'Built a **hardware LFSR** random number generator, using **shift register feedback logic**, to procedurally place pipe gaps and drive collision detection and scoring.',
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
      'Built a PyQt6 desktop analytics app with **pandas and Matplotlib**, automating a manual Excel workflow across **3 business units** and **52,000+ records**, cutting report time from a full day to **under 30 seconds**.',
      "Implemented three forecasting models across **36 months of data**, combining **scikit-learn** regression with a custom **NumPy** build of Holt's Exponential Smoothing, validated with MAE and RMSE.",
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
      'Built an Android recipe and meal planning app in **Java** with **Firebase Firestore**, enabling users to browse cuisines, search food items, and persist personalised meal plans.',
      'Implemented a **nutrition goal tracking** system using SharedPreferences to set and track daily targets.',
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
// A quiet rule-and-label separating the two shelves of the section.
function SubLabel({ children, count, className = '' }) {
  return (
    <div className={`flex items-baseline gap-3 border-b border-grey-200 pb-2.5 ${className}`}>
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
        {children}
      </h3>
      <span className="ml-auto font-mono text-[11px] tabular-nums text-grey-400">
        {String(count).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function Projects() {
  // Every project shows its own media.
  //
  // This was a master-detail explorer: a list of eight titles beside one
  // detail card. It was built for the old layout, where a section had to fit
  // inside a single fixed-height tile and only one thing could be on screen at
  // once. The cost was that seven of the eight projects were invisible at any
  // moment — and four of them are short videos of hardware actually running,
  // which is the most persuasive thing on the site. A recruiter skimming saw a
  // list of eight words.
  //
  // A scrolling document has no such constraint, so the section is now two
  // shelves. The two competition placements get a full-width row each, big
  // enough for the clip to read. The other six sit in a grid, all visible, all
  // showing their media. Depth did not go anywhere: the build log is still one
  // click away on the projects that have one.
  const featured = PROJECTS.filter((p) => p.featured)
  const rest = PROJECTS.filter((p) => !p.featured)

  return (
    <Section
      id="projects"
      kicker="Projects"
      title="Things I've built"
      subtitle="A mix of hardware, software, and everything in between."
      wide
    >
      <SubLabel count={featured.length}>Awarded</SubLabel>
      <div className="mt-6 space-y-8 sm:space-y-12">
        {featured.map((p, i) => (
          <FeatureRow key={p.title} project={p} reverse={i % 2 === 1} />
        ))}
      </div>

      <SubLabel count={rest.length} className="mt-14">Selected projects</SubLabel>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
    </Section>
  )
}

// The clip or the still, in a 16:10 well.
//
// A video only plays while it is actually on screen — with four of them in one
// section, letting them all loop the whole way down the page is real battery
// for no benefit, and `useOnScreen` answers the honest question of whether
// anyone can see it.
function ProjectMedia({ project, rounded = 'rounded-xl', fill = false }) {
  const { title, image, video, focus, aspect, color, initial, year, rank } = project
  const ref = useRef(null)
  const onScreen = useOnScreen(ref)

  useEffect(() => {
    const v = ref.current
    if (!v || !video) return
    if (onScreen) v.play().catch(() => { /* autoplay policy: the poster stays */ })
    else v.pause()
  }, [onScreen, video])

  // Three cases, and only one of them crops.
  //
  // `aspect` means the clip carries its own shape — a wide dashboard, say —
  // so the box is cut to fit the picture rather than the picture to the box.
  // Nothing is lost and there is no grey to pad it out with; the row centres
  // it against the text instead.
  //
  // Otherwise a feature row stretches the well to the row's height (`fill`),
  // and a grid card uses a plain 16:10. Both cover, because both are ordinary
  // photographs and stills where a small crop costs nothing.
  const box = aspect || (fill ? 'aspect-[16/10] md:aspect-auto md:h-full' : 'aspect-[16/10]')

  return (
    <div
      className={`relative w-full ${box} overflow-hidden ${rounded} ${
        image || video ? 'bg-grey-100' : `bg-gradient-to-br ${color} flex items-center justify-center`
      }`}
    >
      {video ? (
        <video
          ref={ref}
          src={video}
          poster={image}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${title} demo`}
          className="h-full w-full object-cover"
          style={focus ? { objectPosition: focus } : undefined}
        />
      ) : image ? (
        <img
          ref={ref}
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={focus ? { objectPosition: focus } : undefined}
        />
      ) : (
        <span className="relative text-6xl font-extrabold text-white/90 drop-shadow-sm">{initial}</span>
      )}
      {/* Both badges live inside the media box, not on the column around it.
          The column is full height so a clip can centre in it — pinning the
          rank to the column left it floating in the gap above the picture,
          while the year (already in here) sat correctly on the corner. */}
      {rank && (
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur">
          <RankChip rank={rank} />
        </span>
      )}
      {year && (
        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-grey-800 backdrop-blur">
          {year}
        </span>
      )}
    </div>
  )
}

// An awarded project, full width: the clip on one side and the case for it on
// the other. The two alternate sides so the pair does not read as one block.
function FeatureRow({ project, reverse }) {
  const { title, tag, period, role, awardedBy, hostedBy, org, highlights, tech, links, log } = project
  const [logOpen, setLogOpen] = useState(false)

  return (
    // Both columns stretch to the same height and both finish on the same
    // line. Neither centring nor top-aligning did that: the two clips are
    // different shapes (a 1.28:1 robot video, a 2.05:1 dashboard), so one side
    // always ran out before the other and the row read as lopsided. Now the
    // well takes its height from the row, and the text column is a flex column
    // whose tech and links are pushed to the bottom — so the picture and the
    // case for it share a top edge and a bottom edge.
    <article className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:gap-10">
      {/* items-center: a clip that keeps its own shape sits level with the
          middle of the text beside it. One that fills the row is already the
          full height, so centring costs it nothing. */}
      <div className={`relative flex items-center ${reverse ? 'md:order-2' : ''}`}>
        <ProjectMedia project={project} rounded="rounded-2xl" fill />
      </div>

      <div className={`flex flex-col ${reverse ? 'md:order-1' : ''}`}>
        {tag && (
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-award">
            {tag}
          </div>
        )}
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-grey-900 sm:text-2xl">{title}</h4>
        <div className="mt-1 text-sm text-grey-500">{period}</div>
        <div className="mt-2 text-sm font-medium text-grey-700">:: {role}</div>

        {(awardedBy || hostedBy || org) && (
          <Affiliation
            label={awardedBy ? 'Awarded by' : hostedBy ? 'Hosted by' : 'Associated with'}
            names={awardedBy ?? hostedBy ?? [org]}
          />
        )}

        {highlights?.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-grey-700">
            {highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden="true" className="mt-[0.5em] inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                <span>{emphasise(h)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* mt-auto: the stack below the prose sits on the bottom edge of the
            row, level with the foot of the picture beside it */}
        {tech?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {tech.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <ProjectLinks
          links={links}
          log={log}
          onOpenLog={() => setLogOpen(true)}
          className={tech?.length > 0 ? 'mt-5' : 'mt-auto pt-5'}
        />
      </div>

      {logOpen && <BuildLogModal project={project} onClose={() => setLogOpen(false)} />}
    </article>
  )
}

// One of the six, in the grid.
//
// The card shows what the work is; a press turns it over for why it matters —
// the same two highlights the featured rows carry, plus the full tech list.
// Same contract as the certificate medallions: nothing moves until you ask,
// and the next press puts it back.
//
// The links are deliberately outside the part that turns over. They sit in a
// footer that both faces share, so a demo or a repo is one click away whether
// the card is showing its picture or its detail — and, because the footer is
// a sibling of the toggle rather than inside it, those links are never nested
// inside a button.
//
// The detail is an overlay pinned to the flip region rather than an expansion,
// so opening one never changes the height of its grid row and never pushes the
// five cards around it.
function ProjectCard({ project }) {
  const { title, tag, role, highlights, tech, icon, links, log } = project
  const [open, setOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const frontRef = useRef(null)
  const detailRef = useRef(null)
  const hasOpened = useRef(false)

  // A disclosure has to hand focus back where it came from. Opening moves it
  // into the detail (so a screen reader lands on what appeared, and Escape has
  // somewhere to be heard); closing returns it to the card that opened it.
  //
  // Both happen in the effect, not in the handlers: the front is `invisible`
  // while the card is open, and calling .focus() on it from inside the click
  // handler ran before React had re-rendered — so it was still unfocusable,
  // the call silently did nothing, and focus fell to <body>.
  useEffect(() => {
    if (open) {
      hasOpened.current = true
      detailRef.current?.focus()
    } else if (hasOpened.current) {
      hasOpened.current = false
      frontRef.current?.focus()
    }
  }, [open])

  return (
    <article className="card flex h-full flex-col overflow-hidden !p-0">
      {/* the part that turns over */}
      <div className="relative flex flex-1 flex-col">
        <div
          ref={frontRef}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label={`${title}: show details`}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) }
          }}
          className={`flex flex-1 cursor-pointer flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
            open ? 'invisible' : ''
          }`}
        >
          <ProjectMedia project={project} rounded="rounded-none" />

          <div className="flex flex-1 flex-col p-5">
            <h4 className="flex items-center gap-2 text-[15px] font-semibold text-grey-900">
              <ProjectIcon type={icon} />
              {title}
            </h4>
            <div className="mt-0.5 text-xs text-grey-500">{tag}</div>
            <div className="mt-2 text-sm text-grey-700">{role}</div>

            {tech?.length > 0 && (
              // capped at four on the front; the detail face carries the lot
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tech.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
                {tech.length > 4 && (
                  <span className="self-center font-mono text-[11px] text-grey-400">+{tech.length - 4}</span>
                )}
              </div>
            )}

            <div className="mt-auto pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400">
              Click for details
            </div>
          </div>
        </div>

        {open && (
          <div
            ref={detailRef}
            tabIndex={-1}
            // a press anywhere on the face puts it back
            onClick={() => setOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
            className="absolute inset-0 z-10 flex flex-col gap-3 overflow-y-auto overscroll-contain bg-white p-5 focus:outline-none"
          >
            <h4 className="flex items-center gap-2 text-[15px] font-semibold text-grey-900">
              <ProjectIcon type={icon} />
              {title}
            </h4>

            {highlights?.length > 0 && (
              <ul className="space-y-2 text-[13px] leading-relaxed text-grey-700">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[0.5em] inline-block h-1 w-1 flex-none rounded-full bg-accent" />
                    <span>{emphasise(h)}</span>
                  </li>
                ))}
              </ul>
            )}

            {tech?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tech.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false) }}
              className="mt-auto self-start pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400 transition-colors hover:text-grey-700"
            >
              Click again to close
            </button>
          </div>
        )}
      </div>

      {/* the footer both faces share */}
      {(log || links?.length > 0) && (
        <div className="border-t border-grey-200 px-5 py-4">
          <ProjectLinks links={links} log={log} onOpenLog={() => setLogOpen(true)} />
        </div>
      )}

      {logOpen && <BuildLogModal project={project} onClose={() => setLogOpen(false)} />}
    </article>
  )
}

function ProjectLinks({ links, log, onOpenLog, className = '' }) {
  if (!log && !links?.length) return null
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {log && (
        <button
          type="button"
          onClick={onOpenLog}
          className="tap-44 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
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
            className="tap-44 inline-flex items-center gap-1.5 rounded-lg border border-grey-300 bg-white px-3 py-1.5 text-sm font-medium text-grey-800 transition hover:border-grey-400 hover:text-grey-900"
          >
            {demo && <LiveLed />}
            {git && <GitHubIcon />}
            {l.label}
            {!demo && !git && ' →'}
          </a>
        )
      })}
    </div>
  )
}

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

// `**like this**` in a highlight becomes the same emphasis About uses for the
// phrases that matter. Two full sentences of flat grey give the eye nothing to
// land on, and these bullets are the densest text on the page; the bolded runs
// are the ones the CV itself bolds, so the site and the PDF stress the same
// things. Kept as markers in the data rather than JSX so the strings stay
// readable straight against the CV.
function emphasise(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-grey-900">{part}</strong>
      : <Fragment key={i}>{part}</Fragment>
  )
}

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

function Affiliation({ label, names }) {
  return (
    <div className="mt-3">
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

// Case-study modal styled as a build log. Still rendered through a portal:
// the transformed tile ancestors that used to capture `position: fixed` are
// gone, but a modal belongs at the top of the document either way, out of
// reach of any ancestor's overflow or stacking context.
// Everything a Tab is allowed to land on inside the dialog.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function BuildLogModal({ project, onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    // freeze the page behind the modal; SunriseLayout reads this to pause
    // its wheel/arrow travel handlers too
    const prev = document.body.style.overflow
    const opener = document.activeElement // the control that opened this
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (e.key !== 'Tab') return
      // Tab has to stay inside. The dialog is portalled to the end of
      // <body>, so the first Tab used to walk straight past it into the page
      // it is covering — the terminal drawer, then the whole navbar — with
      // the modal still open and nothing on screen to say where focus went.
      const items = [...(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (!items.length) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = panelRef.current.contains(active)
      if (e.shiftKey ? (active === first || !inside) : (active === last || !inside)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      // hand the keyboard back to the control that opened the dialog, rather
      // than dropping it wherever the last Tab happened to leave it
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panelRef}
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
                <p key={para} className="mt-1.5 text-sm leading-relaxed text-grey-700 dark:text-grey-300">
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
