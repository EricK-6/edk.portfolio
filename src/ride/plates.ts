// The six floors, drawn.
//
// Each floor is a plate of line art about the kind of work done on it, and
// every one is built from something real: the ATmega328P in its DIP-28 with
// the energy monitor's display and the light board's six phototransistors,
// the 16 bit LFSR from Flappy Universe with its actual taps, a UART frame
// spelling two initials, a maze being searched the way the PhotonTracker
// searches one, SLOTLY refusing an overlapping booking, Spottern's pipeline.
// Nothing is a stock icon. It is all drawn here, in code, with the Pen.
//
// One wire on each plate is the signal's route across that floor. It enters
// where the floor below handed it up and leaves where the floor above picks
// it up, so the six routes join into one path from a pin on a chip to the sky.

import { lfsrStep, LFSR_TAPS } from './lfsr'
import { fan, meander, Pen, route, type Pt } from './pen'

// how far apart the floors are stacked
export const GAP = 7.5

export interface Palette {
  // read by the shader: the plate itself, and its edge and grid
  mask: string
  rim: string
  // read by the pen
  line: string
  soft: string
  faint: string
  hue: string
  wire: string
  metal: string
}

export interface PlateSpec {
  level: number
  name: string
  palette: Palette
  // the signal's route across the floor, entry to exit
  path: Pt[]
  draw: (pen: Pen, pal: Palette, path: Pt[]) => void
}

// Where the signal changes floors. Each is the exit of one plate and, straight
// above it, the entry of the next: which is all a via is.
const V1: Pt = [4.4, -3.4]
const V2: Pt = [-4.4, 3.0]
const V3: Pt = [4.4, 3.0]
const V4: Pt = [-4.4, -3.4]
const V5: Pt = [4.4, 3.0]
const V6: Pt = [3.4, -4.0]

const INK = 'rgba(3, 14, 16, 0.92)'
const COPPER = '#dcae5a'

// The mood shifts as the signal climbs: solder-mask green at the bottom, then
// colder and bluer on every floor, until the last one is nearly sky.
const palette = (mask: string, hue: string, wire?: string): Palette => ({
  mask,
  rim: hue,
  line: '#e9f1ee',
  soft: 'rgba(233, 241, 238, 0.56)',
  faint: 'rgba(233, 241, 238, 0.2)',
  hue,
  wire: wire ?? hue,
  metal: COPPER,
})

// --- shared furniture ----------------------------------------------------------

// What every plate carries: corner marks, a rule along the far edge, and the
// floor's number and name in the near corner, like a level sign in a car park.
function frame(pen: Pen, pal: Palette, level: number, name: string, note: string) {
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * 5.42
    const y = sy * 5.42
    pen.line([[x - sx * 0.36, y], [x, y], [x, y - sy * 0.36]], pal.soft, 0.03)
  }
  for (let i = -9; i <= 9; i++) {
    pen.line([[i * 0.5, -5.42], [i * 0.5, -5.42 + (i % 4 === 0 ? 0.17 : 0.08)]], pal.faint, 0.02)
  }
  const code = `L${level}`
  pen.text(code, -5.2, 5.16, { size: 0.84, color: pal.line })
  const w = pen.measure(code, { size: 0.84 })
  pen.text(name.toUpperCase(), -5.2 + w + 0.24, 4.8, { size: 0.26, color: pal.hue, track: 0.08 })
  pen.text(note, -5.2 + w + 0.24, 5.14, { size: 0.15, color: pal.soft, track: 0.02 })
}

// Where the signal arrives from below or leaves for above.
function port(pen: Pen, pal: Palette, [x, y]: Pt, label: string, side: 1 | -1 = 1) {
  pen.circle(x, y, 0.31, { stroke: pal.metal, lw: 0.028 })
  pen.circle(x, y, 0.17, { fill: pal.metal })
  pen.circle(x, y, 0.07, { fill: INK })
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + Math.PI / 4
    pen.line([[x + Math.cos(a) * 0.38, y + Math.sin(a) * 0.38], [x + Math.cos(a) * 0.48, y + Math.sin(a) * 0.48]], pal.metal, 0.025)
  }
  if (label) pen.text(label, x + side * 0.62, y + 0.05, { size: 0.14, color: pal.soft, align: side > 0 ? 'left' : 'right', track: 0.03 })
}

// A labelled block in a diagram.
function block(pen: Pen, pal: Palette, cx: number, cy: number, w: number, h: number, title: string, sub = '') {
  pen.box(cx, cy, w, h, { fill: 'rgba(4, 18, 22, 0.78)', stroke: pal.line, lw: 0.03, r: 0.1, cover: true })
  pen.text(title, cx, cy + (sub ? -0.04 : 0.07), { size: 0.19, color: pal.line, align: 'center', track: 0.03 })
  if (sub) pen.text(sub, cx, cy + 0.24, { size: 0.13, color: pal.soft, align: 'center', track: 0.02 })
}

function arrow(pen: Pen, [x, y]: Pt, [dx, dy]: Pt, color: string, s = 0.13) {
  // dx, dy is the way it points; the two barbs sit either side of it
  const px = -dy
  const py = dx
  pen.poly([[x, y], [x - dx * s + px * s * 0.55, y - dy * s + py * s * 0.55], [x - dx * s - px * s * 0.55, y - dy * s - py * s * 0.55]], { fill: color })
}

// --- L0 · silicon --------------------------------------------------------------

// U1, an ATmega328P in the DIP-28 the energy monitor used: two rows of
// fourteen pins. L(k) and R(k) are its left and right pins, top to bottom.
const U1X = -0.3
const U1TOP = -1.99
const PIN = 0.26
const L = (k: number): Pt => [U1X - 0.72, U1TOP + k * PIN]
const R = (k: number): Pt => [U1X + 0.72, U1TOP + k * PIN]

const SILICON_PATH: Pt[] = [R(0), [0.95, -1.99], [2.36, -3.4], ...meander(2.5, 3.9, -3.4, 3, -0.46), V1]

// The lit segments of a seven segment digit, a to g.
const SEVEN: Record<string, string> = { P: 'abefg', '5': 'acdfg', '0': 'abcdef', ' ': '' }

