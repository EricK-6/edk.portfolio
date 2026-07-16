import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function About() {
  return (
    <Section id="about" kicker="Profile" title="About me">
      <div className="grid gap-8 md:grid-cols-3">
        <Reveal className="md:col-span-2 space-y-4 text-justify text-grey-700 dark:text-grey-300 leading-relaxed">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-grey-900 dark:text-grey-100">
            Kia ora! <span className="wave-hand">👋</span>
          </h3>
          <p>
            This is Eric, a penultimate <Bold>Computer Systems Engineering (Hons)</Bold> student
            at the University of Auckland, specialising in <Bold>embedded systems</Bold>,{' '}
            <Bold>full stack development</Bold>, and <Bold>digital hardware design</Bold>. I work
            across the hardware and software boundary with <Bold>C, Java, Python, and React</Bold>{' '}
            in my toolkit.
          </p>
          <p>
            I am <Bold>2× AWS certified</Bold> with a project portfolio spanning{' '}
            <Bold>serverless cloud pipelines</Bold>, <Bold>React web apps</Bold>, and{' '}
            <Bold>embedded robotics</Bold>, which earned <Bold>3rd place</Bold> at the 2025
            ECSE Design Competition. Outside the classroom I teach as a <Bold>Teaching
            Assistant and Robotics Instructor</Bold>. I am always open to{' '}
            <Bold>Internship opportunities</Bold>, so feel free to check out my work below!
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="space-y-4 block">
          <div className="card">
            <div className="text-xs uppercase tracking-widest text-grey-500 dark:text-grey-500">
              Highlights
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-grey-700 dark:text-grey-300">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent dark:bg-accent-dark" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function Bold({ children }) {
  return <strong className="font-semibold text-grey-900 dark:text-grey-100">{children}</strong>
}

const HIGHLIGHTS = [
  '2× AWS Certified · Cloud & AI Practitioner',
  '3rd place · 2025 ECSE Design Competition',
  '7 projects across hardware & software',
  'Teaching Assistant & Robotics Instructor',
]
