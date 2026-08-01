import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const CERTS = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Apr 2026',
    image: './cloud.webp',
    description:
      'Validated foundational knowledge of AWS cloud concepts, core services, and cloud security and architecture.',
    tags: ['EC2', 'S3', 'IAM', 'VPC', 'CloudWatch'],
    credlyUrl:
      'https://www.credly.com/badges/9865f524-64b4-45e4-9f56-8c226ec8308a/public_url',
  },
  {
    name: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    date: 'May 2026',
    image: './ai.webp',
    description:
      'Validated foundational knowledge of AI/ML concepts, generative AI, and AWS AI/ML services and tools.',
    tags: ['SageMaker', 'Bedrock', 'Rekognition'],
    credlyUrl:
      'https://www.credly.com/badges/e924df22-3bc9-48c2-847d-d6077a5551d0/public_url',
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
// to the description. Pure opacity swap on a static element — no 3D, no
// filters animating, nothing hover can destabilise.
function HexMedallion({ cert, index }) {
  const gradientId = `hexBorder-${index}`
  return (
    <a
      href={cert.credlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${cert.name}: verify on Credly (opens in a new tab)`}
      className="group relative block aspect-[300/346] w-full max-w-sm cursor-pointer select-none rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-grey-300 dark:focus-visible:ring-offset-grey-950"
    >
      {/* soft glow pad grounding the badge (static, so nothing can flicker) */}
      <div
        aria-hidden="true"
        className="absolute inset-10 rounded-full bg-award-soft/10 blur-2xl"
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
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        <path
          d={HEX_PATH}
          className="fill-grey-100 transition-[stroke-opacity] [stroke-opacity:0.45] group-hover:[stroke-opacity:0.9] dark:fill-grey-900"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
        />
      </svg>

      {/* badge face — art, name and date all kept inside the hexagon; the
          name wraps within a width the mid-band holds, and the small issuer
          line clears the bottom taper */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-8 text-center transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none">
        <img
          src={cert.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-[48%] w-auto flex-none object-contain drop-shadow-md"
        />
        <div>
          <h3 className="mx-auto max-w-[15rem] text-base font-semibold leading-snug">{cert.name}</h3>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-award">
            {cert.issuer} · {cert.date}
          </div>
        </div>
      </div>

      {/* details face — fades in over the badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
        <p className="max-w-[15rem] text-sm sm:text-justify leading-relaxed text-grey-700 dark:text-grey-300">
          {cert.description}
        </p>
        {cert.tags?.length > 0 && (
          <div className="flex max-w-[16rem] flex-wrap justify-center gap-1.5">
            {cert.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-grey-500 dark:text-grey-500">
          <ExternalLinkIcon /> click to verify on Credly
        </div>
      </div>
    </a>
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
      <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2 sm:gap-12">
        {CERTS.map((c, i) => (
          <Reveal key={c.name} delay={i * 80} className="flex justify-center">
            <HexMedallion cert={c} index={i} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