function silicon(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, wire } = pal
  const tin = '#ecd08f'
  const under = 'rgba(94, 234, 212, 0.15)'
  const th = (x: number, y: number, r = 0.095) => { pen.circle(x, y, r, { fill: tin }); pen.circle(x, y, r * 0.42, { fill: INK }) }
  // a two-pad surface mount part, lying along x or standing along y
  const part = (x: number, y: number, standing = false) => {
    const d = 0.13
    pen.box(x, y, standing ? 0.2 : 0.44, standing ? 0.44 : 0.2, { stroke: soft, lw: 0.018, r: 0.03 })
    pen.box(x - (standing ? 0 : d), y - (standing ? d : 0), standing ? 0.15 : 0.1, standing ? 0.1 : 0.15, { fill: tin })
    pen.box(x + (standing ? 0 : d), y + (standing ? d : 0), standing ? 0.15 : 0.1, standing ? 0.1 : 0.15, { fill: tin })
  }
  const label = (s: string, x: number, y: number, size = 0.13, align: CanvasTextAlign = 'left') => pen.text(s, x, y, { size, color: soft, align, track: 0.02 })

  // The other side of the board: a two-layer PCB shows its bottom copper as
  // ghosts under the mask, joined to this side at the vias.
  for (const run of [
    [[-0.6, -3.45], [-0.6, -2.6], [-0.3, -2.3], [-0.3, 2.35]],
    [[-2.75, 0.22], [-2.75, -2.2], [-3.9, -3.35]],
    [[1.25, -1.73], [1.25, -2.6], [0.2, -3.65]],
    [[4.85, 4.75], [5.05, 4.55], [5.05, 0.3]],
    [[-4.45, -1.21], [-4.95, -0.71], [-4.95, 0.9]],
  ] as Pt[][]) pen.line(run, under, 0.085)

  // --- top copper
  const t = (pts: Pt[], w = 0.05) => pen.wire(pts, wire, w)

  // reset, serial and a status LED off the top of the left row
  t(route(L(0), [-1, 0], [-3.08, -3.0], 0.35))
  t(route(L(1), [-1, 0], [-4.5, -1.9], 0.9))
  t(route(L(2), [-1, 0], [-4.5, -1.6], 1.1))
  t([L(3), [-3.32, -1.21]])
  t([[-3.58, -1.21], [-3.92, -1.21]])
  t([[-4.18, -1.21], [-4.45, -1.21]])
  // the display: digit selects swing wide, the segment bus fans in under them
  t(fan(L(4), [-1, 0], [-4.9, 1.78], 0.88))
  t(fan(L(5), [-1, 0], [-4.46, 1.78], 0.9))
  for (let k = 10; k <= 13; k++) t(fan(L(k), [-1, 0], [-2.7 - (13 - k) * 0.44, 1.78], 0.12))
  // decoupling, then the crystal and its two load capacitors
  t([L(6), [-1.6, -0.43]])
  t([L(7), [-1.6, -0.17]])
  t([L(8), [-2.22, 0.09]])
  t([L(9), [-2.22, 0.35]])
  t([[-2.48, 0.09], [-2.75, 0.09], [-2.75, 0.35], [-2.48, 0.35]])
  // two analog channels through the op-amp, in from the sense terminal
  t([R(1), [1.25, -1.73]])
  for (let k = 2; k <= 5; k++) t(route(R(k), [1, 0], [2.52, -1.19 + (k - 2) * PIN], 1.1))
  t([R(6), [1.0, -0.43]])
  t([R(7), [1.0, -0.17]])
  t([[3.48, -1.19], [4.02, -1.19]])
  t([[4.28, -1.19], [5.0, -1.19]])
  t([[3.48, -0.67], [4.02, -0.67]])
  t([[4.28, -0.67], [5.0, -0.67]])
  t([[3.48, -0.93], [3.8, -0.93]])
  t([[3.48, -0.41], [3.8, -0.41]])
  // the light board: six phototransistors on a six wire fan
  for (let k = 8; k <= 13; k++) {
    const x = 4.6 - (k - 8) * 0.6
    t(fan(R(k), [1, 0], [x, 3.5], 1.0))
    t([[x, 3.5], [x, 3.7]], 0.04)
    t([[x, 4.03], [x, 4.27]], 0.04)
    t([[x, 4.53], [x, 4.75]], 0.04)
  }
  t([[1.35, 4.75], [4.85, 4.75]], 0.07)
  // power in: jack, bulk capacitor, regulator, capacitor, a lit LED
  t([[-2.45, -4.45], [-1.87, -4.45]], 0.085)
  t([[-1.63, -4.45], [-1.2, -4.45], [-0.86, -4.11]], 0.085)
  t([[-0.34, -4.11], [0.0, -4.45], [0.43, -4.45]], 0.085)
  t([[-0.6, -4.11], [-0.6, -3.45]], 0.085)
  t([[0.67, -4.45], [1.22, -4.45]])
  t([[1.48, -4.45], [1.8, -4.45]])
  t([[2.06, -4.45], [2.4, -4.45]])

  // the signal's own trace, last so nothing paints over its marker
  pen.wire(path, pal.metal, 0.078, { main: true })

  // --- parts, on top of the copper
  // U1
  pen.box(U1X, -0.3, 1.0, 3.72, { fill: 'rgba(5, 20, 20, 0.95)', stroke: line, lw: 0.035, r: 0.06 })
  pen.arc(U1X, -2.16, 0.17, 0, Math.PI, line, 0.03)
  pen.circle(U1X - 0.3, -1.86, 0.045, { fill: line })
  for (let k = 0; k < 14; k++) {
    pen.line([[U1X - 0.62, L(k)[1]], [U1X - 0.5, L(k)[1]]], tin, 0.07, { cap: 'butt' })
    pen.line([[U1X + 0.5, R(k)[1]], [U1X + 0.62, R(k)[1]]], tin, 0.07, { cap: 'butt' })
    th(...L(k))
    th(...R(k))
  }
  pen.text('ATMEGA328P', U1X + 0.07, -0.3, { size: 0.24, color: line, align: 'center', rot: -Math.PI / 2, track: 0.05 })
  label('U1', U1X + 0.62, -2.3, 0.15)

  // reset switch, serial header, status LED
  pen.box(-3.4, -3.0, 0.62, 0.62, { stroke: soft, lw: 0.025, r: 0.05 })
  pen.circle(-3.4, -3.0, 0.17, { stroke: line, lw: 0.025 })
  for (const [x, y] of [[-3.08, -3.0], [-3.72, -3.0]]) th(x, y, 0.08)
  label('SW1 RESET', -3.72, -3.48)
  pen.rect(-4.78, -2.72, 0.36, 1.34, { stroke: soft, lw: 0.02, r: 0.04 })
  ;['GND', '5V', 'RX', 'TX'].forEach((name, i) => {
    const y = -2.5 + i * 0.3
    if (i === 0) pen.box(-4.6, y, 0.19, 0.19, { fill: tin })
    else th(-4.6, y)
    if (i === 0) pen.circle(-4.6, y, 0.04, { fill: INK })
    label(name, -4.9, y + 0.05, 0.12, 'right')
  })
  label('J2 UART', -4.78, -2.86)
  part(-3.45, -1.21)
  part(-4.05, -1.21)
  pen.via(-4.45, -1.21, 0.08, tin)
  label('D2', -4.05, -0.95, 0.12, 'center')

  // crystal and its capacitors, the decoupling pair either side of the chip
  pen.box(-1.6, 0.22, 0.44, 0.64, { stroke: line, lw: 0.028, r: 0.2 })
  th(-1.6, 0.09, 0.08)
  th(-1.6, 0.35, 0.08)
  part(-2.35, 0.09)
  part(-2.35, 0.35)
  pen.via(-2.75, 0.22, 0.08, tin)
  label('Y1 16 MHz', -2.56, 0.78, 0.12)
  part(-1.6, -0.3, true)
  part(1.0, -0.3, true)
  label('C3', -1.9, -0.26, 0.11, 'right')
  label('C4', 1.2, -0.26, 0.11)
  pen.via(1.25, -1.73, 0.085, tin)

  // the display, showing a power reading
  pen.rect(-5.14, 1.92, 2.68, 1.36, { fill: 'rgba(5, 20, 20, 0.95)', stroke: line, lw: 0.03, r: 0.06 })
  'P 50'.split('').forEach((ch, i) => {
    const cx = -4.72 + i * 0.6
    const cy = 2.6
    const w = 0.16
    const h = 0.25
    const lit = '#ff8a5c'
    const off = 'rgba(255, 138, 92, 0.13)'
    const seg = (on: boolean, a: Pt, b: Pt) => pen.line([a, b], on ? lit : off, 0.055)
    const on = SEVEN[ch]
    seg(on.includes('a'), [cx - w, cy - h * 2], [cx + w, cy - h * 2])
    seg(on.includes('b'), [cx + w + 0.03, cy - h * 2 + 0.05], [cx + w + 0.03, cy - 0.05])
    seg(on.includes('c'), [cx + w + 0.03, cy + 0.05], [cx + w + 0.03, cy + h * 2 - 0.05])
    seg(on.includes('d'), [cx - w, cy + h * 2], [cx + w, cy + h * 2])
    seg(on.includes('e'), [cx - w - 0.03, cy + 0.05], [cx - w - 0.03, cy + h * 2 - 0.05])
    seg(on.includes('f'), [cx - w - 0.03, cy - h * 2 + 0.05], [cx - w - 0.03, cy - 0.05])
    seg(on.includes('g'), [cx - w, cy], [cx + w, cy])
    if (i === 2) pen.circle(cx + w + 0.13, cy + h * 2, 0.035, { fill: lit })
  })
  for (let i = 0; i < 6; i++) { th(-4.9 + i * 0.44, 1.78, 0.08); th(-4.9 + i * 0.44, 3.42, 0.08) }
  label('DS1', -2.36, 2.1, 0.13)

  // op-amp, its gain resistors and the sense terminal
  pen.box(3.0, -0.8, 0.62, 1.04, { fill: 'rgba(5, 20, 20, 0.95)', stroke: line, lw: 0.03, r: 0.05 })
  pen.circle(2.83, -1.16, 0.04, { fill: line })
  for (let i = 0; i < 4; i++) { th(2.52, -1.19 + i * PIN, 0.08); th(3.48, -1.19 + i * PIN, 0.08) }
  label('U2', 3.0, -1.5, 0.13, 'center')
  part(4.15, -1.19)
  part(4.15, -0.67)
  pen.via(3.8, -0.93, 0.07, tin)
  pen.via(3.8, -0.41, 0.07, tin)
  pen.rect(4.72, -1.5, 0.56, 1.14, { stroke: soft, lw: 0.025, r: 0.05 })
  th(5.0, -1.19, 0.15)
  th(5.0, -0.67, 0.15)
  label('J1 SENSE', 5.28, -1.64, 0.13, 'right')

  // the six sensors: a phototransistor, light falling on it, its 47k to ground
  for (let j = 0; j < 6; j++) {
    const x = 1.6 + j * 0.6
    th(x, 3.5, 0.075)
    pen.circle(x, 3.86, 0.17, { fill: 'rgba(5, 20, 20, 0.95)', stroke: line, lw: 0.028 })
    pen.circle(x, 3.86, 0.05, { fill: line })
    pen.line([[x - 0.34, 3.56], [x - 0.22, 3.68]], pal.hue, 0.022)
    arrow(pen, [x - 0.2, 3.7], [0.707, 0.707], pal.hue, 0.075)
    part(x, 4.4, true)
  }
  pen.via(4.85, 4.75, 0.085, tin)
  label('Q1 .. Q6  ·  47k', 1.36, 5.08, 0.13)

  // power in
  pen.box(-2.9, -4.5, 0.9, 0.86, { stroke: line, lw: 0.028, r: 0.06 })
  pen.box(-2.52, -4.45, 0.1, 0.34, { fill: tin })
  pen.box(-3.2, -4.45, 0.1, 0.34, { fill: tin })
  label('J5 9V', -2.9, -3.86, 0.12, 'center')
  for (const x of [-1.75, 0.55]) {
    pen.circle(x, -4.45, 0.36, { stroke: line, lw: 0.028 })
    th(x - 0.12, -4.45, 0.07)
    th(x + 0.12, -4.45, 0.07)
    pen.text('+', x - 0.25, -4.56, { size: 0.15, color: soft, align: 'center' })
  }
  pen.box(-0.6, -4.5, 1.0, 0.5, { fill: 'rgba(5, 20, 20, 0.95)', stroke: line, lw: 0.028, r: 0.04 })
  for (const x of [-0.86, -0.6, -0.34]) th(x, -4.11, 0.085)
  label('U3 5V', -0.6, -4.42, 0.13, 'center')
  pen.via(-0.6, -3.45, 0.085, tin)
  part(1.35, -4.45)
  part(1.93, -4.45)
  pen.via(2.4, -4.45, 0.08, tin)
  label('D1 PWR', 1.35, -4.72, 0.12, 'center')

  // who made it, the way a board says so
  pen.text('ERIC KIM', -1.55, 4.74, { size: 0.36, color: line, weight: 500, track: 0.05 })
  label('MADE IN AUCKLAND, NZ', -1.55, 5.08, 0.13)

  port(pen, pal, V1, 'TP1', -1)
  pen.text('TO L1', V1[0], V1[1] - 0.66, { size: 0.13, color: soft, align: 'center', track: 0.04 })
  frame(pen, pal, 0, 'Silicon', 'TWO LAYER PCB')
}

