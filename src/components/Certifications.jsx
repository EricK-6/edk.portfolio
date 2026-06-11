import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

const CERTS = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'Apr 2026',
    image: './cloud.png',
    description:
      'Proficiency in AWS core services and cloud architecture principles: the Well-Architected Framework, security best practices, and cost optimisation.',
    tags: ['EC2', 'S3', 'IAM', 'Lambda', 'VPC'],
  },
  {
    name: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    date: 'May 2026',
    image: './ai.png',
    description:
      'Foundational understanding of AI, machine learning, and generative AI concepts, including practical application of AWS AI/ML services.',
    tags: ['SageMaker', 'Bedrock', 'Rekognition'],
  },
]

export default function Certifications() {
  return (
    <Section id="certifications" kicker="Certifications" title="Credentials">
      <div className="grid gap-4 sm:grid-cols-2">
        {CERTS.map((c, i) => (
          <Reveal
            key={c.name}
            delay={i * 80}
            className="card relative overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/25 via-amber-400/15 to-transparent blur-3xl dark:from-orange-500/25 dark:via-amber-500/15"
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-32 w-auto flex-none rounded-xl object-contain drop-shadow-md"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{c.name}</h3>
                  <div className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">{c.issuer}</div>
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                {c.date}
              </span>
            </div>
            <p className="relative mt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {c.description}
            </p>
            {c.tags?.length > 0 && (
              <div className="relative mt-4 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
