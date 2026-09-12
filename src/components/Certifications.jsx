import { useState } from 'react'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

// Each certificate carries its own hue rather than sharing the award amber.
// Two of the three badges are the same slate hexagon with different words on
// it, so without a colour of its own a medallion is only distinguishable by
// reading it. `soft` opens the border gradient and tints the glow; `deep`
// closes the gradient and sets the issuer line, so it is the one that has to
// hold small uppercase type against the hexagon's grey-100 fill (all three
// measure above 7:1 there).
const HUES = {
  amber: { soft: '#f59e0b', deep: '#92400e' }, // the original award pair
  blue: { soft: '#3b82f6', deep: '#1e3a8a' },  // pulled from the SAA badge art
  teal: { soft: '#14b8a6', deep: '#115e59' },  // the site accent
  violet: { soft: '#543bd5', deep: '#4c1d95' }, // sampled off the Terraform hexagon
}

const CERTS = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Apr 2026',
    image: './cloud.webp',
    hue: HUES.amber,
    description:
      'Validated foundational knowledge of AWS cloud concepts, core services, and cloud security and architecture.',
    tags: ['EC2', 'S3', 'IAM', 'VPC', 'CloudWatch'],
    credlyUrl:
      'https://www.credly.com/badges/9865f524-64b4-45e4-9f56-8c226ec8308a/public_url',
  },
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    date: 'Aug 2026',
    image: './saa.webp',
    hue: HUES.blue,
    description:
      'Validated the ability to design resilient, high-performing, secure and cost-optimised architectures on AWS.',
    tags: ['VPC', 'RDS', 'Route 53', 'ELB', 'Lambda'],
    credlyUrl:
      'https://www.credly.com/badges/c24fa5a9-1240-4555-8119-2e1decdf0a25/public_url',
  },
  {
    name: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    date: 'May 2026',
    image: './ai.webp',
    hue: HUES.teal,
    description:
      'Validated foundational knowledge of AI/ML concepts, generative AI, and AWS AI/ML services and tools.',
    tags: ['SageMaker', 'Bedrock', 'Rekognition'],
    credlyUrl:
      'https://www.credly.com/badges/e924df22-3bc9-48c2-847d-d6077a5551d0/public_url',
  },
  {
    name: 'HashiCorp Certified: Terraform Associate',
    issuer: 'HashiCorp',
    date: 'Sep 2026',
    image: './terraform.webp',
    hue: HUES.violet,
    description:
      'Validated the ability to provision and manage infrastructure as code with Terraform, from state and modules to remote backends.',
    tags: ['HCL', 'Modules', 'State', 'Providers'],
  },
]

// build a rounded-corner regular hexagon path for a viewBox of w x h — for a
// true pointy-top hexagon keep w:h at √3:2 with side vertices at 1/4 and 3/4
function roundedHex(w, h, r) {
  const v = [
    [w / 2, 0],
    [w, h * 0.25],
    [w, h * 0.75],
    [w / 2, h],
    [0, h * 0.75],
    [0, h * 0.25],
  ]
  const n = v.length
  const unit = (ax, ay, bx, by) => {
    const dx = bx - ax
    const dy = by - ay
    const l = Math.hypot(dx, dy) || 1
    return [dx / l, dy / l]
  }
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = v[(i + n - 1) % n]
    const c = v[i]
    const nx = v[(i + 1) % n]
    const [u1x, u1y] = unit(c[0], c[1], p[0], p[1])
    const [u2x, u2y] = unit(c[0], c[1], nx[0], nx[1])
    const A = [c[0] + u1x * r, c[1] + u1y * r]
    const B = [c[0] + u2x * r, c[1] + u2y * r]
    d += `${i === 0 ? 'M' : 'L'}${A[0].toFixed(1)},${A[1].toFixed(1)}`
    d += `Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)}`
  }
  return d + 'Z'
}

const HEX_W = 300
const HEX_H = 346 // 300 × 2/√3 — regular hexagon proportions
const HEX_PATH = roundedHex(HEX_W, HEX_H, 16)

