import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'
import { useLayout } from '../layout.js'

const ROLES = [
  {
    title: 'Academic Team Executive',
    org: 'Korean Engineering Body (KEB)',
    period: 'Jul 2024 - Present',
    image: './KEB.png',
    description:
      'Tutor junior engineering students and assist in planning academic events for the student community.',
  },
  {
    title: 'Student Mentor',
    org: 'Korean Engineering Body (KEB)',
    period: 'Feb 2025 - Oct 2025',
    image: './KEB.png',
    description:
      'Provided personalised mentoring to first year students, supporting their transition into university life and academic engagement.',
  },
  {
    title: 'Full time Volunteer',
    org: 'IEEE · NZ Robotics Olympiad 2025',
    period: 'Jul 2025',
    image: './IEEE.png',
    description:
      'Volunteered 40+ hours full time supporting competition operations at the NZ Robotics Olympiad (NZRO) 2025 with the Institute of Electrical and Electronics Engineers (IEEE).',
  },
  {
    title: 'Logistics Team Member',
    org: 'The NZPMC Ltd',
    period: 'Jul 2025',
    image: './nzpmc.jpeg',
    description:
      'Part of the logistics team for the New Zealand Physics and Math Competition (NZPMC).',
  },
  {
    title: 'Student Volunteer',
    org: 'CARES · World Robot Olympiad 2026',
    period: 'May 2026',
    image: './cares.jpeg',
    description:
      'Volunteered at the World Robot Olympiad (WRO) 2026 with the Centre for Automation and Robotic Engineering Science (CARES).',
  },
]

// most recent first
const ITEMS = [...ROLES].reverse()

export default function Leadership() {
  // space mode: trim card padding so the section sits near full scale in its
  // floating panel without the serpentine columns colliding
  const space = useLayout() === 'space'
  const wrapRef = useRef(null)
  const nodeRefs = useRef([])
  const [path, setPath] = useState('')

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const build = () => {
      // measure in layout space (offsetLeft/Top): unlike client rects these
      // ignore transforms, so the curve lands exactly on the dots even while
      // the reveal animation is mid-translate or space mode scales the panel
      const centerOf = (el) => {
        let x = el.offsetWidth / 2
        let y = el.offsetHeight / 2
        for (let n = el; n && n !== wrap; n = n.offsetParent) {
          x += n.offsetLeft
          y += n.offsetTop
        }
        return { x, y }
      }
      const pts = nodeRefs.current
        .filter((n) => n && n.offsetParent) // skip nodes hidden on mobile
        .map(centerOf)
      if (pts.length < 2) {
        setPath('')
        return
      }
      // smooth serpentine: vertical control points create flowing S-curves
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const my = (a.y + b.y) / 2
        d += ` C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
      }
      setPath(d)
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(wrap)
    window.addEventListener('load', build)
    return () => {
      ro.disconnect()
      window.removeEventListener('load', build)
    }
  }, [])

  return (
    <Section id="leadership" kicker="Leadership" title="Activities & Leadership">
      <div ref={wrapRef} className="relative">
        {/* curved Z connector (desktop) */}
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden="true">
          <path
            d={path}
            fill="none"
            className="stroke-accent/40 dark:stroke-accent-dark/40"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* a runner dot travelling the curve bottom-to-top, forever */}
          {path && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
            <circle r="4.5" className="fill-accent dark:fill-accent-dark">
              <animateMotion
                dur="4.5s"
                repeatCount="indefinite"
                calcMode="linear"
                keyPoints="1;0"
                keyTimes="0;1"
                path={path}
              />
            </circle>
          )}
        </svg>
        {/* straight spine (mobile) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-4 w-px bg-grey-200 dark:bg-grey-800 md:hidden"
        />

        <ol className="relative">
          {ITEMS.map((r, i) => {
            const left = i % 2 === 0
            return (
              <Reveal
                as="li"
                key={r.title}
                delay={i * 70}
                className="relative block pl-12 md:pl-0 mt-6 first:mt-0 md:-mt-16 md:first:mt-0"
              >
                <div className={`card relative md:w-[calc(50%-3rem)] ${space ? 'p-4' : ''} ${left ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  {/* node sitting on the curve (desktop, inner edge) */}
                  <span
                    ref={(el) => (nodeRefs.current[i] = el)}
                    className={`absolute top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-grey-300 dark:bg-accent-dark dark:ring-grey-950 md:block ${left ? '-right-1.5' : '-left-1.5'}`}
                  />
                  {/* node on the spine (mobile) */}
                  <span className="absolute top-6 -left-8 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-grey-300 dark:bg-accent-dark dark:ring-grey-950 md:hidden" />

                  <div className="flex gap-4">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.org}
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-14 flex-none rounded-full bg-grey-50 object-contain p-1.5 ring-1 ring-grey-200 dark:ring-grey-800"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{r.title}</h3>
                      <div className="text-sm text-grey-500 dark:text-grey-500">{r.org}</div>
                      <div className="mt-1 text-xs text-grey-500 dark:text-grey-500">{r.period}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-grey-700 dark:text-grey-300 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
