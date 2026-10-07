import Section from './Section'
import Reveal from './Reveal'
import { DEGREE, SCHOOL } from '../content'

export default function Education() {
  return (
    <Section id="education" kicker="Education" title="Academic background">
      {/* No cards here. A box is worth drawing when it is a target or has
          to clip something — the project cards are both — and these two
          entries are neither. Experience already sets the same kind of
          content (logo, role, org, period, lines) with no box at all, so a
          bordered panel round the degree was the odd one out. A hairline
          between the two does the separating, which is what the rest of the
          page uses. */}
      <div className="divide-y divide-grey-200">
      <Reveal className="pb-8">
        <div className="flex gap-4">
          <img
            src={DEGREE.logo}
            alt="University of Auckland"
            className="hidden sm:block h-24 w-auto flex-none rounded-xl object-contain"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {`${DEGREE.school} ·`}{' '}
                <span className="text-grey-600 font-medium">{DEGREE.city}</span>
              </h3>
              <span className="text-sm text-grey-500">{DEGREE.period}</span>
            </div>
            <div className="mt-1 text-grey-700">
              {DEGREE.award}
            </div>
            <div className="mt-1 text-sm text-grey-500">
              <span className="font-semibold text-grey-900">Concentrations:</span>{' '}
              {DEGREE.concentrations}
            </div>
            <div className="mt-1 text-sm text-grey-500">
              <span className="font-semibold text-grey-900">Related coursework:</span>{' '}
              {DEGREE.coursework.join(' · ')}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="pt-8" delay={120}>
        <div className="flex gap-4">
          <img
            src={SCHOOL.logo}
            alt="Pinehurst School"
            className="hidden sm:block h-24 w-auto flex-none rounded-xl object-contain"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {`${SCHOOL.school} ·`}{' '}
                <span className="text-grey-600 font-medium">{SCHOOL.city}</span>
              </h3>
              <span className="text-sm text-grey-500">{SCHOOL.period}</span>
            </div>
            <div className="mt-1 text-grey-700">
              {SCHOOL.award}
            </div>
            <div className="mt-1 text-sm text-grey-500">
              {SCHOOL.note}
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
                {SCHOOL.diligence.map(({ syllabus, subject }) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 rounded-md bg-grey-200 py-0.5 pl-1.5 pr-2 text-xs text-grey-700"
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
