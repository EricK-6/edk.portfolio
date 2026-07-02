import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function About() {
  return (
    <Section id="about" kicker="Profile" title="About me">
      <div className="grid gap-8 md:grid-cols-3">
        <Reveal className="md:col-span-2 space-y-4 text-grey-700 dark:text-grey-300 leading-relaxed">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-grey-900 dark:text-grey-100">
            Kia ora! <span className="wave-hand">👋</span>
          </h3>
          <p>
            This is Eric, a penultimate Computer Systems Engineering (Hons)
            student at the University of Auckland, specialising in embedded systems,
            full stack development, and digital hardware design. I work across the
            hardware and software boundary: firmware, PCBs, and the interfaces that
            tie them together, with C, Java, Python, and React in my toolkit.
          </p>
          <p>
            I am AWS certified in both Cloud and AI/ML, with a proven project portfolio
            spanning serverless cloud pipelines, React web applications, FPGA development,
            PCB design, and embedded robotics systems. That work earned 3rd place at the
            2025 ECSE Design Competition. Outside the classroom I teach as a Teaching
            Assistant and robotics instructor, and serve as an academic executive with
            the Korean Engineering Body. I am always open to internship opportunities,
            so feel free to check out my work below!
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

const HIGHLIGHTS = [
  '2× AWS Certified · Cloud & AI Practitioner',
  '3rd place · 2025 ECSE Design Competition',
  '7 projects across hardware & software',
  'Teaching Assistant & Robotics Instructor',
]