// --- L1 · logic ----------------------------------------------------------------

const LOGIC_PATH: Pt[] = [V1, [-5.0, -3.4], [-5.0, -1.0], [-1.3, -1.0], [-1.3, 3.0], V2]

function logic(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, faint, hue, wire } = pal
  const cell = (k: number) => 3.92 - k * 0.56

  // the clock rail, down from the PLL and into every flip-flop
  pen.wire([[4.3, -4.72], [4.3, -4.25], [cell(15) - 0.2, -4.25]], wire, 0.035)
  for (let k = 0; k < 16; k++) {
    pen.wire([[cell(k), -4.25], [cell(k), -3.7]], wire, 0.03)
    pen.poly([[cell(k) - 0.07, -3.68], [cell(k) + 0.07, -3.68], [cell(k), -3.57]], { fill: wire })
  }
  // the feedback: the tapped bits are XORed together and fed back to the start
  const taps = LFSR_TAPS.map((b) => cell(b - 1))
  pen.wire([[Math.min(...taps), -2.5], [4.4, -2.5], [4.4, -3.06]], wire, 0.04)
  for (const x of taps) pen.wire([[x, -3.12], [x, -2.62]], wire, 0.035)

  pen.wire(path, pal.metal, 0.07, { main: true })

  // sixteen flip-flops, holding a real state of the register
  let state = 0xace1
  for (let i = 0; i < 7; i++) state = lfsrStep(state)
  for (let k = 0; k < 16; k++) {
    const x = cell(k)
    pen.box(x, -3.4, 0.42, 0.56, { fill: 'rgba(4, 18, 22, 0.86)', stroke: line, lw: 0.028, r: 0.04, cover: true })
    if ((state >> (15 - k)) & 1) pen.box(x, -3.4, 0.2, 0.2, { fill: hue, r: 0.03 })
    else pen.box(x, -3.4, 0.2, 0.2, { stroke: faint, lw: 0.02, r: 0.03 })
  }
  for (const b of LFSR_TAPS) {
    const x = cell(b - 1)
    pen.circle(x, -2.5, 0.14, { fill: 'rgba(4, 18, 22, 0.95)', stroke: line, lw: 0.028 })
    pen.line([[x - 0.14, -2.5], [x + 0.14, -2.5]], line, 0.022)
    pen.line([[x, -2.64], [x, -2.36]], line, 0.022)
    pen.text(String(b), x, -2.14, { size: 0.13, color: soft, align: 'center' })
  }
  pen.text('16 BIT FIBONACCI LFSR', -4.72, -4.86, { size: 0.21, color: line, track: 0.05 })
  pen.text('x¹⁶ + x¹⁵ + x¹³ + x⁴ + 1   ·   65,535 STATES', -4.72, -4.5, { size: 0.15, color: hue, track: 0.03 })
  block(pen, pal, 4.55, -4.96, 1.3, 0.48, 'PLL', '')
  pen.text('50 → 25 MHz', 3.72, -4.9, { size: 0.13, color: soft, align: 'right', track: 0.02 })

  // what the random number is for: where the next pipe's gap goes
  block(pen, pal, -3.4, -1.0, 2.3, 0.8, 'GAP CENTRE', 'ROWS 80 .. 320')
  block(pen, pal, -1.3, 0.35, 1.5, 0.74, 'AABB TEST', 'BIRD vs PIPE')
  // the sync counters that turn a 25 MHz clock into a picture
  block(pen, pal, -4.0, 0.5, 2.0, 0.62, 'H COUNT', '0 .. 799')
  block(pen, pal, -4.0, 1.42, 2.0, 0.62, 'V COUNT', '0 .. 524')
  pen.wire([[-3.0, 0.5], [-2.05, 0.5]], wire, 0.035)
  pen.wire([[-3.0, 1.42], [-2.5, 1.42], [-2.5, 0.62], [-2.05, 0.62]], wire, 0.035)
  // the last gate before the floor above: a hit is the bird AND a pipe
  const gx = -2.75
  pen.poly([[gx + 0.34, 2.64], [gx, 2.64], [gx, 3.36], [gx + 0.34, 3.36]], { fill: 'rgba(4, 18, 22, 0.95)' })
  pen.line([[gx + 0.34, 2.64], [gx, 2.64]], line, 0.03)
  pen.line([[gx, 3.36], [gx + 0.34, 3.36]], line, 0.03)
  pen.line([[gx + 0.34, 2.64], [gx + 0.34, 3.36]], line, 0.03)
  pen.arc(gx, 3.0, 0.36, Math.PI / 2, (Math.PI * 3) / 2, line, 0.03)
  pen.text('HIT', gx - 0.62, 2.8, { size: 0.14, color: soft, align: 'center', track: 0.04 })

  // the control unit: five states and the clicks that move between them
  const S: Record<string, Pt> = { TITLE: [1.15, -0.95], SELECT: [2.9, -0.95], PLAY: [4.65, -0.95], PAUSE: [4.65, 0.75], OVER: [2.9, 0.75] }
  const link = (a: string, b: string) => {
    const [ax, ay] = S[a]
    const [bx, by] = S[b]
    const d = Math.hypot(bx - ax, by - ay)
    const ux = (bx - ax) / d
    const uy = (by - ay) / d
    pen.wire([[ax + ux * 0.5, ay + uy * 0.5], [bx - ux * 0.58, by - uy * 0.58]], wire, 0.035)
    arrow(pen, [bx - ux * 0.5, by - uy * 0.5], [ux, uy], wire, 0.14)
  }
  link('TITLE', 'SELECT'); link('SELECT', 'PLAY'); link('PLAY', 'PAUSE'); link('PLAY', 'OVER'); link('OVER', 'TITLE')
  for (const [name, [x, y]] of Object.entries(S)) {
    pen.circle(x, y, 0.5, { fill: 'rgba(4, 18, 22, 0.86)', stroke: name === 'PLAY' ? hue : line, lw: name === 'PLAY' ? 0.05 : 0.03 })
    pen.text(name === 'OVER' ? 'GAME OVER' : name, x, y + 0.05, { size: name === 'OVER' ? 0.115 : 0.135, color: line, align: 'center', track: 0.02 })
  }
  pen.text('FSM  ·  CONTROL UNIT', 0.66, -1.78, { size: 0.15, color: soft, track: 0.04 })

  // and the picture it all ends up as: pipes whose gaps the register chose
  pen.rect(0.5, 1.75, 4.7, 2.8, { fill: 'rgba(4, 18, 22, 0.7)', stroke: line, lw: 0.035, r: 0.1 })
  let s = 0xace1
  for (let i = 0; i < 4; i++) {
    for (let n = 0; n < 5; n++) s = lfsrStep(s)
    const x = 1.5 + i * 1.02
    const gap = 2.25 + ((s & 0xff) / 255) * 1.3
    pen.rect(x, 1.87, 0.4, gap - 0.42 - 1.87, { stroke: hue, lw: 0.03, r: 0.03 })
    pen.rect(x, gap + 0.42, 0.4, 4.43 - gap - 0.42, { stroke: hue, lw: 0.03, r: 0.03 })
  }
  pen.box(1.05, 3.05, 0.2, 0.2, { fill: pal.metal, r: 0.04 })
  pen.text('VGA  640 × 480  ·  60 Hz', 0.5, 4.9, { size: 0.15, color: soft, track: 0.04 })

  port(pen, pal, V1, 'FROM L0', -1)
  port(pen, pal, V2, '', 1)
  pen.text('TO L2', V2[0], V2[1] - 0.66, { size: 0.13, color: soft, align: 'center', track: 0.04 })
  frame(pen, pal, 1, 'Logic', 'VHDL  ·  NO PROCESSOR')
}

