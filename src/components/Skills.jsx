import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const GROUPS = [
  {
    label: 'Languages & Frameworks',
    span: 'sm:col-span-2 lg:col-span-4',
    accent: true,
    items: ['Python', 'Java', 'C', 'JavaScript', 'React.js', 'R', 'MATLAB', 'VHDL'],
  },
  {
    label: 'Cloud & Software Tools',
    span: 'sm:col-span-2 lg:col-span-4',
    items: ['AWS', 'Lambda', 'Kinesis', 'Comprehend', 'DynamoDB', 'Amplify', 'Git', 'Android Studio', 'Figma'],
  },
  {
    label: 'Hardware & EDA Tools',
    span: 'sm:col-span-2 lg:col-span-4',
    items: ['Altium Designer', 'LTSpice', 'ModelSim', 'Intel Quartus Prime', 'Proteus', 'Atmel AVR', 'AutoCAD'],
  },
]

export default function Skills() {
  return (
    <Section id="skills" kicker="Skills" title="What I work with">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {GROUPS.map((g, i) => (
          <Reveal key={g.label} delay={i * 80} className={`card relative overflow-hidden ${g.span}`}>
            {g.accent && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-accent/[0.14] via-accent/[0.07] to-transparent blur-2xl dark:from-accent-dark/[0.08] dark:via-accent-dark/[0.04]"
              />
            )}
            <h3 className="relative text-sm font-semibold uppercase tracking-widest text-grey-500 dark:text-grey-500">
              {g.label}
            </h3>
            <div className="relative mt-3 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-lg border border-grey-300 bg-grey-200 px-2.5 py-1 text-sm font-medium text-grey-800 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
