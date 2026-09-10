const REPO = 'https://github.com/EricK-6/EricK-6.github.io'

// Name on the left with the date the repo was last touched under it, links on
// the right. `__LAST_UPDATED__` is the last commit's date, baked in by
// vite.config.js — the deploy runs on every push to `main`, so it is both the
// build date and the commit date, with no API call to rate-limit or fail.
const LINKS = [
  ['GitHub', 'https://github.com/EricK-6'],
  ['LinkedIn', 'https://www.linkedin.com/in/erick06/'],
  ['Email', 'mailto:dohyunkim290106@gmail.com'],
]

export default function Footer() {
  let stamp = null
  try {
    // day/month/year: this is a New Zealand site and the date is a fact about
    // the page, not a headline — it reads as a version number down here
    stamp = new Intl.DateTimeFormat('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Pacific/Auckland',
    }).format(new Date(__LAST_UPDATED__))
  } catch { /* no ICU data, or a date that will not parse: the line is omitted */ }

  return (
    <footer className="border-t border-grey-200">
      <div className="container-page flex max-w-6xl flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-base font-semibold tracking-tight text-grey-900">
            Eric Kim
          </div>
          {stamp && (
            <p className="mt-1 font-mono text-[11px] tracking-wide text-grey-400">
              last updated{' '}
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-grey-300 underline-offset-2 transition-colors hover:text-grey-700"
              >
                {stamp}
              </a>
            </p>
          )}
        </div>

        <ul className="flex items-center gap-5 text-sm">
          {LINKS.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="text-grey-500 transition-colors hover:text-grey-900"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
