import { type ReactNode } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { CERTS, HIGHLIGHTS } from '../content'

// Short on purpose. The Highlights beside this were listing the certificates,
// the placements and the roles, and the prose was saying all of it again in
// sentences: the same section told you everything twice. The bullets keep the
// facts, so the paragraphs only have to say who he is and what he is doing
// now. The toolkit went too, because the Skills section is a list of exactly
// that and does it better.
export default function About() {
  return (
    // The heading is the greeting. It used to be the motto, "From silicon to
    // serverless", but that sentence is now where the ride above this section
    // ends, in the clouds, and saying it again one scroll later would be the
    // page repeating itself. So this section opens the way a person would.
    <Section id="about" kicker="About" title="Hey, I'm Eric." narrow>
      {/* Prose on top, highlights underneath in a row. The old shape put them
          side by side, which left a column of empty glass whenever the text
          was short. Stacked, the paragraphs can each be two lines without
          stranding anything, so each one carries a single idea: who he is,
          how he builds, where he has been, (where he is now), who he is off
          the clock, and the invitation. */}
      <div>
        <Reveal className="space-y-4 leading-relaxed text-grey-700">
          <p>
            I study Computer Systems Engineering at the University of Auckland,
            and I work across <Bold>AI</Bold>, <Bold>Robotics</Bold> and <Bold>Cloud Computing</Bold>,
            with <Bold>{CERTS.length} certs</Bold> to back it up.
          </p>
          <p>
            I trained as a research assistant at <Bold>CARES</Bold>, working on robot soccer vision
            and TurtleBot navigation. I also taught robotics at <Bold>ciLab</Bold>, coaching student
            teams for national competitions.
          </p>
          <p>
            I'm currently interning as a <Bold>Data Platform Engineer</Bold> at <Bold>Mercury NZ</Bold>, working
            with Databricks on <Bold>AWS</Bold>. Outside of work, I drum with friends and train at the
            gym. Oh, and I love my vertical mouse.
          </p>
          <p>
            If any of this sounds interesting, feel free
            to <a href="#contact" className="whitespace-nowrap font-semibold text-grey-900 underline underline-offset-2">say hi</a>.
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="mt-8 block border-t border-grey-200 pt-6">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">Highlights</h3>
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
