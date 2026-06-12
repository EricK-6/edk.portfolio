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
        body: JSON.stringify({ name, email, subject, message }),
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
      subtitle="Fill in the form and I'll get back to you, or reach me directly via the links below."
    >
      <div className="grid gap-8 md:grid-cols-5">
        <Reveal className="md:col-span-2 space-y-4">
          <ContactLink label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
          <ContactLink label="LinkedIn" value="linkedin.com/in/erick06" href="https://www.linkedin.com/in/erick06/" external />
          <ContactLink label="GitHub" value="github.com/EricK-6" href="https://github.com/EricK-6" external />
        </Reveal>

        <Reveal as="form" delay={120} className="md:col-span-3 card space-y-4 block" onSubmit={handleSubmit} noValidate>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                className={inputClass(errors.name)}
                placeholder="Jane Recruiter"
              />
            </Field>
            <Field label="Your email" error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                className={inputClass(errors.email)}
                placeholder="jane@example.com"
              />
            </Field>
          </div>
          <Field label="Subject">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass()}
              placeholder="Internship opportunity"
            />
          </Field>
          <Field label="Message" error={errors.message}>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })) }}
              rows={5}
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

function ContactLink({ label, value, href, external }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group block rounded-xl border border-grey-300 bg-grey-100 p-4 transition hover:border-grey-400/60 hover:shadow-sm dark:border-grey-800 dark:bg-grey-900/60 dark:hover:border-grey-700"
    >
      <div className="text-xs font-medium uppercase tracking-widest text-grey-500 dark:text-grey-500">{label}</div>
      <div className="mt-1 font-medium text-grey-900 group-hover:text-accent dark:text-grey-100 dark:group-hover:text-accent-dark break-all">{value}</div>
    </a>
  )
}
