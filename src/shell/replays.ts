// `./spottern` and `./sentiment-pulse`: the two cloud projects, run in the
// terminal.
//
// Both are replays, and say so. Neither backend runs between demos (Bedrock on
// a university account, a Kinesis shard that bills by the hour), so instead of
// pretending, each prints what its pipeline does with real inputs: Spottern's
// own sample statement with its three planted frauds and the explanations the
// product gives for them; a stream of reviews scored the way PULSE scores
// them. A few seconds of output a visitor can watch, then a link to the real
// thing.

import { accent, dim, L, link, strong, t, type Line } from './lines'

type Print = (...lines: Line[]) => void
type Schedule = (fn: () => void, ms: number) => void

// Spottern's sample-data/sample_statement.csv, verbatim, and the verdicts its
// demo build shows for it.
const STATEMENT = [
  ['2026-06-15', 'COUNTDOWN AUCKLAND CBD', 87.42], ['2026-06-15', 'SPARK NZ MOBILE', 49.99],
  ['2026-06-16', 'UBER TRIP', 18.5], ['2026-06-17', 'PAK N SAVE MT ALBERT', 102.1],
  ['2026-06-18', 'NETFLIX.COM', 22.99], ['2026-06-19', 'MCDONALDS QUEEN ST', 14.2],
  ['2026-06-20', 'SALARY PAYMENT ACME LTD', 2450], ['2026-06-21', 'CONTACT ENERGY', 145.3],
  ['2026-06-22', 'BUNNINGS WAREHOUSE', 63.75], ['2026-06-23', 'SPOTIFY', 14.99],
  ['2026-06-24', 'ELECTRONICS WORLD HK', 1850], ['2026-06-25', 'GLORIA JEANS COFFEE', 6.5],
  ['2026-06-26', 'PAK N SAVE MT ALBERT', 95.2], ['2026-06-27', 'MCDONALDS QUEEN ST', 14.2],
  ['2026-06-27', 'MCDONALDS QUEEN ST', 14.2], ['2026-06-28', 'UNKNOWN MERCHANT OVERSEAS', 499],
  ['2026-06-29', 'COUNTDOWN AUCKLAND CBD', 91.3], ['2026-06-30', 'RENT PAYMENT', 650],
] as const

const FLAGGED = [
  { merchant: 'ELECTRONICS WORLD HK', amount: '$1,850.00', score: 0.88, why: "A large $1,850 purchase from an electronics retailer based in Hong Kong. It's far bigger than anything else on your statement and from overseas, so it's worth confirming you made it." },
  { merchant: 'MCDONALDS QUEEN ST ×2', amount: '$14.20', score: 0.72, why: "This exact charge of $14.20 at McDonald's appears twice on the same day, which often means you were accidentally billed twice." },
  { merchant: 'UNKNOWN MERCHANT OVERSEAS', amount: '$499.00', score: 0.81, why: "A $499 charge from a merchant we couldn't identify, based overseas. High-value payments to unclear merchants are a common sign of fraud and worth checking." },
]

export function runSpottern(print: Print, later: Schedule) {
  const steps: [number, Line][] = [
    [0, L(dim('$ '), 'spottern sample_statement.csv')],
    [350, L(dim('→ ingest     '), `${STATEMENT.length} transactions, ****4821, Jun 2026`)],
    [650, L(dim('→ bedrock    '), 'claude opus 4.8 · whole statement · 1 call')],
    [1300, L(dim('→ contract   '), t('schema valid', 'ok'), dim(` · ${STATEMENT.length} verdicts for ${STATEMENT.length} rows`))],
    [1600, L(dim('→ dynamodb   '), `${STATEMENT.length} records written`)],
    [1900, []],
    [1950, L(strong(`flagged 4 of ${STATEMENT.length}`), dim('  (3 patterns)'))],
  ]
  for (const [ms, line] of steps) later(() => print(line), ms)
  FLAGGED.forEach((f, i) => later(() => print(
    [],
    L(t('▲ ', 'warn'), strong(f.merchant), dim(`  ${f.amount}  risk ${f.score.toFixed(2)}`)),
    L(dim('  '), f.why),
  ), 2300 + i * 450))
  later(() => print(
    [],
    L(dim('→ sns        '), 'BNZ fraud-ops alerted · ', dim('ses  '), 'customer emailed'),
    L(dim('replay of the bundled sample. try your own: '), link('the demo ↗', 'https://erick-6.github.io/Spottern/')),
  ), 2300 + FLAGGED.length * 450 + 300)
}

// Made-up reviews, labelled by hand the way Comprehend labels them.
// Simulated, like the hosted dashboard.
const REVIEWS: [string, 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED', number][] = [
  ['Checkout took ten seconds. Genuinely impressed.', 'POSITIVE', 0.97],
  ['Order arrived two days late and nobody told me.', 'NEGATIVE', 0.93],
  ['The app works. The colours are a choice.', 'MIXED', 0.71],
  ['Delivery was scheduled for Thursday.', 'NEUTRAL', 0.88],
  ['Support fixed it before I finished typing.', 'POSITIVE', 0.95],
  ['Great product, terrible packaging.', 'MIXED', 0.66],
  ['Refund still pending after three weeks.', 'NEGATIVE', 0.9],
  ['Exactly as described. Would buy again.', 'POSITIVE', 0.98],
]

const TONE = { POSITIVE: 'ok', NEGATIVE: 'warn', NEUTRAL: 'dim', MIXED: 'accent' } as const

export function runPulse(print: Print, later: Schedule) {
  print(
    L(dim('$ '), 'sentiment-pulse --stream'),
    L(dim('kinesis → lambda → comprehend, batches of 10')),
    [],
  )
  let mood = 0
  REVIEWS.forEach(([text, label, score], i) => later(() => {
    mood += label === 'POSITIVE' ? 1 : label === 'NEGATIVE' ? -1 : 0
    print(L(t(label.padEnd(8), TONE[label]), dim(` ${score.toFixed(2)}  `), `"${text}"`))
  }, 250 + i * 380))
  later(() => {
    const pos = REVIEWS.filter((r) => r[1] === 'POSITIVE').length
    const bar = '█'.repeat(pos) + '░'.repeat(REVIEWS.length - pos)
    print(
      [],
      L(dim('mood  '), accent(bar), dim(`  net ${mood >= 0 ? '+' : ''}${mood} over ${REVIEWS.length} reviews`)),
      L(dim('simulated, like the hosted dashboard while the backend is torn down: '), link('open it ↗', 'https://master.d1vwgts5qfrat7.amplifyapp.com/')),
    )
  }, 250 + REVIEWS.length * 380 + 200)
}
