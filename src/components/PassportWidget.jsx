import { useEffect, useRef, useState } from 'react'
import { GRID, LABELS } from '../sitemap.js'
import { STAMP_IDS, isFrequentFlyer, useVisited } from '../passport.js'
import { goTo } from '../router.js'
import { useLayout } from '../layout.js'

// Passport: a stamp per section visited. The pill sits bottom-right; clicking
// it unfolds a 3x3 stamp sheet mirroring the site's spatial grid. Collect all
// nine and you're a frequent flyer — confetti, once, plus a stamp on the
// hero's boarding pass (rendered by Hero).

// one-shot confetti burst, skipped for reduced-motion users
function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:70;overflow:hidden'
  document.body.appendChild(host)
  const colors = ['#059669', '#34d399', '#2563eb', '#60a5fa', '#f59e0b', '#e7ecf3']
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('span')
    const size = 5 + Math.random() * 6
    p.style.cssText = `position:absolute;top:-3vh;left:${Math.random() * 100}vw;width:${size}px;height:${size * 0.45}px;background:${colors[i % colors.length]};border-radius:1px`
    host.appendChild(p)
    p.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${60 + Math.random() * 50}vh) rotate(${540 + Math.random() * 540}deg) translateX(${(Math.random() - 0.5) * 160}px)`, opacity: 0 },
      ],
      { duration: 2200 + Math.random() * 1600, delay: Math.random() * 350, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' }
    )
  }
  setTimeout(() => host.remove(), 4600)
}

export default function PassportWidget() {
  const layout = useLayout()
  const visited = useVisited()
  const [open, setOpen] = useState(false)
  const done = isFrequentFlyer(visited)

  // fire the confetti exactly once, the moment the ninth stamp lands
  const wasDone = useRef(done)
  useEffect(() => {
    if (done && !wasDone.current) {
      try {
        if (!localStorage.getItem('ff-celebrated')) {
          localStorage.setItem('ff-celebrated', '1')
          celebrate()
        }
      } catch { celebrate() }
    }
    wasDone.current = done
  }, [done])

  return (
    <div
      className={`fixed right-3 z-40 print:hidden ${layout === 'space' ? 'bottom-[4.6rem]' : 'bottom-4'}`}
    >
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-60 rounded-xl border border-grey-300/80 bg-white/90 p-3 shadow-xl backdrop-blur dark:border-grey-800 dark:bg-grey-950/90">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-grey-500">
              Passport
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-widest ${done ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-grey-400 dark:text-grey-600'}`}>
              {done ? '★ Frequent flyer' : `${visited.size}/${STAMP_IDS.length} stamps`}
            </span>
          </div>
          {/* the site's own 3x3 spatial grid as a stamp sheet */}
          <div className="grid grid-cols-3 gap-1.5">
            {GRID.flat().map((id, i) => {
              const stamped = visited.has(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { goTo(id, layout); setOpen(false) }}
                  aria-label={`${LABELS[id]} — ${stamped ? 'stamped, revisit' : 'not stamped yet, fly there'}`}
                  className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border text-center transition ${
                    stamped
                      ? 'border-emerald-600/50 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-950/30'
                      : 'border-dashed border-grey-300 hover:border-grey-400 dark:border-grey-800 dark:hover:border-grey-600'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-mono text-[10px] leading-none ${stamped ? 'text-emerald-600 dark:text-emerald-400' : 'text-grey-300 dark:text-grey-700'}`}
                    style={{ transform: stamped ? `rotate(${((i * 7) % 21) - 10}deg)` : undefined }}
                  >
                    {stamped ? '✈' : '·'}
                  </span>
                  <span className={`text-[9px] leading-none ${stamped ? 'text-grey-700 dark:text-grey-300' : 'text-grey-400 dark:text-grey-600'}`}>
                    {LABELS[id]}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-center text-[10px] text-grey-400 dark:text-grey-600">
            {done ? 'all sectors cleared — thanks for flying' : 'visit every section to earn frequent flyer status'}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Passport: ${visited.size} of ${STAMP_IDS.length} sections stamped${done ? ' — frequent flyer' : ''}`}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-xs shadow-lg backdrop-blur transition ${
          done
            ? 'border-emerald-600/50 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            : 'border-grey-300/80 bg-white/85 text-grey-600 hover:text-grey-900 dark:border-grey-800 dark:bg-black/70 dark:text-grey-400 dark:hover:text-grey-100'
        }`}
      >
        <StampIcon done={done} />
        {done ? 'FREQUENT FLYER' : `${visited.size}/${STAMP_IDS.length}`}
      </button>
    </div>
  )
}

function StampIcon({ done }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* passport booklet */}
      <rect x="5" y="3" width="14" height="18" rx="2" />
      {done ? <path d="m9 12 2.2 2.2L15.5 9.5" /> : <circle cx="12" cy="11" r="3" />}
      {!done && <path d="M9 17h6" />}
    </svg>
  )
}
