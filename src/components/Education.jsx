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

// The union of both CVs' "Related Courseworks" lines, which is more than
// either PDF carries on its own: the SWE CV lists the software half and the
// EEE CV the hardware half, because each is fighting for one page. The site
// has room for both, and showing both is the point — the degree really is a
// computer *systems* degree, and the About headline claims exactly that.
//
// Seven of these were missing before: Data Structures & Algorithms, Database
// Systems and Operating Systems from the SWE CV, and Electrical Engineering,
// Electronics, Electromagnetics and Signals & Control Systems from the EEE CV.
//
// Split into the two families rather than run as one list of fourteen chips,
// so the pair of columns says the same thing the headline does.
const COURSEWORK = [
  {
    label: 'Software & Systems',
    items: [
      'Object Oriented Programming',
      'Data Structures & Algorithms',
      'Software Architecture',
      'Software Quality Assurance',
      'Database Systems',
      'Operating Systems',
      'AI & Machine Learning',
    ],
  },
  {
    label: 'Hardware & Signals',
    items: [
      'Digital Systems Design',
      'Computer Architecture',
      'Hardware-Software Systems',
      'Electrical Engineering',
      'Electronics',
      'Electromagnetics',
      'Signals & Control Systems',
    ],
  },
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

            {/* A grid of rows, not a wrap of chips.
                Chips are pills whose width is their text, so fourteen of them
                wrapped into a ragged block with a different number per line in
                each column and a torn right edge — the two families did not
                even line up with each other. Course names are a list, and a
                list wants one per row: both columns now hold exactly seven,
                every row starts on the same baseline as its neighbour, and the
                pair reads as the two halves of one degree. */}
            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {COURSEWORK.map((group) => (
                <div key={group.label}>
                  <div className="border-b border-grey-200 pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
                    {group.label}
                  </div>
                  <ul className="mt-1">
                    {group.items.map((c) => (
                      <li
                        key={c}
                        className="flex items-baseline gap-2.5 border-b border-grey-100 py-[7px] text-sm text-grey-700 last:border-0"
                      >
                        <span aria-hidden="true" className="h-1 w-1 flex-none rounded-full bg-accent/45" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
              <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
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