// --- L2 · firmware -------------------------------------------------------------

// The signal crosses this floor as serial data: two UART frames, 8N1, least
// significant bit first. 0x45 then 0x4B, which is 'E' then 'K'.
const BIT = 0.36
const UART_HI = 3.0
const UART_LO = 3.75
const UART_X0 = -4.14
const frameBits = (byte: number) => [0, ...Array.from({ length: 8 }, (_, i) => (byte >> i) & 1), 1]
const UART_BITS = [1, ...frameBits(0x45), 1, ...frameBits(0x4b), 1]

const FIRMWARE_PATH: Pt[] = (() => {
  const pts: Pt[] = [V2]
  let level = 1
  UART_BITS.forEach((bit, i) => {
    if (bit === level) return
    const x = UART_X0 + i * BIT
    pts.push([x, level ? UART_HI : UART_LO], [x, bit ? UART_HI : UART_LO])
    level = bit
  })
  pts.push(V3)
  return pts
})()

function firmware(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, faint, hue, wire } = pal
  const gold = '#e8c16a'

  // --- a source file: the interrupt that turns samples into an RMS reading
  pen.rect(-5.2, -5.1, 5.7, 3.95, { fill: 'rgba(4, 16, 24, 0.72)', stroke: line, lw: 0.03, r: 0.12 })
  pen.line([[-5.2, -4.56], [0.5, -4.56]], faint, 0.022)
  for (let i = 0; i < 3; i++) pen.circle(-4.92 + i * 0.26, -4.83, 0.07, { stroke: soft, lw: 0.02 })
  pen.text('adc.c', -2.35, -4.76, { size: 0.16, color: soft, align: 'center', track: 0.03 })
  const size = 0.19
  const adv = pen.measure('0', { size })
  const code: [string, string][][] = [
    [['ISR', hue], ['(ADC_vect) {', line]],
    [['  int16_t', hue], [' s = ADC - ', line], ['512', gold], [';', line]],
    [['  sum += (', line], ['int32_t', hue], [')s * s;', line]],
    [['  if', hue], [' (++n == N) {', line]],
    [['    vrms = isqrt(sum / N);', line]],
    [['    sum = ', line], ['0', gold], ['; n = ', line], ['0', gold], [';', line]],
    [['  }', line]],
    [['}', line]],
  ]
  code.forEach((tokens, row) => {
    const y = -4.1 + row * 0.355
    pen.text(String(row + 1), -4.78, y, { size: 0.14, color: faint, align: 'right' })
    let x = -4.56
    for (const [str, color] of tokens) {
      pen.text(str, x, y, { size, color })
      x += adv * str.length
    }
  })

  // --- the registers it sets, a bit at a time
  pen.text('REGISTERS', -5.2, -0.66, { size: 0.15, color: soft, track: 0.05 })
  ;[['ADMUX', 0b01000101], ['ADCSRA', 0b11101111], ['TCCR1A', 0b10000010], ['OCR1A', 0b01011101]].forEach(([name, value], row) => {
    const y = -0.2 + row * 0.5
    pen.text(name as string, -5.2, y + 0.07, { size: 0.17, color: line })
    for (let b = 0; b < 8; b++) {
      const on = ((value as number) >> (7 - b)) & 1
      pen.box(-3.6 + b * 0.36, y, 0.25, 0.25, on ? { fill: hue, r: 0.03 } : { stroke: faint, lw: 0.022, r: 0.03 })
    }
    pen.text(`0x${(value as number).toString(16).toUpperCase().padStart(2, '0')}`, -0.56, y + 0.07, { size: 0.15, color: soft })
  })

  // --- the analog world arriving: a sine wave, and the samples taken of it
  const ax = 1.2
  const aw = 3.95
  pen.text('ADC  ·  10 BIT', ax, -4.84, { size: 0.15, color: soft, track: 0.05 })
  pen.line([[ax, -3.72], [ax + aw, -3.72]], faint, 0.02)
  const wave: Pt[] = []
  for (let i = 0; i <= 120; i++) wave.push([ax + (i / 120) * aw, -3.72 - Math.sin((i / 120) * Math.PI * 4) * 0.72])
  pen.wire(wave, wire, 0.04)
  for (let i = 0; i <= 26; i++) {
    const x = ax + (i / 26) * aw
    const y = -3.72 - Math.sin((i / 26) * Math.PI * 4) * 0.72
    pen.line([[x, -3.72], [x, y]], faint, 0.02)
    pen.circle(x, y, 0.055, { fill: line })
  }

  // --- and the digital world leaving: three servo pulses, 1, 1.5 and 2 ms
  pen.text('PWM  ·  50 Hz  ·  SERVO', ax, -2.42, { size: 0.15, color: soft, track: 0.05 })
  const pwm: Pt[] = [[ax, -1.25]]
  ;[0.32, 0.5, 0.68].forEach((duty, i) => {
    const x = ax + 0.14 + i * 1.29
    pwm.push([x, -1.25], [x, -1.95], [x + duty, -1.95], [x + duty, -1.25])
  })
  pwm.push([ax + aw, -1.25])
  pen.wire(pwm, wire, 0.04)
  ;['1.0 ms', '1.5 ms', '2.0 ms'].forEach((s, i) => pen.text(s, ax + 0.14 + i * 1.29, -0.98, { size: 0.12, color: soft }))

  // --- what it all has to fit in: an ATmega328P is 32 KB of flash, 2 KB of RAM
  ;[['FLASH', '32 KB', 0.61], ['SRAM', '2 KB', 0.44], ['EEPROM', '1 KB', 0.07]].forEach(([name, cap, used], row) => {
    const y = -0.2 + row * 0.5
    pen.text(name as string, ax, y + 0.07, { size: 0.17, color: line })
    pen.rect(ax + 1.2, y - 0.12, 1.95, 0.24, { stroke: faint, lw: 0.022, r: 0.05 })
    pen.rect(ax + 1.2, y - 0.12, 1.95 * (used as number), 0.24, { fill: hue, r: 0.05 })
    pen.text(cap as string, ax + aw, y + 0.07, { size: 0.15, color: soft, align: 'right' })
  })

  // --- the serial line itself, bit by bit
  pen.text('UART TX  ·  9600 8N1', -4.4, 2.42, { size: 0.15, color: soft, track: 0.05 })
  UART_BITS.forEach((bit, i) => {
    const x = UART_X0 + i * BIT
    pen.line([[x, 2.86], [x, 3.9]], faint, 0.016, { dash: [0.06, 0.06] })
    const inFrame = (i >= 1 && i <= 10) || (i >= 12 && i <= 21)
    const at = (i - 1) % 11
    const name = !inFrame ? '' : at === 0 ? 'S' : at === 9 ? 'P' : String(bit)
    if (name) pen.text(name, x + BIT / 2, 4.2, { size: 0.14, color: name === 'S' || name === 'P' ? hue : soft, align: 'center' })
  })
  pen.text("0x45  'E'", UART_X0 + BIT * 6, 2.72, { size: 0.15, color: line, align: 'center', track: 0.03 })
  pen.text("0x4B  'K'", UART_X0 + BIT * 17, 2.72, { size: 0.15, color: line, align: 'center', track: 0.03 })

  pen.wire(path, pal.metal, 0.07, { main: true })

  port(pen, pal, V2, '', 1)
  port(pen, pal, V3, '', -1)
  pen.text('TO L3', V3[0], V3[1] - 0.66, { size: 0.13, color: soft, align: 'center', track: 0.04 })
  frame(pen, pal, 2, 'Firmware', 'EMBEDDED C  ·  NO OS UNDERNEATH')
}

