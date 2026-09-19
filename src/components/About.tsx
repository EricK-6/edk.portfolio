import type { ReactNode } from 'react'
import Section from './Section'
import Reveal from './Reveal'

// Short on purpose. The Highlights beside this were listing the certificates,
// the placements and the roles, and the prose was saying all of it again in
// sentences: the same tile told you everything twice. The bullets keep the
// facts, so the paragraphs only have to say who he is and what he is doing
// now. The toolkit went too, because the Skills tile is a list of exactly
// that and does it better.
export default function About() {
  return (
    // The statement *is* the heading. It used to be an h3 inside the section
    // under an h2 that said "About me" — and it was set larger than that h2,
    // so the page's own hierarchy ran backwards. The kicker carries the
    // section's name (matching the navbar's contents index) and the one line
    // worth reading is the title.
    <Section id="about" kicker="About" title="Hardware and Software, on the same bench." narrow>
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which worked when the text ran three paragraphs and
          left a column of empty glass once it was cut to two. */}
      <div>
        <Reveal className="space-y-4 leading-relaxed text-grey-700">
          <p>
            I'm Eric, a penultimate <Bold>Computer Systems Engineering (Hons)</Bold> student at the
            University of Auckland, working across <Bold>embedded systems</Bold>,{' '}
            <Bold>AI cloud computing</Bold>, and <Bold>robotics</Bold>.
          </p>
          <p>
            My strongest weapon is AWS tooling, which sets me apart from most
            candidates. My newest certificate,{' '}
            <Bold>Solutions Architect - Associate</Bold>, is the one that changed how I
            build: designing for the failure modes, not just wiring the services together.
            Right now I research robot navigation at <Bold>CARES</Bold> and teach
            robotics at{' '}
            <Bold>ciLab</Bold>. I'm open to <Bold>2026/27 summer internships</Bold>.
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="mt-8 block border-t border-grey-200 pt-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-grey-500">Highlights</div>
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

function Bold({ children }: { children: ReactNode }) {
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
