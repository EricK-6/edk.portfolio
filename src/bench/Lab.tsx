import type { ButtonHTMLAttributes, ReactNode } from 'react'

// The furniture every experiment on the bench shares: a card, a dark screen
// for the experiment itself, a row of controls, and a line saying which
// project the idea came from.
//
// The screens are the one dark thing below the ride. That is deliberate: they
// are instruments, and they borrow the ride's colours (the same glass, the
// same gold for the signal) so the two read as one machine.

export const SCREEN = {
  bg: '#071c1c',
  grid: 'rgba(94, 234, 212, 0.09)',
  line: '#e9f1ee',
  soft: 'rgba(233, 241, 238, 0.55)',
  faint: 'rgba(233, 241, 238, 0.2)',
  teal: '#5eead4',
  gold: '#f2c76e',
  red: '#ff8a5c',
}

export function LabCard({ id, from, title, children }: { id: string; from: string; title: string; children: ReactNode }) {
  return (
    <article className="card flex w-full min-w-0 flex-col !p-0 !pb-1.5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5">
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-grey-900">{title}</h3>
        {/* where the idea came from, and the way back to it */}
        <a
          href={`#${id}`}
          data-track={`bench-to-${id}`}
          className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-grey-500 underline decoration-grey-300 underline-offset-4 transition-colors hover:text-accent-deep"
        >
          {from}
        </a>
      </header>
      {children}
    </article>
  )
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative mx-5 mt-4 overflow-hidden rounded-lg bg-[#071c1c] ring-1 ring-inset ring-white/[0.06] ${className}`}>
      {children}
    </div>
  )
}

export function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">{children}</div>
}

export function LabButton({ primary = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`tap-44 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition active:translate-y-px disabled:opacity-50 ${
        primary
          ? 'border-accent bg-accent text-white hover:border-accent-deep hover:bg-accent-deep'
          : 'border-grey-300 bg-white text-grey-800 hover:border-grey-400 hover:text-grey-900'
      } ${className}`}
    />
  )
}

// One choice out of a few, as a single control.
export function Segmented<T extends string | number>({ label, options, value, onChange }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap rounded-lg border border-grey-300 bg-grey-100 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`tap-44 h-7 rounded-md px-2.5 text-[12.5px] font-medium transition ${
            value === o.value ? 'bg-white text-grey-900 shadow-sm ring-1 ring-grey-200' : 'text-grey-600 hover:text-grey-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// A slider with its name and its value either side of it.
export function Dial({ label, value, unit, min, max, step, onChange }: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const places = step < 0.1 ? 2 : step < 1 ? 1 : 0
  return (
    <label className="flex min-w-[6.5rem] flex-1 flex-col gap-2 text-[12px] text-grey-600">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-grey-700">{label}</span>
        <span className="font-mono tabular-nums text-grey-800">{value.toFixed(places)}{unit && ` ${unit}`}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="speed-range !w-full"
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
    </label>
  )
}

export const prefersStill = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