// --- L3 · robotics -------------------------------------------------------------

// A maze, and the shortest way through it. The real course maps are 15 x 19;
// this one is small enough to read at a glance. 1 is a wall.
const MAZE = [
  [0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
]
const CELL = 0.8
const MX = -4.8
const MY = -3.8
const centre = (r: number, c: number): Pt => [MX + (c + 0.5) * CELL, MY + (r + 0.5) * CELL]

// Breadth first search from the start: every cell's distance, and the route
// back from the goal by walking the parents. The same search the robot runs.
function bfs(start: [number, number], goal: [number, number]) {
  const n = MAZE.length
  const dist = MAZE.map((row) => row.map(() => -1))
  const parent = new Map<string, [number, number]>()
  const queue: [number, number][] = [start]
  dist[start[0]][start[1]] = 0
  while (queue.length) {
    const [r, c] = queue.shift()!
    for (const [dr, dc] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
      const rr = r + dr
      const cc = c + dc
      if (rr < 0 || cc < 0 || rr >= n || cc >= n || MAZE[rr][cc] || dist[rr][cc] >= 0) continue
      dist[rr][cc] = dist[r][c] + 1
      parent.set(`${rr},${cc}`, [r, c])
      queue.push([rr, cc])
    }
  }
  const cells: [number, number][] = [goal]
  while (parent.has(cells[0].join(','))) cells.unshift(parent.get(cells[0].join(','))!)
  return { dist, cells }
}

const SEARCH = bfs([7, 7], [0, 0])
const ROBOTICS_PATH: Pt[] = [V3, [centre(7, 7)[0], V3[1]], ...SEARCH.cells.map(([r, c]) => centre(r, c))]

function robotics(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, faint, hue, wire } = pal
  const n = MAZE.length

  // the maze: walls hatched, open cells numbered by how far the search had
  // to go to reach them
  pen.rect(MX, MY, n * CELL, n * CELL, { fill: 'rgba(4, 16, 26, 0.5)' })
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = MX + c * CELL
      const y = MY + r * CELL
      if (MAZE[r][c]) {
        pen.rect(x + 0.05, y + 0.05, CELL - 0.1, CELL - 0.1, { fill: 'rgba(233, 241, 238, 0.07)', stroke: soft, lw: 0.022, r: 0.06 })
        for (let h = 1; h <= 3; h++) pen.line([[x + 0.05 + h * 0.175, y + 0.08], [x + 0.08, y + 0.05 + h * 0.175]], faint, 0.018)
        for (let h = 1; h <= 2; h++) pen.line([[x + CELL - 0.08, y + 0.05 + h * 0.23], [x + 0.05 + h * 0.23, y + CELL - 0.08]], faint, 0.018)
      } else {
        const d = SEARCH.dist[r][c]
        pen.circle(x + CELL / 2, y + CELL / 2, 0.035, { fill: faint })
        if (d >= 0) pen.text(String(d), x + 0.09, y + 0.22, { size: 0.125, color: soft })
      }
    }
  }
  for (let i = 0; i <= n; i++) {
    pen.line([[MX + i * CELL, MY], [MX + i * CELL, MY + n * CELL]], faint, 0.016)
    pen.line([[MX, MY + i * CELL], [MX + n * CELL, MY + i * CELL]], faint, 0.016)
  }
  pen.rect(MX, MY, n * CELL, n * CELL, { stroke: line, lw: 0.035, r: 0.04 })
  pen.text(`BFS  ·  SHORTEST PATH  ·  ${SEARCH.cells.length - 1} STEPS`, MX, 3.06, { size: 0.15, color: line, track: 0.05 })
  pen.text('A* FINDS THE SAME ROUTE, AND EXPLORES FEWER CELLS', MX, 3.36, { size: 0.125, color: soft, track: 0.03 })
  pen.text('GOAL', centre(0, 0)[0], MY - 0.16, { size: 0.13, color: hue, align: 'center', track: 0.05 })

  // a LiDAR sweep: the room, as a ring of returns round the robot
  const [lx, ly] = [3.75, -3.3]
  pen.text('LIDAR  ·  ROS', 2.5, -4.86, { size: 0.15, color: soft, track: 0.05 })
  for (const r of [0.45, 0.9, 1.35]) pen.circle(lx, ly, r, { stroke: faint, lw: 0.018 })
  pen.line([[lx - 1.35, ly], [lx + 1.35, ly]], faint, 0.016)
  pen.line([[lx, ly - 1.35], [lx, ly + 1.35]], faint, 0.016)
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    // a room that is not quite a rectangle, with a doorway in one wall
    const wall = Math.min(1.22 / Math.max(Math.abs(Math.cos(a)), 0.01), 0.98 / Math.max(Math.abs(Math.sin(a)), 0.01))
    if (a > 5.2 && a < 5.55) continue
    const rr = Math.min(1.32, wall) * (0.97 + 0.03 * Math.sin(i * 12.9))
    pen.circle(lx + Math.cos(a) * rr, ly + Math.sin(a) * rr, 0.036, { fill: hue })
  }
  pen.wire([[lx, ly], [lx + Math.cos(-0.6) * 1.18, ly + Math.sin(-0.6) * 1.18]], wire, 0.03)
  pen.poly([[lx - 0.11, ly + 0.1], [lx + 0.15, ly], [lx - 0.11, ly - 0.1]], { fill: line })

  // a camera frame: a sign, a box round it, and five frames agreeing
  pen.text('CAMERA  ·  SVM', 2.5, -1.44, { size: 0.15, color: soft, track: 0.05 })
  pen.rect(2.5, -1.2, 2.7, 1.9, { fill: 'rgba(4, 16, 26, 0.6)', stroke: line, lw: 0.03, r: 0.08 })
  const [sx, sy] = [3.55, -0.3]
  pen.poly(Array.from({ length: 8 }, (_, i): Pt => [sx + Math.cos((i + 0.5) * Math.PI / 4) * 0.42, sy + Math.sin((i + 0.5) * Math.PI / 4) * 0.42]), { stroke: line, lw: 0.035 })
  pen.line([[sx - 0.2, sy], [sx + 0.14, sy]], line, 0.05)
  arrow(pen, [sx + 0.24, sy], [1, 0], line, 0.17)
  for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    pen.line([[sx + cx * 0.62, sy + cy * 0.4], [sx + cx * 0.62, sy + cy * 0.62], [sx + cx * 0.4, sy + cy * 0.62]], hue, 0.035)
  }
  for (let i = 0; i < 5; i++) pen.box(4.5, -0.86 + i * 0.28, 0.17, 0.17, { fill: hue, r: 0.03 })
  pen.text('5 / 5', 4.86, 0.38, { size: 0.13, color: soft, align: 'center' })
  pen.text('5 FRAME VOTE', 2.5, 0.98, { size: 0.125, color: soft, track: 0.04 })

  pen.wire(path, pal.metal, 0.075, { main: true })

  // the robot itself, seen from above: two wheels, six sensors across the nose
  const [rx, ry] = V3
  pen.box(rx + 0.12, ry, 0.94, 0.78, { fill: 'rgba(4, 16, 26, 0.92)', stroke: line, lw: 0.035, r: 0.14, cover: true })
  pen.box(rx + 0.2, ry - 0.5, 0.42, 0.14, { fill: line, r: 0.04 })
  pen.box(rx + 0.2, ry + 0.5, 0.42, 0.14, { fill: line, r: 0.04 })
  for (let i = 0; i < 6; i++) pen.box(rx - 0.44, ry - 0.3 + i * 0.12, 0.08, 0.07, { fill: hue })
  pen.circle(rx + 0.12, ry, 0.11, { fill: pal.metal })
  pen.text('2WD  ·  6 SENSORS', rx + 0.6, ry + 0.92, { size: 0.125, color: soft, align: 'right', track: 0.03 })

  port(pen, pal, V4, '', 1)
  frame(pen, pal, 3, 'Robotics', 'SENSE  ·  PLAN  ·  ACT')
}

