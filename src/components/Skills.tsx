import Section from './Section'
import Reveal from './Reveal'
import { SKILL_GROUPS } from '../content'

// Four groups, read straight off the two CVs' skills rows (the lists
// themselves live in content.ts).
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
export default function Skills() {
  return (
    <Section id="skills" kicker="Skills" title="What I work with">
      {/* Two across, not three. The groups hold 11, 14, 10 and 7 items — close
          enough in length to sit level in a 2x2, where a three-column split
          left one tall column towering over two short ones. */}
      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        {SKILL_GROUPS.map((g, i) => (
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
