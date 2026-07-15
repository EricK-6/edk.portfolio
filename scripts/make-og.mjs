import sharp from 'sharp'

// Regenerates public/og-image.png (the boarding-pass social preview).
// sharp is not a project dependency — install it temporarily to run:
//   npm i --no-save sharp && node scripts/make-og.mjs
// Bump the ?v= query on the og:image URLs in index.html afterwards so
// LinkedIn/Twitter refetch the cached image.

// 1200x630 OG image: the site's boarding-pass hero, dark theme.
const W = 1200
const H = 630
const SANS = 'Helvetica, Arial, sans-serif'
const MONO = 'Menlo, Courier New, monospace'
const EMERALD = '#10b981'
const GREY_100 = '#f5f5f4'
const GREY_400 = '#a8a29e'
const GREY_500 = '#78716c'
const GREY_600 = '#57534e'

// same fixed pseudo-barcode as the live hero
const BARS = [2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1]

// card geometry
const CX = 70, CY = 95, CW = 1060, CH = 440, R = 26
const PERF_X = CX + 740 // perforation line
const STUB_X = PERF_X + 36

const bars = (() => {
  let x = STUB_X
  const parts = []
  for (const w of BARS) {
    const bw = w * 2.4
    parts.push(`<rect x="${x.toFixed(1)}" y="${CY + 290}" width="${bw.toFixed(1)}" height="72" fill="${GREY_100}"/>`)
    x += bw + 4.4
  }
  return parts.join('\n')
})()

const field = (x, y, label, value, valueFill = GREY_100) => `
  <text x="${x}" y="${y}" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${GREY_600}">${label}</text>
  <text x="${x}" y="${y + 32}" font-family="${SANS}" font-size="23" font-weight="bold" fill="${valueFill}">${value}</text>`

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${EMERALD}" stop-opacity="0.9"/>
      <stop offset="0.55" stop-color="${EMERALD}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${EMERALD}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0" r="1.1">
      <stop offset="0" stop-color="${EMERALD}" stop-opacity="0.10"/>
      <stop offset="0.5" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="card"><rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="${R}"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="#000"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- a few stars -->
  ${[[150, 60], [420, 40], [760, 55], [1050, 45], [990, 590], [220, 585], [640, 600], [1140, 300], [40, 330]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 2.4 : 1.6}" fill="#fff" opacity="${i % 2 ? 0.5 : 0.85}"/>`)
    .join('\n  ')}

  <!-- ticket -->
  <rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="${R}" fill="#0c0a09" stroke="#292524" stroke-width="2"/>
  <g clip-path="url(#card)">
    <rect x="${CX}" y="${CY}" width="${CW}" height="7" fill="url(#accent)"/>
  </g>

  <!-- header row -->
  <text x="${CX + 46}" y="${CY + 62}" font-family="${MONO}" font-size="17" letter-spacing="6" fill="${GREY_500}">ERICKK·CLOUD — BOARDING PASS</text>
  <text x="${PERF_X - 40}" y="${CY + 62}" font-family="${MONO}" font-size="17" letter-spacing="2" fill="${GREY_600}" text-anchor="end">FLIGHT EK-2027</text>

  <!-- passenger -->
  <text x="${CX + 46}" y="${CY + 122}" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${GREY_600}">PASSENGER</text>
  <text x="${CX + 44}" y="${CY + 178}" font-family="${SANS}" font-size="58" font-weight="bold" fill="${GREY_100}">Dohyun (Eric) Kim<tspan fill="${EMERALD}">_</tspan></text>
  <text x="${CX + 46}" y="${CY + 214}" font-family="${SANS}" font-size="21" fill="${GREY_400}">Computer Systems Engineering (Hons) · University of Auckland</text>

  <!-- fields -->
  ${field(CX + 46, CY + 286, 'FROM', 'Auckland, NZ (AKL)')}
  ${field(CX + 306, CY + 286, 'TO', 'Your team')}
  ${field(CX + 506, CY + 286, 'SEAT', 'Summer 26/27')}
  ${field(CX + 46, CY + 370, 'CLASS', 'Embedded · Full stack · Digital hardware')}
  <circle cx="${CX + 514}" cy="${CY + 395}" r="6" fill="#34d399"/>
  <text x="${CX + 530}" y="${CY + 402}" font-family="${SANS}" font-size="23" font-weight="bold" fill="${GREY_100}">Open to internships</text>

  <!-- perforation -->
  <line x1="${PERF_X}" y1="${CY + 18}" x2="${PERF_X}" y2="${CY + CH - 18}" stroke="#44403c" stroke-width="3" stroke-dasharray="10 12"/>
  <circle cx="${PERF_X}" cy="${CY}" r="17" fill="#000"/>
  <circle cx="${PERF_X}" cy="${CY + CH}" r="17" fill="#000"/>

  <!-- stub -->
  <text x="${STUB_X}" y="${CY + 130}" font-family="${MONO}" font-size="15" letter-spacing="5" fill="${GREY_500}">GATE</text>
  <text x="${CX + CW - 46}" y="${CY + 134}" font-family="${MONO}" font-size="34" font-weight="bold" fill="${GREY_100}" text-anchor="end">P·01</text>
  <text x="${STUB_X}" y="${CY + 196}" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${GREY_600}">DOCUMENTS</text>
  <text x="${STUB_X}" y="${CY + 228}" font-family="${SANS}" font-size="21" fill="${GREY_400}">CV · GitHub · LinkedIn</text>
  ${bars}
  <text x="${STUB_X}" y="${CY + 396}" font-family="${MONO}" font-size="15" letter-spacing="5" fill="${GREY_600}">AKL·EK2027·INTERN</text>

  <!-- url -->
  <text x="${W / 2}" y="${H - 34}" font-family="${MONO}" font-size="19" letter-spacing="6" fill="${GREY_500}" text-anchor="middle">erickk.cloud</text>
</svg>`

await sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H)
  .png()
  .toFile(new URL('../public/og-image.png', import.meta.url).pathname)
console.log('og-image.png written')
