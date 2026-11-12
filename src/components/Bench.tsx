import { useEffect, useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import { Segmented } from '../bench/Lab'
import RaceLab from '../bench/RaceLab'
import MazeLab from '../bench/MazeLab'
import LfsrLab from '../bench/LfsrLab'
import ScopeLab from '../bench/ScopeLab'

// The bench: four ideas out of the projects above, running.
//
// A project card can say "an exclusion constraint makes double booking
// impossible". It cannot make anyone feel why that matters. So the idea at the
// heart of four of the projects is rebuilt here small enough to run in a
// browser tab and plain enough to poke.
//
// One at a time, behind a row of tabs. Four screens side by side was a wall,
// and three of them were always running for nobody; this is one instrument
// with four settings, and only the one on show is mounted.
//
// Each experiment still has its own address (`#bench-slotly`), which is how a
// project's "Run it" link and the terminal's `./slotly` reach it. The anchors
// are always in the page so the browser has somewhere to scroll to, and the
// tab follows the address.
const LABS = [
  { slug: 'slotly', tab: 'Booking race', Lab: RaceLab },
  { slug: 'autonomous-pathfinding-bot', tab: 'Maze', Lab: MazeLab },
  { slug: 'flappy-universe', tab: 'Shift register', Lab: LfsrLab },
  { slug: 'smart-energy-monitor', tab: 'Scope', Lab: ScopeLab },
]

const fromAddress = () => LABS.find((lab) => window.location.hash === `#bench-${lab.slug}`)?.slug

export default function Bench() {
  const [active, setActive] = useState(() => fromAddress() ?? LABS[0].slug)

  useEffect(() => {
    const follow = () => { const slug = fromAddress(); if (slug) setActive(slug) }
    window.addEventListener('hashchange', follow)
    return () => window.removeEventListener('hashchange', follow)
  }, [])

  const { Lab } = LABS.find((lab) => lab.slug === active) ?? LABS[0]

  return (
    <Section
      id="bench"
      kicker="Bench"
      title="Run the ideas"
      subtitle="Four ideas from the projects above, small enough to run right here."
      narrow
    >
      <Reveal className="relative">
        {LABS.map((lab) => <span key={lab.slug} id={`bench-${lab.slug}`} aria-hidden="true" className="absolute top-0" />)}
        <div className="mb-4 flex justify-center">
          <Segmented label="Experiment" options={LABS.map((lab) => ({ value: lab.slug, label: lab.tab }))} value={active} onChange={setActive} />
        </div>
        <Lab key={active} />
      </Reveal>
    </Section>
  )
}
