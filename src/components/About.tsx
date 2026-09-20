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
    <Section id="about" kicker="About" title="From silicon to serverless." narrow>
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which left a column of empty glass whenever the text
          was short. Stacked, the paragraphs can each be two lines without
          stranding anything, so each one carries a single idea: who he is,
          how he builds, where he is now, what he is after. */}
      <div>
        <Reveal className="space-y-4 leading-relaxed text-grey-700">
          <p>
            I'm Eric, a penultimate Computer Systems Engineering (Hons) student at the
            University of Auckland, working across <Bold>AI</Bold>,{' '}
            <Bold>cloud computing</Bold> and <Bold>robotics</Bold>.
          </p>
          <p>
            Most of what I build ends up on <Bold>AWS</Bold>. Studying for the{' '}
            <Bold>Solutions Architect - Associate</Bold> certification changed how I get it there:
            I design for the failure modes now, rather than just wiring services together.
          </p>
          <p>
            I'm a research assistant at <Bold>CARES</Bold>, working on robot soccer and navigation,
            and I teach robotics at <Bold>ciLab</Bold>, helping students build and program the
            robots they compete with.
          </p>
          <p>
            I'm looking for <Bold>2026/27 summer internships</Bold> where I can learn, contribute
            and grow.
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
//
// The two roles bookend the list on purpose. The prose names CARES and ciLab
// in passing, in the middle of a sentence about how he builds; the bullets are
// where they read as posts held, which is what someone skimming for that is
// looking for. The volunteering stays out: it is a tile of its own further
// down, and these six are the ones worth reading twice.
const HIGHLIGHTS = [
  'Research Assistant · CARES robotics lab, UoA',
  '4 cloud certifications · AWS and HashiCorp',
  'Top 8 finalist · 2026 AWS×BNZ AI Hackathon',
  '3rd place · 2025 ECSE Design Competition',
  '8 projects across hardware & software',
  'Robotics Instructor & Competition Coach at ciLab',
]
