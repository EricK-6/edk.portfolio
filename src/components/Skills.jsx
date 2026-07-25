import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// Each group carries its own icon and hue. Three identically grey blocks gave
// the eye nothing to aim at; the tinted header rule, icon tile and count let a
// reader find the stack they care about without reading all twenty-six chips.
const GROUPS = [
  {
    label: 'Languages & Frameworks',
    icon: 'code',
    // [rule gradient, icon tile, count pill]
    tone: {
      rule: 'from-accent/80 to-accent/10 dark:from-accent-dark/80 dark:to-accent-dark/10',
      tile: 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark',
    },
    items: ['Python', 'Java', 'C', 'JavaScript', 'React.js', 'R', 'MATLAB', 'VHDL'],
  },
  {
    label: 'Cloud & Software Tools',
    icon: 'cloud',
    tone: {
      rule: 'from-sky-500/80 to-sky-500/10 dark:from-sky-400/70 dark:to-sky-400/10',
      tile: 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400',
    },
    items: ['AWS', 'Lambda', 'Bedrock', 'Textract', 'Kinesis', 'Comprehend', 'DynamoDB', 'Amplify', 'Git', 'Android Studio', 'Figma'],
  },
  {
    label: 'Hardware & EDA Tools',
    icon: 'chip',
    // violet, not the obvious green: the dark theme's accent IS emerald, so a
    // green here would read as the same group as Languages after a theme flip
    tone: {
      rule: 'from-violet-500/80 to-violet-500/10 dark:from-violet-400/70 dark:to-violet-400/10',
      tile: 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400',
    },
    items: ['Altium Designer', 'LTSpice', 'ModelSim', 'Intel Quartus Prime', 'Proteus', 'Atmel AVR', 'AutoCAD'],
  },
]

export default function Skills() {
  return (
    <Section id="skills" kicker="Skills" title="What I work with">
      {/* One panel split into three ruled columns rather than three separate
          tiles. The groups hold 8, 11 and 7 items, so equal-size tiles always
          left the short two with a band of empty card; inside a single box the
          columns simply end where they end, the way a spec sheet does, and the
          outer shape stays a clean rectangle. */}
      <Reveal className="overflow-hidden rounded-2xl border border-grey-300/80 bg-grey-100 dark:border-grey-800/70 dark:bg-grey-900/60">
        <div className="grid lg:grid-cols-3 lg:divide-x lg:divide-grey-300/70 lg:dark:divide-grey-800/70">
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col">
              {/* hue rule: doubles as the divider between stacked columns
                  below lg, where there is no vertical rule to carry it */}
              <span aria-hidden="true" className={`block h-1 w-full bg-gradient-to-r ${g.tone.rule}`} />
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg ${g.tone.tile}`}>
                    <GroupIcon type={g.icon} />
                  </span>
                  <h3 className="flex-1 text-sm font-semibold text-grey-800 dark:text-grey-200">{g.label}</h3>
                  <span className="font-mono text-[11px] tabular-nums text-grey-400 dark:text-grey-600">
                    {String(g.items.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-lg border border-grey-300/80 bg-grey-200/70 px-2.5 py-1 text-sm font-medium text-grey-800 transition-colors hover:border-grey-400 hover:bg-grey-200 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-200 dark:hover:border-grey-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

const GROUP_PATHS = {
  code: <path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  chip: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </>
  ),
}

function GroupIcon({ type }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GROUP_PATHS[type]}
    </svg>
  )
}
