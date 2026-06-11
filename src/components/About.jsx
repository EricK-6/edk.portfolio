import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function About() {
  return (
    <Section id="about" kicker="About" title="About me">
      <div className="grid gap-8 md:grid-cols-3">
        <Reveal className="md:col-span-2 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Kia ora! 👋 I'm Eric, a penultimate year Computer Systems Engineering (Hons)
            student at the University of Auckland, passionate about embedded systems and
            modern software techniques. I work across the hardware and software boundary:
            firmware, PCBs, and the interfaces that tie them together, with C, Java, Python,
            and React in my toolkit.
          </p>
          <p>
            I've built a solid portfolio of projects both inside and outside of coursework,
            complemented by AWS industry certifications and experience as a club executive
            with the Korean Engineering Body. I'm always open to internship opportunities,
            so feel free to check out my work below!
          </p>
        </Reveal>

        <Reveal as="aside" delay={120} className="space-y-4 block">
          <div className="card">
            <div className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              Quick facts
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Fact label="Location" value="Auckland, NZ" />
              <Fact label="Degree" value="BE(Hons) Computer Systems" />
              <Fact label="University" value="University of Auckland" />
              <Fact label="Graduation" value="November 2027" />
              <Fact label="Availability" value="Summer 2026/27" />
            </dl>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function Fact({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-zinc-500 dark:text-zinc-500">{label}</dt>
      <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  )
}
