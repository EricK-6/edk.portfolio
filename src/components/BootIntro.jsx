import { useEffect, useRef, useState } from 'react'

// Sub-second kernel/POST-style boot log shown once per browser session.
// Fully skippable (any key / click / button) and skipped entirely for
// reduced-motion users and on repeat visits within the session.
const LINES = [
  '[ 0.000000 ] erickk.cloud bootloader v1.0',
  '[ 0.000412 ] cpu: Computer Systems Engineering @ UoA',
  '[ 0.001033 ] mem: initializing portfolio modules ....... ok',
  '[ 0.001847 ] mount /hero /projects /experience /skills .. ok',
  '[ 0.002566 ] loading profile: Dohyun (Eric) Kim ......... ok',
  '[ 0.003120 ] net: status = open to internships .......... up',
  '[ 0.003733 ] starting ui ............................... ok',
  'welcome',
]

export default function BootIntro() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    try { if (sessionStorage.getItem('booted')) return false } catch { /* ignore */ }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    return true
  })
  const [count, setCount] = useState(1)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!show) return
    try { sessionStorage.setItem('booted', '1') } catch { /* ignore */ }
    document.body.style.overflow = 'hidden'

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setFading(true)
      setTimeout(() => {
        document.body.style.overflow = ''
        setShow(false)
      }, 240)
    }

    let i = 1
    const iv = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= LINES.length) {
        clearInterval(iv)
        setTimeout(finish, 240)
      }
    }, 58)

    window.addEventListener('keydown', finish)
    window.addEventListener('click', finish)
    return () => {
      clearInterval(iv)
      window.removeEventListener('keydown', finish)
      window.removeEventListener('click', finish)
      document.body.style.overflow = ''
    }
  }, [show])

  if (!show) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[60] flex flex-col justify-center bg-black px-6 font-mono text-xs text-grey-300 transition-opacity duration-200 sm:px-12 sm:text-sm ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mx-auto w-full max-w-2xl">
        {LINES.slice(0, count).map((l, i) => (
          <div key={i} className={i === LINES.length - 1 ? 'mt-2 text-grey-100' : 'text-grey-400'}>
            {l}
            {i === LINES.length - 1 && <span className="animate-blink text-grey-100">_</span>}
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 right-6 text-[11px] text-grey-600">press any key to skip</div>
    </div>
  )
}
