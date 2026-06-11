import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const ROLES = [
  {
    title: 'Academic Team Executive',
    org: 'Korean Engineering Body (KEB) · University of Auckland',
    period: 'Jul 2024 - Present',
    image: './KEB.png',
    description:
      'Deliver tutorial sessions for junior engineering students and help plan academic events that support the student community.',
  },
  {
    title: 'Student Mentor',
    org: 'Korean Engineering Body (KEB) · University of Auckland',
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
      'Volunteered full time at the NZ Robotics Olympiad 2025, supporting event operations for the Institute of Electrical and Electronics Engineers (IEEE).',
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
    org: 'Centre for Automation and Robotic Engineering Science (CARES)',
    period: 'May 2026',
    image: './cares.jpeg',
    description:
      'Volunteered at the World Robot Olympiad (WRO) 2026 with the Centre for Automation and Robotic Engineering Science (CARES).',
  },
]

export default function Leadership() {
  return (
    <Section id="leadership" kicker="Leadership" title="Activities & leadership">
      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES.map((r, i) => (
          <Reveal key={r.title} delay={i * 80} className="card">
            <div className="flex gap-4">
              {r.image && (
                <img
                  src={r.image}
                  alt={r.org}
                  className="h-14 w-14 flex-none rounded-full bg-white object-contain p-1.5 ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{r.title}</h3>
                <div className="text-sm text-zinc-500 dark:text-zinc-500">{r.org}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{r.period}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {r.description}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
