import Section from './Section'
import Reveal from './Reveal'
import { useEffect, useRef } from 'react'
import { EXPERIENCE } from '../content'

// plays only while on screen, so three clips don't decode off-screen
function Clip({ src, poster, label, aspect }: { src: string; poster: string; label: string; aspect: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => { /* autoplay blocked: poster stays */ })
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <figure className="flex-none">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        style={{ aspectRatio: aspect }}
        className="h-28 w-auto rounded-lg object-cover ring-1 ring-grey-200 sm:h-32"
      />
      <figcaption className="mt-1 whitespace-nowrap text-xs leading-snug text-grey-500">{label}</figcaption>
    </figure>
  )
}

export default function Experience() {
  return (
    <Section id="experience" kicker="Experience" title="Where I've worked">
      <ol className="relative border-l border-grey-200 pl-6 space-y-10">
        {EXPERIENCE.map((job, i) => (
          <Reveal key={job.role + job.org} as="li" delay={i * 100} className="relative block">
            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-grey-300" />
            <div className="flex gap-4">
              {job.image && (
                <img
                  src={job.image}
                  alt={job.org}
                  loading="lazy"
                  decoding="async"
                  className="hidden sm:block h-16 w-16 flex-none rounded-lg object-cover ring-1 ring-grey-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {job.role} ·{' '}
                    <span className="text-grey-600 font-medium">{job.org}</span>
                  </h3>
                  <span className="text-sm text-grey-500">{job.period}</span>
                </div>
                {job.detail && (
                  <div className="mt-0.5 text-sm font-medium text-accent">{job.detail}</div>
                )}
                <ul className="mt-3 space-y-1.5 text-sm text-grey-700 leading-relaxed">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-grey-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {job.clips && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {job.clips.map((c) => <Clip key={c.src} {...c} />)}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
