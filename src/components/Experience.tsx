import { useState } from 'react'
import Section from './Section'
import { Modal } from './Projects'
import Reveal from './Reveal'
import { EXPERIENCE } from '../content'
import { emphasise } from './emphasise'

type Clip = { src: string; poster: string; aspect: string; label: string }

const clipClass = 'tap-44 inline-flex items-center gap-1.5 rounded-lg border border-grey-300 bg-white px-3 py-1.5 text-sm font-medium text-grey-800 transition hover:border-grey-400 hover:text-grey-900'

export default function Experience() {
  const [playing, setPlaying] = useState<Clip | null>(null)
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
                      <span>{emphasise(b)}</span>
                    </li>
                  ))}
                </ul>
                {job.clips && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {job.clips.map((c) => (
                      <button key={c.src} type="button" onClick={() => setPlaying(c)} data-track={`clip-${job.id}`} className={clipClass}>
                        <PlayIcon />
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
      {playing && (
        <Modal label={playing.label} heading={playing.label} onClose={() => setPlaying(null)} wide>
          <div className="flex justify-center bg-black p-2">
            <video
              src={playing.src}
              poster={playing.poster}
              controls
              autoPlay
              loop
              muted
              playsInline
              style={{ aspectRatio: playing.aspect }}
              className="max-h-[70vh] w-auto max-w-full"
            />
          </div>
        </Modal>
      )}
    </Section>
  )
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </svg>
  )
}
