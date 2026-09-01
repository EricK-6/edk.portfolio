import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// The diligence awards were the substance of the "multiple diligence awards"
// line, so they are shown as the awards themselves — one tile per subject,
// with the syllabus it was sat under.
const DILIGENCE = [
  { syllabus: 'NCEA', subject: 'English' },
  { syllabus: 'IGCSE', subject: 'Computer Science' },
  { syllabus: 'AS', subject: 'Physics' },
]

const COURSEWORK = [
  'Computer Architecture',
  'AI & Machine Learning',
  'Hardware-Software Systems',
  'Software Architecture',
  'Digital Systems Design',
  'Software Quality Assurance',
  'Object Oriented Programming',
]

export default function Education() {
  return (
    <Section id="education" kicker="Education" title="Academic background">
      <div className="space-y-4">
      <Reveal className="card">
        <div className="flex gap-4">
          <img
            src="./UoA.jpg"
            alt="University of Auckland"
            className="hidden sm:block h-28 w-auto flex-none rounded-xl object-contain drop-shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                The University of Auckland ·{' '}
                <span className="text-grey-600 dark:text-grey-400 font-medium">Auckland, NZ</span>
              </h3>
              <span className="text-sm text-grey-500 dark:text-grey-500">Expected Graduation Nov 2027</span>
            </div>
            <div className="mt-1 text-grey-700 dark:text-grey-300">
              Bachelor of Engineering (Honours) · Computer Systems Engineering
            </div>
            <div className="mt-1 text-sm text-grey-500 dark:text-grey-500">
              Concentrations: Embedded Systems · Software & Hardware Design
            </div>

            <div className="mt-6">
              <div className="text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500 mb-2">
                Relevant coursework
              </div>
              <div className="flex flex-wrap gap-2">
                {COURSEWORK.map((c) => (
                  <span key={c} className="tag">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="card" delay={120}>
        <div className="flex gap-4">
          <img
            src="./pinehurst.jpeg"
            alt="Pinehurst School"
            className="hidden sm:block h-28 w-auto flex-none rounded-xl object-contain drop-shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                Pinehurst School ·{' '}
                <span className="text-grey-600 dark:text-grey-400 font-medium">Auckland, NZ</span>
              </h3>
              <span className="text-sm text-grey-500 dark:text-grey-500">Aug 2018 - Dec 2023</span>
            </div>
            <div className="mt-1 text-grey-700 dark:text-grey-300">
              High School Diploma
            </div>
            <div className="mt-1 text-sm text-grey-500 dark:text-grey-500">
              Completed CIE IGCSE, AS, and A2 level courses
            </div>

            {/* deliberately quieter than the bordered tiles this started as:
                Pinehurst is the secondary entry and was out-shouting the
                degree above it. Same information, chip-sized — the rosette and
                the amber syllabus carry it without a box each. */}
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">
                Diligence awards
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DILIGENCE.map(({ syllabus, subject }) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 rounded-md bg-grey-200 py-0.5 pl-1.5 pr-2 text-xs text-grey-700 dark:bg-grey-800 dark:text-grey-300"
                  >
                    <RosetteIcon />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-award">
                      {syllabus}
                    </span>
                    <span className="font-medium">{subject}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </Section>
  )
}

// award rosette: a medal disc with two ribbon tails
function RosetteIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none text-award"
    >
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 6.6l.9 1.85 2.05.3-1.48 1.44.35 2.03L12 11.26l-1.82.96.35-2.03L9.05 8.75l2.05-.3L12 6.6z" fill="currentColor" stroke="none" opacity="0.55" />
      <path d="M8.6 13.7L7 22l5-2.6L17 22l-1.6-8.3" />
    </svg>
  )
}
