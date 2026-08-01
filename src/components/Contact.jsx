import Section from './Section.jsx'
import Reveal from './Reveal.jsx'
import { useState } from 'react'

const EMAIL = 'dohyunkim290106@gmail.com'
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvzdebnb'

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [gotcha, setGotcha] = useState('') // honeypot: humans never see it, bots fill it
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!isValidEmail(email)) e.email = 'Enter a valid email address'
    if (!message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject, message, _gotcha: gotcha }),
      })
      if (res.ok) {
        setStatus('success')
        setName(''); setEmail(''); setSubject(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section
      id="contact"
      kicker="Contact"
      title="Let's talk"
      subtitle="Fill in the form to contact me, I read every email."
    >
      <div className="mx-auto max-w-2xl">
        <Reveal className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <IconLink href={`mailto:${EMAIL}`} label={`Email ${EMAIL}`}><MailIcon />{EMAIL}</IconLink>
          <IconLink href="https://www.linkedin.com/in/erick06/" label="LinkedIn profile erick06" external><LinkedInIcon />erick06</IconLink>
          <IconLink href="https://github.com/EricK-6" label="GitHub profile EricK-6" external><GitHubIcon />EricK-6</IconLink>
        </Reveal>

        <Reveal as="form" delay={120} className="card space-y-4 block" onSubmit={handleSubmit} noValidate>
          {status === 'success' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              Message sent! I'll be in touch soon!
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
              Something went wrong. Try emailing me directly.
            </div>
          )}

          {/* spam trap: hidden from people (and screen readers), Formspree
              silently drops any submission where it's filled in */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              value={gotcha}
              onChange={(e) => setGotcha(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" error={errors.name}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                aria-invalid={errors.name ? true : undefined}
                className={inputClass(errors.name)}
                placeholder="Jane Recruiter"
              />
            </Field>
            <Field label="Your email" error={errors.email}>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                aria-invalid={errors.email ? true : undefined}
                className={inputClass(errors.email)}
                placeholder="jane@example.com"
              />
            </Field>
          </div>
          <Field label="Subject">
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass()}
              placeholder="Internship opportunity"
            />
          </Field>
          <Field label="Message" error={errors.message}>
            <textarea
              name="message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })) }}
              rows={5}
              aria-invalid={errors.message ? true : undefined}
              className={`${inputClass(errors.message)} resize-y min-h-[120px]`}
              placeholder="Hi Eric, …"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-60">
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <a href={`mailto:${EMAIL}`} className="btn-secondary">Just email me directly</a>
          </div>
        </Reveal>

        {/* always-mounted live region (out of the form's space-y flow) so
            screen readers announce the submit outcome */}
        <p role="status" aria-live="polite" className="sr-only">
          {status === 'success' && "Message sent! I'll be in touch soon!"}
          {status === 'error' && 'Something went wrong. Try emailing me directly.'}
          {status === 'sending' && 'Sending message…'}
        </p>
      </div>
    </Section>
  )
}

const inputClass = (error) =>
  `w-full rounded-lg border px-3 py-2 text-sm placeholder:text-grey-400 focus:outline-none focus:ring-2 transition
   bg-grey-50 text-grey-900 dark:bg-grey-900 dark:text-grey-100 dark:placeholder:text-grey-500
   ${error
     ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500/20'
     : 'border-grey-300 focus:border-accent focus:ring-accent/20 dark:border-grey-700 dark:focus:border-accent-dark dark:focus:ring-accent-dark/20'
   }`

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-grey-500 dark:text-grey-400">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </label>
  )
}

// compact pill links for the direct contact channels: icon + address / id
function IconLink({ href, label, external, children }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-label={label}
      title={label}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-grey-300 bg-grey-100 px-4 text-sm font-medium text-grey-700 transition hover:border-accent/60 hover:text-accent dark:border-grey-800 dark:bg-grey-900/60 dark:text-grey-300 dark:hover:border-accent-dark/60 dark:hover:text-accent-dark"
    >
      {children}
    </a>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.32V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}
