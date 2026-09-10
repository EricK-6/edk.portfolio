import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// Four groups, read straight off the two CVs' skills rows.
//
// This section used to carry a logo beside every one of the thirty-seven
// chips, a 4px accent gradient bar over each column, and an accent-tinted icon
// tile per group. On a page whose whole premise is calm it was the loudest
// block on the site — and the decoration was working against the only job the
// section has, which is letting someone check whether a particular tool is on
// the list. Thirty-seven third-party marks at 16px are thirty-seven different
// hues fighting for the same glance, and at that size a wordmark like JUnit or
// SQL is mush: the word "Python" is more legible than the Python logo. So the
// marks are gone, and with them thirty-seven image requests. What is left is
// the thing a reader was scanning for in the first place — the words.
const GROUPS = [
  {
    label: 'Programming Languages',
    // The SWE CV's own first row, plus VHDL — that one is a language on the
    // EEE CV and has nowhere else to sit here. React.js lives under Frameworks
    // & Tools instead, which is where the SWE CV files it.
    items: ['Python', 'Java', 'C', 'HTML/CSS', 'JavaScript', 'TypeScript', 'R', 'MATLAB', 'SQL', 'VHDL'],
  },
  {
    label: 'Cloud & AWS',
    // The CV collapses all of this to the word "AWS" because a one-page PDF has
    // no room. The site does have room, so the services stay named — every one
    // of them appears in a project's tech list further up, which is the whole
    // reason for naming them rather than asking the reader to take "AWS" on
    // faith.
    items: ['AWS', 'Lambda', 'S3', 'DynamoDB', 'Bedrock', 'Textract', 'Comprehend', 'Kinesis', 'SNS', 'Amplify', 'SAM'],
  },
  {
    label: 'Frameworks & Tools',
    items: ['React.js', 'Node.js', 'Express.js', 'JUnit', 'ROS', 'Git', 'GitHub Actions', 'Android Studio', 'Figma'],
  },
  {
    label: 'Hardware & EDA Tools',
    items: ['Altium Designer', 'LTSpice', 'ModelSim', 'Intel Quartus Prime', 'Proteus', 'Atmel AVR', 'AutoCAD'],
  },
]

export default function Skills() {
  return (
    <Section id="skills" kicker="Skills" title="What I work with">
      {/* Two across, not three. The groups hold 10, 11, 9 and 7 items — close
          enough in length to sit level in a 2x2, where a three-column split
          left one tall column towering over two short ones. */}
      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        {GROUPS.map((g, i) => (
          <Reveal key={g.label} delay={i * 70}>
            <div className="flex items-baseline gap-3 border-b border-grey-200 pb-2.5">
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
                {g.label}
              </h3>
              <span className="ml-auto font-mono text-[11px] tabular-nums text-grey-400">
                {String(g.items.length).padStart(2, '0')}
              </span>
            </div>
            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md bg-grey-100 px-2.5 py-1 text-sm text-grey-800 ring-1 ring-inset ring-grey-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
