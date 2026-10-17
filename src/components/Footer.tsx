import { PROFILE } from '../content'

// Name on the left with the date the repo was last touched under it, links on
// the right. `__LAST_UPDATED__` is the last commit's date, baked in by
// vite.config.ts — the deploy runs on every push to `main`, so it is both the
// build date and the commit date, with no API call to rate-limit or fail.
const ICONS: Record<string, string> = {
  GitHub:
    'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z',
  LinkedIn:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
  Email: 'M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.3.5L12 11.9 19.7 6H4.3ZM20 7.9l-7.4 5.7a1 1 0 0 1-1.2 0L4 7.9V18h16V7.9Z',
}

const LINKS = [
  ['GitHub', PROFILE.github.url],
  ['LinkedIn', PROFILE.linkedin.url],
  ['Email', `mailto:${PROFILE.email}`],
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
            {PROFILE.name}
          </div>
          <p className="mt-1 text-[13px] text-grey-500">{PROFILE.offClock}</p>
          {stamp && (
            <p className="mt-1 font-mono text-[11px] tracking-wide text-grey-400">
              last updated{' '}
              <a
                href={PROFILE.repo}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-grey-300 underline-offset-2 transition-colors hover:text-grey-700"
              >
                {stamp}
              </a>
            </p>
          )}
        </div>

        <ul className="-mx-2.5 flex items-center">
          {LINKS.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                data-track={`link-${label.toLowerCase()}`}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                aria-label={label}
                title={label}
                className="block p-2.5 text-grey-500 transition-colors hover:text-grey-900"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path fillRule="evenodd" d={ICONS[label]} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
