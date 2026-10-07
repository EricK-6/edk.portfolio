import { useEffect, useRef, useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { ROLES } from '../content'

// ongoing or explicitly pinned roles on top (KEB stays first even though its
// period now has an end date), then most recent first
const isPinned = (r: (typeof ROLES)[number]) => Boolean(r.pinned) || r.period.includes('Present')
const ITEMS = [
  ...ROLES.filter(isPinned),
  ...ROLES.filter((r) => !isPinned(r)).reverse(),
]

type Point = { x: number; y: number }

export default function Leadership() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLElement | null)[]>([])
  const [path, setPath] = useState('')
  const [runnerPath, setRunnerPath] = useState('')

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const build = () => {
      // measure in layout space (offsetLeft/Top): unlike client rects these
      // ignore transforms, so the curve lands exactly on the dots even while
      // the reveal animation is mid-translate
      const centerOf = (el: HTMLElement): Point => {
        let x = el.offsetWidth / 2
        let y = el.offsetHeight / 2
        for (let n: HTMLElement | null = el; n && n !== wrap; n = n.offsetParent as HTMLElement | null) {
          x += n.offsetLeft
          y += n.offsetTop
        }
        return { x, y }
      }
      const pts = nodeRefs.current
        .filter((n): n is HTMLElement => n !== null && n.offsetParent !== null) // skip nodes hidden on mobile
        .map(centerOf)
      if (pts.length < 2) {
        setPath('')
        setRunnerPath('')
        return
      }
      // smooth serpentine: vertical control points create flowing S-curves
      const curveThrough = (points: Point[]) => {
        let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1]
          const b = points[i]
          const my = (a.y + b.y) / 2
          d += ` C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
        }
        return d
      }
      setPath(curveThrough(pts))
      // the runner flies the same curve reversed (bottom-to-top): SMIL's
      // rotate="auto" follows the path's own direction, so reversing the path
      // (rather than keyPoints) keeps the plane's nose pointing along travel
      setRunnerPath(curveThrough([...pts].reverse()))
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
    <Section id="leadership" kicker="Leadership" title="Clubs and competitions">
      <div ref={wrapRef} className="relative">
        {/* curved Z connector (desktop) */}
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden="true">
          <path
            d={path}
            fill="none"
            className="stroke-accent/40"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* a pulse travelling the curve bottom-to-top, forever: this used to
              be a paper plane, which went with the retired flight theme */}
          {runnerPath && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
            <g className="fill-accent">
              <circle r="4" />
              <circle r="8" fillOpacity="0.22" />
              <animateMotion
                dur="4.5s"
                repeatCount="indefinite"
                path={runnerPath}
              />
            </g>
          )}
        </svg>
        {/* straight spine (mobile) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-4 w-px bg-grey-200 md:hidden"
        />

        <ol className="relative">
          {ITEMS.map((r, i) => {
            const left = i % 2 === 0
            return (
              <Reveal
                as="li"
                key={`${r.title}-${r.org}`}
                delay={i * 70}
                className={`relative block pl-12 md:pl-0 first:mt-0 md:first:mt-0 mt-4 md:-mt-20`}
              >
                {/* Boxed, unlike Education just above it, and the overlap is
                    why. `md:-mt-20` pulls every entry up over the one before
                    it so the serpentine stays tight, and the nodes are
                    positioned against this block's inner edge and then
                    measured to build the curve. Borderless it still worked,
                    but the five ran together — the curve says they are a
                    sequence, nothing said where one stopped. A hairline under
                    each was not enough either, so the outline is back: here it
                    is the thing doing the separating, not decoration. */}
                <div className={`card relative md:w-[calc(50%-3rem)] ${left ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  {/* node sitting on the curve (desktop, inner edge) */}
                  <span
                    ref={(el: HTMLSpanElement | null) => { nodeRefs.current[i] = el }}
                    className={`absolute top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-grey-300 md:block ${left ? '-right-1.5' : '-left-1.5'}`}
                  />
                  {/* node on the spine (mobile) */}
                  <span className="absolute top-6 -left-8 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-grey-300 md:hidden" />

                  <div className="flex gap-4">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.org}
                        loading="lazy"
                        decoding="async"
                        className={`h-14 w-14 flex-none rounded-full bg-grey-50 object-contain p-1.5 ring-1 ring-grey-200`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{r.title}</h3>
                      {r.detail && (
                        <div className="text-xs font-medium text-accent">{r.detail}</div>
                      )}
                      <div className="text-sm text-grey-500">{r.org}</div>
                      <div className="mt-1 text-xs text-grey-500">{r.period}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-grey-700">
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
