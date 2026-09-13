import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// One ink per credential tier, used for the issuer line and nothing else.
//
// Not one per certificate, which is what this was. Colour that changes on
// every row is just decoration; colour that changes on every *level* says
// something — amber is AWS foundational, blue is AWS associate, violet is
// HashiCorp. The two AWS pairs now read as pairs at a glance, which is the
// one thing the names alone are slow to tell you.
//
// Each ink only has to hold small uppercase type on white — all three
// measure above 7:1 there.
const INK = {
  amber: '#92400e',  // AWS foundational — the original award colour
  blue: '#1e3a8a',   // AWS associate — pulled from the SAA badge art
  violet: '#4c1d95', // HashiCorp — sampled off the Terraform hexagon
}

// The four, in the order they sit in the row, left to right: the two
// associate-level certificates first, then the two foundational ones.
//
// The tier is not labelled anywhere any more, because it does not need to be
// — every badge states its own level in its artwork (ASSOCIATE, FOUNDATIONAL)
// and the ink repeats it. Ordering them by level is what the row adds.
const CERTS = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    short: 'Solutions Architect',
    issuer: 'AWS',
    date: 'Aug 2026',
    image: './saa.webp',
    ink: INK.blue,
    credlyUrl:
      'https://www.credly.com/badges/c24fa5a9-1240-4555-8119-2e1decdf0a25/public_url',
  },
  {
    name: 'HashiCorp Certified: Terraform Associate',
    short: 'Terraform Associate',
    issuer: 'HashiCorp',
    date: 'Sep 2026',
    image: './terraform.webp',
    ink: INK.violet,
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    short: 'Cloud Practitioner',
    issuer: 'AWS',
    date: 'Apr 2026',
    image: './cloud.webp',
    ink: INK.amber,
    credlyUrl:
      'https://www.credly.com/badges/9865f524-64b4-45e4-9f56-8c226ec8308a/public_url',
  },
  {
    name: 'AWS Certified AI Practitioner',
    short: 'AI Practitioner',
    issuer: 'AWS',
    date: 'May 2026',
    image: './ai.webp',
    ink: INK.amber,
    credlyUrl:
      'https://www.credly.com/badges/e924df22-3bc9-48c2-847d-d6077a5551d0/public_url',
  },
]

// One row, laid out the way the rest of the page lays things out.
//
// This was a pentagon for a while — the badges on the vertices of a figure,
// then in wedges of one. Both were the same mistake: every other section here
// is a left-aligned block of type with hairlines and small mono labels, and a
// centred diagram with spokes through it reads as something pasted in from a
// different site. Skills already threw out thirty-seven logos for being the
// loudest thing on the page; a wireframe pentagon was louder.
//
// It was then split into Associate and Foundational groups, which existed to
// stop five badges wrapping 4+1 and stranding the fifth. Four fit on one line
// — 4 x 158 + 3 x 24 = 704px against the 720px the column has at md, its
// narrowest desktop width — so the groups have nothing left to solve, and the
// section is one row again.
//
// The badges are centred, which is the one place this section departs from
// the page's left margin: a short row hung off the left edge reads as a list
// that had run out rather than as a set.
const CELL = 158 // px — must match sm:w-[158px] on a badge
const GAP = 24 // px — must match sm:gap-x-6 on the row

function Badge({ cert }) {
  const inner = (
    <>
      <img
        src={cert.image}
        alt=""
        loading="lazy"
        decoding="async"
        className="mx-auto h-[130px] w-auto drop-shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5"
      />
      <h3 className="mt-3 text-[13px] font-semibold leading-snug text-grey-900">
        {cert.short}
      </h3>
      <div className="mt-0.5 font-mono text-[10px] tabular-nums tracking-wide">
        <span style={{ color: cert.ink }}>{cert.issuer}</span>
        <span className="text-grey-400"> · {cert.date}</span>
      </div>
      {/* The badge being a link is not something you can see, so the
          affordance is spelled out — the same micro-label the rest of the
          page uses. The slot keeps its height when there is no Credly badge
          yet, so the row of captions stays level. */}
      <div className="mt-1.5 flex h-4 items-center justify-center font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400 transition-colors group-hover:text-grey-700">
        {cert.credlyUrl && (
          <>
            <ExternalLinkIcon />
            <span className="ml-1.5">Verify</span>
          </>
        )}
      </div>
    </>
  )
  const cls = 'group block w-[142px] text-center sm:w-[158px]'
  return cert.credlyUrl ? (
    <a
      href={cert.credlyUrl}
      target="_blank"
      rel="noreferrer"
      className={`${cls} rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-page`}
    >
      {inner}
      <span className="sr-only">{cert.name} — verify on Credly (opens in a new tab)</span>
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export default function Certifications() {
  // the rule is drawn to the width of the badges under it, not to the column,
  // so the label and count sit exactly above the first and last badge. It has
  // to be computed: a rule cannot measure the flex row beneath it. `max-w-full`
  // hands it back to the column on a screen too narrow to hold the row.
  const width = CERTS.length * CELL + (CERTS.length - 1) * GAP

  return (
    <Section id="certifications" kicker="Certifications" title="Credentials" className="!py-10 sm:!py-12">
      <div className="mx-auto max-w-full" style={{ width }}>
        <div className="flex items-baseline gap-3 border-b border-grey-200 pb-2.5">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
            AWS & HashiCorp
          </h3>
          <span className="ml-auto font-mono text-[11px] tabular-nums text-grey-400">
            {String(CERTS.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-9 sm:gap-x-6">
          {CERTS.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <Badge cert={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