// --- L4 · software -------------------------------------------------------------

const SOFTWARE_PATH: Pt[] = [V4, [-4.4, -0.8], [4.4, -0.8], V5]

function software(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, faint, hue, wire } = pal
  const glass = 'rgba(5, 16, 30, 0.72)'

  // a phone: the meal planner, and the tap that starts this floor's journey
  pen.rect(-5.3, -5.0, 1.8, 3.5, { fill: glass, stroke: line, lw: 0.04, r: 0.26 })
  pen.box(-4.4, -4.78, 0.5, 0.08, { fill: soft, r: 0.04 })
  pen.rect(-5.12, -4.56, 1.44, 0.74, { stroke: faint, lw: 0.022, r: 0.08 })
  pen.line([[-5.12, -3.98], [-4.72, -4.32], [-4.42, -4.1], [-4.06, -4.44], [-3.68, -4.12]], faint, 0.022)
  for (let i = 0; i < 3; i++) pen.circle(-4.56 + i * 0.16, -3.68, 0.035, { fill: i === 0 ? hue : faint })
  for (let i = 0; i < 3; i++) {
    const y = -3.4 + i * 0.52
    pen.rect(-5.12, y - 0.19, 1.44, 0.38, { stroke: i === 0 ? hue : faint, lw: i === 0 ? 0.032 : 0.022, r: 0.08 })
    pen.line([[-4.98, y - 0.04], [-4.4 - i * 0.14, y - 0.04]], soft, 0.03)
    pen.line([[-4.98, y + 0.08], [-4.62, y + 0.08]], faint, 0.022)
  }
  for (const r of [0.34, 0.5]) pen.circle(V4[0], V4[1], r, { stroke: hue, lw: 0.018, dash: [0.05, 0.07] })
  pen.text('ANDROID  ·  JAVA', -5.3, -1.22, { size: 0.125, color: soft, track: 0.04 })

  // a browser: the club's first website
  pen.rect(-2.9, -5.0, 4.0, 2.6, { fill: glass, stroke: line, lw: 0.035, r: 0.12 })
  pen.line([[-2.9, -4.52], [1.1, -4.52]], faint, 0.022)
  for (let i = 0; i < 3; i++) pen.circle(-2.64 + i * 0.22, -4.76, 0.06, { stroke: soft, lw: 0.02 })
  pen.rect(-1.86, -4.89, 2.3, 0.25, { stroke: faint, lw: 0.02, r: 0.12 })
  pen.line([[-2.64, -4.14], [-1.2, -4.14]], line, 0.06)
  pen.line([[-2.64, -3.9], [-0.56, -3.9]], faint, 0.03)
  for (let i = 0; i < 3; i++) {
    pen.rect(-2.64 + i * 1.22, -3.62, 1.04, 0.98, { stroke: faint, lw: 0.022, r: 0.08 })
    pen.circle(-2.64 + i * 1.22 + 0.24, -3.36, 0.11, { stroke: soft, lw: 0.022 })
    pen.line([[-2.5 + i * 1.22, -3.0], [-1.86 + i * 1.22, -3.0]], faint, 0.026)
    pen.line([[-2.5 + i * 1.22, -2.84], [-2.1 + i * 1.22, -2.84]], faint, 0.022)
  }
  pen.text('WEB  ·  REACT', -2.9, -2.12, { size: 0.125, color: soft, track: 0.04 })

  // a desktop app: three years of sales, and the forecast past the last one
  pen.rect(1.6, -5.0, 3.7, 2.6, { fill: glass, stroke: line, lw: 0.035, r: 0.12 })
  pen.line([[1.6, -4.52], [5.3, -4.52]], faint, 0.022)
  pen.text('forecast', 1.86, -4.69, { size: 0.14, color: soft })
  pen.line([[1.9, -4.3], [1.9, -2.72], [5.06, -2.72]], faint, 0.022)
  const hist: Pt[] = []
  for (let i = 0; i <= 26; i++) hist.push([1.98 + i * 0.076, -3.1 - i * 0.022 - Math.sin(i * 0.9) * 0.2 - Math.sin(i * 0.31) * 0.14])
  pen.wire(hist, wire, 0.04)
  const end = hist[hist.length - 1]
  pen.line([end, [end[0] + 0.5, end[1] - 0.16], [5.0, end[1] - 0.34]], hue, 0.04, { dash: [0.09, 0.08] })
  pen.poly([end, [5.0, end[1] - 0.66], [5.0, end[1] - 0.02]], { fill: 'rgba(147, 197, 253, 0.13)' })
  pen.line([[end[0], -4.3], [end[0], -2.72]], faint, 0.016, { dash: [0.05, 0.06] })
  pen.text('DESKTOP  ·  PYTHON', 1.6, -2.12, { size: 0.125, color: soft, track: 0.04 })

  // the request, the API, and the database that has the final say
  pen.wire(path, pal.metal, 0.07, { main: true })
  arrow(pen, [-2.72, -0.8], [1, 0], pal.metal, 0.16)
  pen.text('POST /bookings', -3.5, -1.02, { size: 0.15, color: line, align: 'center', track: 0.02 })
  block(pen, pal, -1.3, -0.8, 2.2, 0.86, 'EXPRESS API', 'validate  ·  begin')
  // a database, drawn the way everyone draws one
  const [dx, dy] = [1.9, -0.8]
  pen.rect(dx - 0.62, dy - 0.53, 1.24, 1.06, { fill: 'rgba(4, 18, 22, 0)', cover: true })
  pen.rect(dx - 0.62, dy - 0.36, 1.24, 0.72, { fill: 'rgba(4, 18, 22, 0.9)' })
  pen.line([[dx - 0.62, dy - 0.36], [dx - 0.62, dy + 0.36]], line, 0.03)
  pen.line([[dx + 0.62, dy - 0.36], [dx + 0.62, dy + 0.36]], line, 0.03)
  pen.ellipse(dx, dy - 0.36, 0.62, 0.17, 0, Math.PI * 2, line, 0.03)
  for (const oy of [-0.12, 0.12, 0.36]) pen.ellipse(dx, dy + oy, 0.62, 0.17, 0, Math.PI, line, 0.03)
  pen.text('POSTGRES', dx, dy + 1.0, { size: 0.14, color: soft, align: 'center', track: 0.04 })

  // the rule itself, and what it does to a booking that overlaps
  // SLOTLY's own constraint, as its schema writes it
  pen.text("EXCLUDE USING gist (resource_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)", -5.2, 0.62, { size: 0.15, color: line })
  const t0 = -3.9
  const hour = 1.42
  for (let h = 0; h <= 5; h++) {
    pen.line([[t0 + h * hour, 0.92], [t0 + h * hour, 3.2]], faint, 0.016, { dash: [0.05, 0.07] })
    pen.text(`${String(9 + h).padStart(2, '0')}:00`, t0 + h * hour, 3.46, { size: 0.125, color: soft, align: 'center' })
  }
  const bar = (row: number, from: number, to: number, kind: 'ok' | 'no') => {
    const y = 1.34 + row * 0.62
    const x = t0 + (from - 9) * hour
    const w = (to - from) * hour
    if (kind === 'ok') pen.rect(x + 0.03, y - 0.18, w - 0.06, 0.36, { fill: 'rgba(147, 197, 253, 0.2)', stroke: hue, lw: 0.03, r: 0.08 })
    else {
      pen.rect(x + 0.03, y - 0.18, w - 0.06, 0.36, { stroke: '#ff8a5c', lw: 0.03, r: 0.08, dash: [0.09, 0.07] })
      pen.text('409', x + w / 2, y + 0.06, { size: 0.15, color: '#ff8a5c', align: 'center', track: 0.03 })
    }
  }
  ;['FPGA #1', 'SCOPE #2', 'PI #3'].forEach((name, row) => pen.text(name, -5.2, 1.4 + row * 0.62, { size: 0.14, color: soft, track: 0.03 }))
  bar(0, 9, 10, 'ok'); bar(0, 10, 11.5, 'ok'); bar(0, 11, 12, 'no'); bar(0, 12.5, 14, 'ok')
  bar(1, 9.5, 11, 'ok'); bar(1, 11, 13, 'ok')
  bar(2, 9, 12, 'ok'); bar(2, 11.5, 13, 'no')
  pen.text('20 AT ONCE  →  1 × 201,  19 × 409', -5.2, 3.9, { size: 0.14, color: hue, track: 0.03 })

  port(pen, pal, V5, '', -1)
  pen.text('TO L5', V5[0], V5[1] + 0.82, { size: 0.13, color: soft, align: 'center', track: 0.04 })
  frame(pen, pal, 4, 'Software', 'APPS  ·  APIS  ·  DATABASES')
}

