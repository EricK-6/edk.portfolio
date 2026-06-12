import { useState } from 'react'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const CERTS = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Apr 2026',
    image: './cloud.png',
    description:
      'AWS core services, security, and cost fundamentals built on the Well-Architected Framework.',
    tags: ['EC2', 'S3', 'IAM', 'VPC', 'CloudWatch'],
  },
  {
    name: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    date: 'May 2026',
    image: './ai.png',
    description:
      'Foundations of AI, machine learning, and generative AI with AWS AI/ML services.',
    tags: ['SageMaker', 'Bedrock', 'Rekognition'],
  },
]

// build a rounded-corner vertical hexagon path for a viewBox of w x h
function roundedHex(w, h, r) {
  const v = [
    [w / 2, 0],
    [w, h * 0.16],
    [w, h * 0.84],
    [w / 2, h],
    [0, h * 0.84],
    [0, h * 0.16],
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
const HEX_H = 400
const HEX_PATH = roundedHex(HEX_W, HEX_H, 16)

// one face of the flip card: the hexagon shape plus its content
function HexFace({ gradientId, back = false, children }) {
  return (
    <div
      className={`absolute inset-0 [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`}
    >
      <svg
        viewBox={`0 0 ${HEX_W} ${HEX_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full drop-shadow-md"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path
          d={HEX_PATH}
          className="fill-grey-100 dark:fill-grey-900"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeOpacity="0.35"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
        {children}
      </div>
    </div>
  )
}

// hexagon that flips 180° to its details: hover on desktop, tap on touch,
// Enter/Space via keyboard; reduced-motion users get an instant swap
function FlipHex({ cert, index }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="relative aspect-[300/400] w-full max-w-sm [perspective:1200px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${cert.name}: flip for details`}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setFlipped(true) }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setFlipped(false) }}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setFlipped((f) => !f)
          }
        }}
        className={`relative h-full w-full cursor-pointer transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <HexFace gradientId={`hexBorder-${index}-front`}>
          <img
            src={cert.image}
            alt={cert.name}
            loading="lazy"
            decoding="async"
            className="h-44 w-auto flex-none object-contain drop-shadow-md"
          />
          <div>
            <h3 className="whitespace-nowrap text-lg font-semibold leading-snug">{cert.name}</h3>
            <div className="mt-1 text-sm font-medium uppercase tracking-wide text-orange-600/80 dark:text-orange-400/80">
              {cert.issuer} · {cert.date}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-grey-500 dark:text-grey-500">
            <FlipIcon /> hover or tap for details
          </div>
        </HexFace>

        <HexFace gradientId={`hexBorder-${index}-back`} back>
          <h3 className="text-lg font-semibold leading-snug">{cert.name}</h3>
          <div className="text-sm font-medium uppercase tracking-wide text-orange-600/80 dark:text-orange-400/80">
            {cert.issuer} · {cert.date}
          </div>
          <p className="max-w-[18rem] text-sm leading-relaxed text-grey-700 dark:text-grey-300">
            {cert.description}
          </p>
          {cert.tags?.length > 0 && (
            <div className="flex max-w-[19rem] flex-wrap justify-center gap-1.5">
              {cert.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </HexFace>
      </div>
    </div>
  )
}

function FlipIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 4 3 9 8 9" />
    </svg>
  )
}

export default function Certifications() {
  return (
    <Section id="certifications" kicker="Certifications" title="Credentials" className="!py-10 sm:!py-12">
      <div className="grid gap-6 sm:grid-cols-2">
        {CERTS.map((c, i) => (
          <Reveal key={c.name} delay={i * 80} className="flex justify-center">
            <FlipHex cert={c} index={i} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
