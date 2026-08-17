import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// Short on purpose. The Highlights beside this were listing the certificates,
// the placements and the roles, and the prose was saying all of it again in
// sentences: the same tile told you everything twice. The bullets keep the
// facts, so the paragraphs only have to say who he is and what he is doing
// now. The toolkit went too, because the Skills tile is a list of exactly
// that and does it better.
export default function About() {
  return (
    <Section id="about" kicker="Profile" title="About me">
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which worked when the text ran three paragraphs and
          left a column of empty glass once it was cut to two. */}
      <div className="mx-auto max-w-3xl">
        <Reveal className="space-y-4 sm:text-justify text-grey-700 leading-relaxed">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-grey-900">
            Hardware and Software, on the same bench.
          </h3>
          <p>
            I'm Eric, a penultimate <Bold>Computer Systems Engineering (Hons)</Bold> student at the
            University of Auckland, working across <Bold>embedded systems</Bold>,{' '}
            <Bold>AI cloud computing</Bold>, and <Bold>robotics</Bold>.
          </p>
          <p>
            My strongest weapon is AWS tooling, which sets me apart from most
            candidates. Right now I research robot navigation at <Bold>CARES</Bold> and teach
            robotics at{' '}
            <Bold>ciLab</Bold>. I'm open to <Bold>2026/27 summer internships</Bold>.
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="mt-7 block border-t border-white/70 pt-5">
          <div className="text-xs uppercase tracking-widest text-grey-500">Highlights</div>
          <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm text-grey-700 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
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
  '3× AWS Certified · Solutions Architect, Cloud & AI',
  'Top 8 finalist · 2026 AWS×BNZ AI Hackathon',
  '3rd place · 2025 ECSE Design Competition',
  '8 projects across hardware & software',
  'Robotics Instructor & Competition Coach at ciLab',
]
