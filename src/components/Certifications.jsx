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

// The four, grouped by level. Order within a group is oldest-earned first.
const CERTS = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    short: 'Solutions Architect',
    tier: 'Associate',
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
    tier: 'Associate',
    issuer: 'HashiCorp',
    date: 'Sep 2026',
    image: './terraform.webp',
    ink: INK.violet,
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    short: 'Cloud Practitioner',
    tier: 'Foundational',
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
    tier: 'Foundational',
    issuer: 'AWS',
    date: 'May 2026',
    image: './ai.webp',
    ink: INK.amber,
    credlyUrl:
      'https://www.credly.com/badges/e924df22-3bc9-48c2-847d-d6077a5551d0/public_url',
  },
]
const TIERS = ['Associate', 'Foundational']

// Two labelled groups, laid out the way the rest of the page lays things out.
//
// This was a pentagon for a while — the badges on the vertices of a figure,
// then in wedges of one. Both were the same mistake: every other section here
// is a left-aligned block of type with hairlines and small mono labels, and a
// centred diagram with spokes through it reads as something pasted in from a
// different site. Skills already threw out thirty-seven logos for being the
// loudest thing on the page; a wireframe pentagon was louder.
//
// Each group carries its own header — "Associate" over the two AWS/HashiCorp
// associate badges, "Foundational" over the two foundational ones — rather
// than one label spanning all four, because the label's job is to name what
// is under it, and a single word cannot honestly name two different levels.
//
// The two groups sit in one flex row rather than stacked, so on any screen
// with the room for it (two group widths plus the gap between them: 340 + 24
// + 340 = 704px, which the column already clears from md up) they read as a
// single continuous row of four — the header is the only thing that reveals
// the split. Where there is not room, the same flex-wrap that already broke
// four badges into two rows of two now breaks two groups into two labelled
// blocks instead, which if anything reads more clearly than an unlabelled
// wrap did.
const CELL = 158 // px — must match sm:w-[158px] on a badge
const GAP = 24 // px — must match sm:gap-x-6 on the row and the gap between groups

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
  return (
    <Section id="certifications" kicker="Certifications" title="Credentials" className="!py-10 sm:!py-12">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
        {TIERS.map((tier, gi) => {
          const items = CERTS.filter((c) => c.tier === tier)
          // each group's rule is drawn to the width of its own two badges, not
          // to the column — a rule cannot measure the flex row beneath it, so
          // the width has to be computed. `max-w-full` hands it back to the
          // column on a screen too narrow to hold even one group unwrapped.
          const width = items.length * CELL + (items.length - 1) * GAP
          return (
            <div key={tier} className="max-w-full" style={{ width }}>
              <div className="flex items-baseline gap-3 border-b border-grey-200 pb-2.5">
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-grey-500">
                  {tier}
                </h3>
                {/* The total, not this group's own count. "02" beside each
                    label read as if the two groups were being sized against
                    each other; the number a reader actually wants here is
                    how many credentials there are altogether. */}
                <span className="ml-auto font-mono text-[11px] tabular-nums text-grey-400">
                  {String(CERTS.length).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-9 sm:gap-x-6">
                {items.map((c, i) => (
                  <Reveal key={c.name} delay={(gi * 2 + i) * 60}>
                    <Badge cert={c} />
                  </Reveal>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
