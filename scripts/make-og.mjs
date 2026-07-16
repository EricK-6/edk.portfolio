import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

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

// card geometry: wide and short, like a real ticket
const CX = 25, CY = 135, CW = 1150, CH = 360, R = 26
const BAND_W = 56 // vertical BOARDING PASS stub on the left edge
const M = CX + BAND_W + 30 // main segment left edge
const PERF_X = CX + 880 // perforation line
const STUB_X = PERF_X + 40

const field = (x, y, label, value, valueFill = GREY_100, size = 23) => `
  <text x="${x}" y="${y}" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${GREY_600}">${label}</text>
  <text x="${x}" y="${y + 32}" font-family="${SANS}" font-size="${size}" font-weight="bold" fill="${valueFill}">${value}</text>`

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

  <!-- tear-off stub: vertical BOARDING PASS reading bottom-to-top,
       sized to fill the stub's full height -->
  <text x="${CX + BAND_W / 2 + 8}" y="${CY + CH / 2}" font-family="${MONO}" font-size="22" letter-spacing="10" fill="${GREY_500}"
        text-anchor="middle" transform="rotate(-90, ${CX + BAND_W / 2 + 8}, ${CY + CH / 2})">BOARDING PASS</text>
  <line x1="${CX + BAND_W}" y1="${CY + 18}" x2="${CX + BAND_W}" y2="${CY + CH - 18}" stroke="#44403c" stroke-width="3" stroke-dasharray="10 12"/>
  <circle cx="${CX + BAND_W}" cy="${CY}" r="17" fill="#000"/>
  <circle cx="${CX + BAND_W}" cy="${CY + CH}" r="17" fill="#000"/>

  <!-- header row -->
  <text x="${M}" y="${CY + 52}" font-family="${MONO}" font-size="17" letter-spacing="6" fill="${GREY_500}">ERICKK·CLOUD</text>
  <text x="${PERF_X - 24}" y="${CY + 52}" font-family="${MONO}" font-size="17" letter-spacing="2" fill="${GREY_600}" text-anchor="end">FLIGHT EK-2027</text>

  <!-- passenger -->
  <text x="${M}" y="${CY + 100}" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${GREY_600}">PASSENGER</text>
  <text x="${M - 2}" y="${CY + 148}" font-family="${SANS}" font-size="54" font-weight="bold" fill="${GREY_100}">Dohyun (Eric) Kim<tspan fill="${EMERALD}">_</tspan></text>
  <text x="${M}" y="${CY + 180}" font-family="${SANS}" font-size="21" fill="${GREY_400}">Computer Systems Engineering (Hons) · University of Auckland</text>

  <!-- fields -->
  ${field(M, CY + 232, 'FROM', 'Auckland, NZ (AKL)')}
  ${field(M + 250, CY + 232, 'TO', 'Your team')}
  ${field(M + 410, CY + 232, 'SEAT', 'Summer 26/27')}
  ${field(M, CY + 302, 'CLASS', 'Embedded · Full stack · Digital hardware', GREY_100, 20)}
  <text x="${M + 410}" y="${CY + 302}" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${GREY_600}">STATUS</text>
  <circle cx="${M + 417}" cy="${CY + 327}" r="6" fill="#34d399"/>
  <text x="${M + 433}" y="${CY + 334}" font-family="${SANS}" font-size="21" font-weight="bold" fill="${GREY_100}">Open to internships</text>

  <!-- perforation -->
  <line x1="${PERF_X}" y1="${CY + 18}" x2="${PERF_X}" y2="${CY + CH - 18}" stroke="#44403c" stroke-width="3" stroke-dasharray="10 12"/>
  <circle cx="${PERF_X}" cy="${CY}" r="17" fill="#000"/>
  <circle cx="${PERF_X}" cy="${CY + CH}" r="17" fill="#000"/>

  <!-- stub (the QR itself is composited in by sharp below) -->
  <text x="${STUB_X}" y="${CY + 104}" font-family="${MONO}" font-size="15" letter-spacing="5" fill="${GREY_500}">GATE</text>
  <text x="${CX + CW - 46}" y="${CY + 108}" font-family="${MONO}" font-size="34" font-weight="bold" fill="${GREY_100}" text-anchor="end">P·01</text>
  <text x="${STUB_X}" y="${CY + 160}" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${GREY_600}">RESUME</text>
  <text x="${STUB_X}" y="${CY + 188}" font-family="${SANS}" font-size="21" fill="${GREY_400}">SWE vs EEE</text>

  <!-- url -->
  <text x="${W / 2}" y="${H - 34}" font-family="${MONO}" font-size="19" letter-spacing="6" fill="${GREY_500}" text-anchor="middle">erickk.cloud</text>
</svg>`

// QR replaces the stub barcode: resized with a white quiet-zone border and
// centred in the stub's free space
const QR_SIZE = 130
const QR_PAD = 6
const qr = await sharp(fileURLToPath(new URL('../public/qr.webp', import.meta.url)))
  .resize(QR_SIZE - QR_PAD * 2, QR_SIZE - QR_PAD * 2)
  .extend({ top: QR_PAD, bottom: QR_PAD, left: QR_PAD, right: QR_PAD, background: '#fff' })
  .png()
  .toBuffer()
const qrLeft = Math.round((STUB_X + CX + CW - 46) / 2 - QR_SIZE / 2)
const qrTop = CY + 206

await sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H)
  .composite([{ input: qr, left: qrLeft, top: qrTop }])
  .png()
  .toFile(fileURLToPath(new URL('../public/og-image.png', import.meta.url)))
console.log('og-image.png written')