// medallion that links to the Credly badge: the hexagon frames only the badge
// art (which already carries the cert name); hovering or focusing crossfades
// Pure opacity swap between two faces on a static element — no 3D, no filters
// animating, nothing that can destabilise.
function HexMedallion({ cert, index }) {
  const gradientId = `hexBorder-${index}`
  // A certificate without a Credly badge yet is still worth showing — it just
  // has no second step, so there is no "verify" promise the page cannot keep.
  const linked = Boolean(cert.credlyUrl)

  // The badge is now completely static until it is asked for.
  //
  // It used to swap to its description on hover, which meant the row of three
  // flickered between two faces as the pointer crossed them on the way to
  // anything else — you could not read a badge while moving past it, and on a
  // trackpad the whole section shimmered. Nothing on this page should change
  // because the cursor happened to pass over it.
  //
  // So: first press reveals the description, second press opens Credly. Two
  // presses for a new tab is only acceptable if the second one is announced,
  // which is what the line at the foot of the open face is for — it names the
  // next click before you make it.
  const [open, setOpen] = useState(false)

  const press = () => {
    if (!open) { setOpen(true); return }
    if (linked) window.open(cert.credlyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    // The hexagon plus a caption underneath it.
    //
    // The caption used to sit inside the badge, which is the one place it
    // cannot go: a hexagon's usable width collapses toward both vertices, so
    // an extra line at the bottom landed on top of the issuer and date. Out
    // here it always has the full column width, it never overlaps anything,
    // and it is the natural home for naming the second click before it
    // happens.
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
    <div
      role="button"
      tabIndex={0}
      onClick={press}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press() }
        else if (e.key === 'Escape') setOpen(false)
      }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}
      aria-expanded={open}
      aria-label={
        open && linked
          ? `${cert.name}: verify on Credly (opens in a new tab)`
          : `${cert.name}: show details`
      }
      className="group relative block aspect-[300/346] w-full max-w-sm cursor-pointer select-none rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      {/* soft glow pad grounding the badge (static, so nothing can flicker) */}
      <div
        aria-hidden="true"
        className="absolute inset-10 rounded-full blur-2xl"
        style={{ backgroundColor: cert.hue.soft, opacity: 0.1 }}
      />
      {/* the shadow stays constant: transitioning a filter re-composites the
          layer on every hover, which showed up as cursor/paint flicker */}
      <svg
        viewBox={`0 0 ${HEX_W} ${HEX_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full drop-shadow-md"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={cert.hue.soft} />
            <stop offset="100%" stopColor={cert.hue.deep} />
          </linearGradient>
        </defs>
        {/* the border is the one thing hover still touches: a border warming
            under the cursor says "this responds" without replacing what you
            are looking at */}
        <path
          d={HEX_PATH}
          className={`fill-grey-50 transition-[stroke-opacity] ${
            open ? '[stroke-opacity:0.9]' : '[stroke-opacity:0.45] group-hover:[stroke-opacity:0.7]'
          }`}
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
        />
      </svg>

      {/* badge face — art, name and date all kept inside the hexagon */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-8 py-[14%] text-center transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src={cert.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-[48%] w-auto flex-none object-contain drop-shadow-md"
        />
        <div>
          {/* two lines' worth of room whether or not the name needs it: the
              face is centred as one stack, so a one-line name (AI Practitioner)
              pushed its badge art and date lower than the two-line names beside
              it, and the row of three read as misaligned */}
          <h3 className="mx-auto flex min-h-[2.75rem] max-w-[15rem] items-center justify-center text-base font-semibold leading-snug">
            {cert.name}
          </h3>
          {/* Issuer over date, not joined by a dot. This line sits below the
              hexagon's widest band, so the width it can use is well under the
              full 300; run together it measured 23% too wide on a small phone. */}
          <div
            className="mt-1 text-xs font-medium uppercase leading-relaxed tracking-wide"
            style={{ color: cert.hue.deep }}
          >
            <span className="block whitespace-nowrap">{cert.issuer}</span>
            <span className="block whitespace-nowrap">{cert.date}</span>
          </div>
        </div>
      </div>

      {/* details face */}
      <div
        // py-[18%]: the description face is the taller of the two, and a
        // hexagon has least room exactly where a centred block of four lines
        // wants to go. Capping the band is what keeps the text off the
        // sloped edges instead of running out over them.
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-8 py-[18%] text-center transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <p className="max-w-[13.5rem] text-[13px] leading-relaxed text-grey-700">
          {cert.description}
        </p>
        {cert.tags?.length > 0 && (
          <div className="flex max-w-[14rem] flex-wrap justify-center gap-1.5">
            {cert.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* the affordance, in full width under the badge */}
    <p
      className="flex min-h-[1.25rem] items-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200"
      style={{ color: open && linked ? cert.hue.deep : undefined }}
    >
      {open && linked ? (
        <><ExternalLinkIcon /> Click again to verify on Credly</>
      ) : (
        <span className="text-grey-400">{open ? 'Click to close' : 'Click for details'}</span>
      )}
    </p>
    </div>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export default function Certifications() {
  return (
    <Section id="certifications" kicker="Certifications" title="Credentials" className="!py-10 sm:!py-12">
      {/* Two across from md, not sm. At 640 the pair squeezed each hexagon down
          to 239px — the narrowest it gets anywhere, tighter than a phone's
          single column — and the issuer line was left with 4% of margin. One
          column holds until there is room for two.
          Two stays the widest the grid goes, now that there are four badges:
          three across left the fourth alone on a second row against the left
          edge, and four across inside the 5xl column would be 226px a hexagon,
          under that 239 floor. A 2x2 at 3xl is 360px each and stays square. */}
      <div className="mx-auto grid max-w-3xl gap-10 md:grid-cols-2 md:gap-12">
        {CERTS.map((c, i) => {
          // An odd last badge is alone on the md row: let it span the pair so
          // it centres under them rather than hanging off the left column.
          // Spanning hands it the full width though, and the medallion would
          // take all 384 of its max-w-sm while the two above it sit at ~330 —
          // so the span is capped back to exactly one column (the row minus
          // one gap-12, halved).
          const strandedAtMd = i === CERTS.length - 1 && CERTS.length % 2 === 1
          return (
            <Reveal
              key={c.name}
              delay={i * 80}
              className={`flex justify-center ${
                strandedAtMd
                  ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-[calc((100%-3rem)/2)]'
                  : ''
              }`}
            >
              <HexMedallion cert={c} index={i} />
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
