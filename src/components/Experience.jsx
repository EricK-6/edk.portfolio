import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const EXPERIENCE = [
  {
    role: 'Robotics Instructor',
    org: 'Creative Imaginary Lab (ciLab)',
    period: 'Apr 2026 - Present',
    image: './ciLab.jpg',
    bullets: [
      'Instruct students in robot hardware assembly and software programming to complete mission based challenges.',
      'Coach and support teams in preparation for nationwide robotics competitions.',
    ],
  },
  {
    role: 'Front of House',
    org: 'Twelve Restaurant',
    period: 'Jul 2024 - Jan 2025',
    image: './twelve.jpg',
    bullets: [
      'Delivered exceptional customer service and worked with colleagues to keep front of house operations running smoothly during busy service.',
      'Efficiently resolved complex customer situations while keeping the guest experience positive.',
    ],
  },
]

export default function Experience() {
  return (
    <Section id="experience" kicker="Experience" title="Where I've worked">
      <ol className="relative border-l border-grey-200 dark:border-grey-800 pl-6 space-y-10">
        {EXPERIENCE.map((job, i) => (
          <Reveal key={job.role + job.org} as="li" delay={i * 100} className="relative block">
            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-grey-300 dark:bg-accent-dark dark:ring-grey-950" />
            <div className="flex gap-4">
              {job.image && (
                <img
                  src={job.image}
                  alt={job.org}
                  loading="lazy"
                  decoding="async"
                  className="hidden sm:block h-16 w-16 flex-none rounded-lg object-cover ring-1 ring-grey-200 dark:ring-grey-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {job.role} ·{' '}
                    <span className="text-grey-600 dark:text-grey-400 font-medium">{job.org}</span>
                  </h3>
                  <span className="text-sm text-grey-500 dark:text-grey-500">{job.period}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-grey-700 dark:text-grey-300 leading-relaxed">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-grey-400 dark:bg-grey-600" />
                      <span>{b}</span>
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
