import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

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
              Concentration: Embedded Systems · Software & Digital Hardware Design
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
            <div className="mt-2 text-sm text-justify text-grey-600 dark:text-grey-400 leading-relaxed">
              Completed CIE IGCSE, AS, and A2 level courses and earned multiple diligence awards.
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </Section>
  )
}
