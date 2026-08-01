import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// Checked against the other tiles rather than written from memory, because
// this section restates facts that live elsewhere and had drifted from them:
// the CARES research post is the newest role in Experience and was missing
// here entirely, and the closing line still pointed "below" at a scrolling
// page that no longer exists. The greeting moved out too, since the intro
// tile now opens with one.
export default function About() {
  return (
    <Section id="about" kicker="Profile" title="About me">
      <div className="grid gap-8 md:grid-cols-3">
        <Reveal className="md:col-span-2 space-y-4 sm:text-justify text-grey-700 leading-relaxed">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-grey-900">
            Hardware and software, on the same bench.
          </h3>
          <p>
            I am a penultimate <Bold>Computer Systems Engineering (Hons)</Bold> student at
            the University of Auckland, specialising in <Bold>embedded systems</Bold>,{' '}
            <Bold>full stack development</Bold>, and <Bold>digital hardware design</Bold>, with{' '}
            <Bold>C, Java, Python, and React</Bold> in my toolkit.
          </p>
          <p>
            Right now I am a <Bold>Research Assistant at CARES</Bold>, the University&apos;s Centre
            for Automation and Robotic Engineering Science, developing and testing navigation and
            control algorithms for TurtleBot2 robots. Alongside it I teach as a{' '}
            <Bold>Robotics Instructor</Bold> at ciLab, coaching student teams toward nationwide
            competitions.
          </p>
          <p>
            I am <Bold>2× AWS certified</Bold>, and my project work spans{' '}
            <Bold>serverless cloud pipelines</Bold>, <Bold>React web apps</Bold>, and{' '}
            <Bold>embedded robotics</Bold>, including <Bold>3rd place</Bold> at the 2025 ECSE
            Design Competition and a <Bold>top 8 finish</Bold> at the 2026 AWS×BNZ AI Hackathon.
            I am open to <Bold>2026/27 summer internships</Bold>.
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="space-y-4 block">
          <div className="card">
            <div className="text-xs uppercase tracking-widest text-grey-500">
              Highlights
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-grey-700">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent" />
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
  return <strong className="font-semibold text-grey-900">{children}</strong>
}

// Every line here is verifiable in another tile: the roles in Experience, the
// placements in Projects, the certificates in Credentials, the count from the
// Projects list itself.
const HIGHLIGHTS = [
  'Research Assistant · CARES robotics lab, UoA',
  '2× AWS Certified · Cloud & AI Practitioner',
  'Top 8 finalist · 2026 AWS×BNZ AI Hackathon',
  '3rd place · 2025 ECSE Design Competition',
  '8 projects across hardware & software',
  'Robotics Instructor & Competition Coach at ciLab',
]
