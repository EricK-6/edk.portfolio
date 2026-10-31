import { useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { EXPERIENCE } from '../content'
import { emphasise } from './emphasise'

// A centred line with each employer's logo threaded on it, as rounded
// squares. The description alternates either side of the line, starting on the
// right, and its date sits across the line from it. Below md there is no room
// for two columns, so every description sits to the right with its date inside
// it. Entries sit straight on the page with no box. Pressing one shows or
// hides its two bullets, the same contract as the project cards: nothing
// moves until you ask, and the next press puts it back.
export default function Experience() {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <Section id="experience" kicker="Experience" title="Where I've worked" wide narrowHeading>
      <ol className="relative flex flex-col gap-12 md:gap-14">
        {/* the line: through the middle of the 4rem logo column on a phone,
            through the middle of the page from md */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-8 top-0 w-px -translate-x-1/2 bg-grey-200 md:left-1/2"
        />
        {EXPERIENCE.map((job, i) => {
          const right = i % 2 === 0
          const open = openIds.has(job.id)
          return (
            <Reveal
              key={job.id}
              as="li"
              delay={i * 100}
              className="relative grid grid-cols-[4rem_1fr] items-center gap-x-4 md:grid-cols-[1fr_6rem_1fr] md:gap-x-0"
            >
              <div className="col-start-1 row-start-1 flex justify-center md:col-start-2">
                {job.image ? (
                  <img
                    src={job.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="relative h-16 w-16 rounded-xl bg-white object-cover ring-4 ring-page md:h-20 md:w-20"
                  />
                ) : (
                  <span className="mt-4 h-3 w-3 rounded-full bg-accent ring-4 ring-page" />
                )}
              </div>

              {/* the date sits across the line from the description */}
              <div
                className={`row-start-1 hidden text-sm font-medium text-grey-600 md:block ${
                  right ? 'col-start-1 pr-6 text-right' : 'col-start-3 pl-6'
                }`}
              >
                {job.period}
              </div>

              <div
                className={`col-start-2 row-start-1 min-w-0 ${
                  right ? 'md:col-start-3 md:pl-6' : 'md:col-start-1 md:pr-6 md:text-right'
                }`}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`exp-${job.id}`}
                    data-track={`experience-${job.id}`}
                    onClick={() => toggle(job.id)}
                    className="group block w-full rounded-lg py-1"
                    style={{ textAlign: 'inherit' }}
                  >
                    <span className="block text-xs text-grey-500 md:hidden">{job.period}</span>
                    <span className="mt-1 block text-lg font-semibold md:mt-0 text-grey-900 transition-colors group-hover:text-accent-deep">
                      {job.role}
                    </span>
                    <span className="block text-sm font-medium text-grey-600">{job.org}</span>
                    {job.detail && (
                      <span className={`mt-0.5 block max-w-[21rem] text-balance text-sm font-medium text-accent ${right ? '' : 'md:ml-auto'}`}>{job.detail}</span>
                    )}
                    <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400">
                      {open ? 'Click again to close' : 'Click for details'}
                    </span>
                  </button>
                </h3>
              </div>

              {/* The bullets get a row of their own, so the logo and the date stay
                  level with the heading above them whether or not an entry is
                  open. From md they run under the whole entry at About's
                  width (38rem), over the line, which the page-coloured
                  background hides behind them. */}
              {open && (
                <ul
                  id={`exp-${job.id}`}
                  className="col-start-2 row-start-2 mt-3 min-w-0 space-y-2 text-left text-[13px] leading-relaxed text-grey-700 md:col-span-3 md:col-start-1 md:w-full md:max-w-[38rem] md:justify-self-center md:bg-page md:py-1"
                >
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden="true" className="mt-[0.5em] inline-block h-1 w-1 flex-none rounded-full bg-accent" />
                      <span>{emphasise(b)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          )
        })}
      </ol>
    </Section>
  )
}