// --- L5 · cloud ----------------------------------------------------------------

const CLOUD_PATH: Pt[] = [V5, [-4.4, 3.0], [-4.4, 0.6], [3.4, 0.6], V6]

function cloud(pen: Pen, pal: Palette, path: Pt[]) {
  const { line, soft, faint, hue, wire } = pal

  // a cloud, in one stroke: the same mark the motto ends on
  const puff = (cx: number, cy: number, s: number, color: string, w: number) => {
    pen.line(
      Array.from({ length: 49 }, (_, i): Pt => {
        const a = (i / 48) * Math.PI * 2
        const bump = 1 + 0.16 * Math.sin(a * 5 + 0.6) + 0.1 * Math.sin(a * 3)
        return [cx + Math.cos(a) * s * 1.7 * bump, cy + Math.sin(a) * s * (a > Math.PI ? 0.7 : 0.34) * bump]
      }),
      color, w,
    )
  }
  puff(-3.2, -4.3, 0.62, faint, 0.03)
  puff(0.5, -4.55, 0.44, faint, 0.026)

  // the streaming pipeline, small and steady in the background
  pen.text('SENTIMENT PULSE  ·  STREAMING', -5.2, -2.3, { size: 0.14, color: soft, track: 0.05 })
  const stream = ['KINESIS', 'LAMBDA', 'COMPREHEND', 'DYNAMODB', 'REACT']
  stream.forEach((name, i) => {
    const x = -4.5 + i * 1.72
    if (i) pen.wire([[x - 1.72 + 0.7, -1.66], [x - 0.7, -1.66]], wire, 0.035)
    if (i) arrow(pen, [x - 0.68, -1.66], [1, 0], wire, 0.12)
    pen.box(x, -1.66, 1.36, 0.5, { fill: 'rgba(6, 18, 36, 0.8)', stroke: soft, lw: 0.025, r: 0.25 })
    pen.text(name, x, -1.6, { size: 0.125, color: line, align: 'center', track: 0.03 })
  })

  // infrastructure as code: a network drawn as the boxes Terraform describes
  pen.rect(-5.2, -4.0, 3.0, 1.2, { stroke: soft, lw: 0.025, r: 0.1, dash: [0.1, 0.08] })
  pen.text('VPC', -5.06, -3.72, { size: 0.125, color: soft, track: 0.05 })
  for (const [name, x] of [['EC2', -4.4], ['RDS', -3.0]] as [string, number][]) {
    pen.box(x, -3.3, 1.0, 0.56, { fill: 'rgba(6, 18, 36, 0.8)', stroke: line, lw: 0.028, r: 0.08 })
    pen.text(name, x, -3.23, { size: 0.15, color: line, align: 'center', track: 0.04 })
  }
  pen.wire([[-3.9, -3.3], [-3.5, -3.3]], wire, 0.035)
  pen.text('TERRAFORM  ·  validate ✓', -5.2, -2.6, { size: 0.125, color: hue, track: 0.03 })

  // a lakehouse: tables in layers, raw at the bottom, governed at the top
  for (let i = 0; i < 3; i++) {
    const y = -3.02 - i * 0.34
    pen.poly([[-1.5, y], [-0.5, y - 0.26], [0.5, y], [-0.5, y + 0.26]], { fill: 'rgba(6, 18, 36, 0.86)', stroke: i === 2 ? hue : soft, lw: 0.028 })
  }
  pen.text('DATABRICKS', 0.72, -3.52, { size: 0.15, color: line, track: 0.04 })
  pen.text('UNITY CATALOG', 0.72, -3.24, { size: 0.125, color: soft, track: 0.04 })

  // the fraud pipeline: this is the route the signal takes across the floor
  pen.wire(path, pal.metal, 0.07, { main: true })
  const node = (x: number, y: number, name: string, sub: string) => {
    pen.box(x, y, 1.64, 0.84, { fill: 'rgba(6, 18, 36, 0.9)', stroke: line, lw: 0.032, r: 0.12, cover: true })
    pen.text(name, x, y - 0.03, { size: 0.17, color: line, align: 'center', track: 0.04 })
    pen.text(sub, x, y + 0.24, { size: 0.115, color: soft, align: 'center', track: 0.02 })
  }
  node(2.2, 3.0, 'LAMBDA', 'ingest')
  node(0.0, 3.0, 'TEXTRACT', 'read the PDF')
  node(-2.2, 3.0, 'BEDROCK', 'one call, whole statement')
  node(-2.2, 0.6, 'DYNAMODB', 'every verdict')
  node(0.0, 0.6, 'SNS', 'alert')
  for (const x of [3.28, 1.1, -1.1, -3.3]) arrow(pen, [x - 0.14, 3.0], [-1, 0], pal.metal, 0.15)
  for (const x of [-3.3, -1.1, 1.1]) arrow(pen, [x + 0.14, 0.6], [1, 0], pal.metal, 0.15)
  pen.text('SPOTTERN  ·  A STATEMENT IN, A VERDICT OUT', -5.2, 1.72, { size: 0.14, color: soft, track: 0.05 })
  // the bucket the statement lands in, where this floor begins
  pen.box(V5[0], V5[1], 1.1, 0.84, { fill: 'rgba(6, 18, 36, 0.9)', stroke: line, lw: 0.032, r: 0.12, cover: true })
  pen.text('S3', V5[0], V5[1] + 0.07, { size: 0.19, color: line, align: 'center', track: 0.04 })

  // and the way out
  port(pen, pal, V6, '', -1)
  for (let i = 0; i < 3; i++) pen.line([[V6[0] - 0.16, V6[1] - 0.62 - i * 0.2], [V6[0], V6[1] - 0.78 - i * 0.2], [V6[0] + 0.16, V6[1] - 0.62 - i * 0.2]], pal.metal, 0.03)
  pen.text('200 OK', V6[0] + 0.62, V6[1] + 0.05, { size: 0.15, color: hue, track: 0.05 })
  frame(pen, pal, 5, 'Cloud', 'SERVERLESS  ·  DEFINED AS CODE')
}

// --- the stack -----------------------------------------------------------------

export const PLATES: PlateSpec[] = [
  { level: 0, name: 'Silicon', palette: palette('#0a3d37', '#5eead4', '#c2934a'), path: SILICON_PATH, draw: silicon },
  { level: 1, name: 'Logic', palette: palette('#0a3b3f', '#62e7e0'), path: LOGIC_PATH, draw: logic },
  { level: 2, name: 'Firmware', palette: palette('#0a3848', '#67e8f9'), path: FIRMWARE_PATH, draw: firmware },
  { level: 3, name: 'Robotics', palette: palette('#0b3452', '#7dd3fc'), path: ROBOTICS_PATH, draw: robotics },
  { level: 4, name: 'Software', palette: palette('#0f3160', '#93c5fd'), path: SOFTWARE_PATH, draw: software },
  { level: 5, name: 'Cloud', palette: palette('#16396f', '#bfdbfe'), path: CLOUD_PATH, draw: cloud },
]

// Draw one floor at the given texture sizes.
export function drawPlate(level: number, artRes: number, flowRes: number) {
  const spec = PLATES[level]
  const pen = new Pen(artRes, flowRes)
  spec.draw(pen, spec.palette, spec.path)
  return pen
}
