import Section from './Section'
import Reveal from './Reveal'
import { EXPERIENCE } from '../content'
import { emphasise } from './emphasise'

export default function Experience() {
  return (
    <Section id="experience" kicker="Experience" title="Where I've worked">
      <ol className="relative border-l border-grey-200 pl-6 space-y-10">
        {EXPERIENCE.map((job, i) => (
          <Reveal key={job.role + job.org} as="li" delay={i * 100} className="group relative block">
            {/* A dot on the line, level with the middle of the logo. The line is
                the list's 1px left border, so its centre is 24.5px left of the
                entry (24px of padding plus half the border). The dot's ring is
                the page colour, so the line does not show through it. Below
                `sm` the logo is hidden, and the first line of the heading
                (1.75rem tall) is what the dot lines up with. Hovering an entry
                swells its dot. */}
            <span className="absolute -left-[30.5px] top-3.5 h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-4 ring-page transition-transform duration-200 ease-out group-hover:scale-125 sm:top-8" />
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
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
