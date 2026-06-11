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
      'Delivered high quality service in a fast paced environment.',
      'Assisted guests and maintained efficient table transitions during peak service.',
    ],
  },
]

export default function Experience() {
  return (
    <Section id="experience" kicker="Experience" title="Where I've worked">
      <ol className="relative border-l border-zinc-200 dark:border-zinc-800 pl-6 space-y-10">
        {EXPERIENCE.map((job, i) => (
          <Reveal key={job.role + job.org} as="li" delay={i * 100} className="relative block">
            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-white dark:bg-accent-dark dark:ring-zinc-950" />
            <div className="flex gap-4">
              {job.image && (
                <img
                  src={job.image}
                  alt={job.org}
                  className="hidden sm:block h-16 w-16 flex-none rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {job.role} ·{' '}
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{job.org}</span>
                  </h3>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">{job.period}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-zinc-400 dark:bg-zinc-600" />
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
