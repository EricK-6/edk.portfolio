import { useState } from 'react'
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
    description: 'Designs resilient, secure, cost-optimised architectures on AWS.',
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
    description: 'Provisions and manages infrastructure as code with Terraform.',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    short: 'Cloud Practitioner',
    tier: 'Foundational',
    issuer: 'AWS',
    date: 'Apr 2026',
    image: './cloud.webp',
    ink: INK.amber,
    description: 'Covers core AWS concepts, services and best practices.',
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
    description: 'Covers AI/ML fundamentals and generative AI on AWS.',
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

// Same contract as the project tiles: a press turns the badge over for the
// one line a name and a date cannot carry, and nothing moves until asked.
// Where it differs from a project card is the second press — a badge is a
// credential with somewhere to be verified, not a piece of work with a
// separate footer of links, so the second click is the verify step rather
// than a close. First click: brief and powerful description. Second click:
// Credly, in a new tab. A badge with no Credly link yet (Terraform) has
// nowhere to send a second click, so that one closes instead — the only
// promise a "Click to close" label can honestly make.
//
// The two faces share a CSS grid cell (both `col-start-1 row-start-1`)
// rather than being absolutely positioned, so the tile's height is however
// tall the taller face is, always — crossfading between them never resizes
// the tile, without having to hand-measure and hard-code a height.
function Badge({ cert }) {
  const [open, setOpen] = useState(false)
  const linked = Boolean(cert.credlyUrl)

  const press = () => {
    if (!open) { setOpen(true); return }
    if (linked) { window.open(cert.credlyUrl, '_blank', 'noopener,noreferrer'); return }
    setOpen(false)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={
        open && linked
          ? `${cert.name}: verify on Credly (opens in a new tab)`
          : `${cert.name}: show details`
      }
      onClick={press}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press() }
        else if (e.key === 'Escape') setOpen(false)
      }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}
      className="group grid w-[142px] cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-page sm:w-[158px]"
    >
      {/* front face: what it is */}
      <div
        className={`col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
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
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400">
          Click for details
        </div>
      </div>

      {/* back face: what it means, then where it leads */}
      <div
        className={`col-start-1 row-start-1 flex flex-col justify-center transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <p className="text-[12px] leading-relaxed text-grey-700">
          {cert.description}
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-grey-400 transition-colors group-hover:text-grey-700">
          {linked ? (
            <>
              <ExternalLinkIcon />
              Click again to verify
            </>
          ) : (
            'Click to close'
          )}
        </div>
      </div>
    </div>
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
                <span className="ml-auto font-mono text-[11px] tabular-nums text-grey-400">
                  {String(items.length).padStart(2, '0')}
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
