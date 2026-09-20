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
    <Section id="about" kicker="About" title="Cloud tooling, robot problems." narrow>
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which worked when the text ran three paragraphs and
          left a column of empty glass once it was cut to two. */}
      <div>
        <Reveal className="space-y-4 leading-relaxed text-grey-700">
          <p>
            I'm Eric, a penultimate <Bold>Computer Systems Engineering (Hons)</Bold> student at the
            University of Auckland, interested in <Bold>AI</Bold>, <Bold>cloud computing</Bold> and{' '}
            <Bold>robotics</Bold>.
          </p>
          <p>
            I enjoy building practical projects on <Bold>AWS</Bold>, and I've picked up a few
            certifications along the way, including <Bold>Solutions Architect - Associate</Bold>{' '}
            and <Bold>Terraform Associate</Bold>. Right now I'm a research assistant at{' '}
            <Bold>CARES</Bold>, working on robot soccer and navigation, and I teach robotics at{' '}
            <Bold>ciLab</Bold>, where I help students build and program robots for competitions.
          </p>
          <p>
            I'm looking for <Bold>internship opportunities</Bold> where I can learn, contribute and
            grow, so have a look at the work below.
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

// Every line here is verifiable in another tile: the placements in Projects,
// the certificates in Credentials, the volunteering in Leadership, the count
// from the Projects list itself.
//
// CARES and ciLab used to be the first and last bullets. The prose now names
// both of them, in bold, four lines above — so the tile was introducing the
// two roles and then immediately listing them back. The bullets are better
// spent on the things a paragraph this short has no room for.
const HIGHLIGHTS = [
  '4 cloud certifications · AWS and HashiCorp',
  'Top 8 finalist · 2026 AWS×BNZ AI Hackathon',
  '3rd place · 2025 ECSE Design Competition',
  '8 projects across hardware & software',
  'Competition staff · WRO 2026, NZRO 2026',
  'Academic Team Executive · Korean Engineering Body',
]
