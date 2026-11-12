// A pen that draws a floor's artwork, in the floor's own units.
//
// Every floor is a 12 x 12 plate with the origin in the middle: x runs left to
// right, y runs from the far edge (-6) to the near edge (+6), the way the
// camera sees it. The pen draws onto two canvases at once and the scene turns
// both into textures:
//
//   art   what you see: the lines, pads and lettering, in colour
//   flow  what moves: for every wire, how far along it each pixel is
//
// The second one is what makes the board look powered. A shader cannot ask
// "where along this trace am I?", so the answer is painted in ahead of time:
// red is the distance along the wire, green is a per-wire offset so the wires
// do not pulse in unison, and blue marks the one wire the reader's scroll
// drives, as its own 0 to 1. The plate shader reads those back and lights the
// pixels a pulse has reached.

export type Pt = [number, number]

export const PLATE = 12
// The longest a wire's red channel can count to before it saturates. Longer
// than any wire drawn, so no pulse ever meets a seam.
export const FLOW_REACH = 24
// Lettering below this size (in plate units) comes out at a few pixels on
// screen: texture, not text. It is left off, so a floor is one clear drawing
// with a handful of words on it rather than a page of fine print.
const SMALLEST_TYPE = 0.16

const FONTS = {
  mono: '"JetBrains Mono", ui-monospace, monospace',
  serif: '"Fraunces Variable", Fraunces, Georgia, serif',
  sans: 'Inter, system-ui, sans-serif',
}

interface TextOpts {
  size?: number
  color?: string
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  weight?: number
  font?: keyof typeof FONTS
  // radians, clockwise as drawn
  rot?: number
  // extra space between letters, in plate units
  track?: number
}

interface ShapeOpts {
  fill?: string
  stroke?: string
  lw?: number
  r?: number
  dash?: number[]
  // the shape sits on top of the wiring: no pulse shows through it, so a
  // signal goes dark behind a box and comes out the other side
  cover?: boolean
}

export class Pen {
  readonly art: HTMLCanvasElement
  readonly flow: HTMLCanvasElement
  private a: CanvasRenderingContext2D
  private f: CanvasRenderingContext2D
  private scale: number
  // each wire takes the next value from a fixed sequence, so the pattern of
  // pulses is the same on every visit and never clumps
  private wires = 0

  constructor(artRes: number, flowRes: number) {
    this.art = document.createElement('canvas')
    this.art.width = this.art.height = artRes
    this.flow = document.createElement('canvas')
    this.flow.width = this.flow.height = flowRes
    this.a = this.art.getContext('2d')!
    this.f = this.flow.getContext('2d')!
    this.scale = artRes / PLATE
    this.a.setTransform(this.scale, 0, 0, this.scale, artRes / 2, artRes / 2)
    const fs = flowRes / PLATE
    this.f.setTransform(fs, 0, 0, fs, flowRes / 2, flowRes / 2)
    this.a.lineJoin = this.a.lineCap = 'round'
    this.f.lineJoin = this.f.lineCap = 'round'
  }

  // --- lines -------------------------------------------------------------------

  line(pts: Pt[], color: string, w = 0.028, o: { closed?: boolean; dash?: number[]; cap?: CanvasLineCap } = {}) {
    const a = this.a
    a.save()
    a.strokeStyle = color
    a.lineWidth = w
    if (o.cap) a.lineCap = o.cap
    if (o.dash) a.setLineDash(o.dash)
    a.beginPath()
    pts.forEach(([x, y], i) => (i ? a.lineTo(x, y) : a.moveTo(x, y)))
    if (o.closed) a.closePath()
    a.stroke()
    a.restore()
  }

  // A line that carries a signal. `main` is the one wire the scroll drives:
  // draw it last, or a later wire crossing it would paint over its marker.
  wire(pts: Pt[], color: string, w = 0.05, o: { main?: boolean; quiet?: boolean } = {}) {
    this.line(pts, color, w)
    if (o.quiet) return

    const f = this.f
    let total = 0
    for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (total < 1e-6) return
    // the golden ratio's fractional part: consecutive wires land far apart
    const phase = ((++this.wires * 0.6180339887) % 1) * 255
    const step = o.main ? 0.045 : 0.11
    f.lineWidth = Math.max(w * 2.6, 0.17)

    let done = 0
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const len = Math.hypot(x1 - x0, y1 - y0)
      const n = Math.max(1, Math.ceil(len / step))
      for (let k = 0; k < n; k++) {
        const u0 = k / n
        const u1 = (k + 1) / n
        const s = done + len * (u0 + u1) * 0.5
        const r = Math.round(Math.min(1, s / FLOW_REACH) * 255)
        // 0 in blue means "not the main wire", so the main wire counts from 1
        const b = o.main ? Math.round(1 + (s / total) * 254) : 0
        f.strokeStyle = `rgb(${r},${Math.round(phase)},${b})`
        f.beginPath()
        f.moveTo(x0 + (x1 - x0) * u0, y0 + (y1 - y0) * u0)
        f.lineTo(x0 + (x1 - x0) * u1, y0 + (y1 - y0) * u1)
        f.stroke()
      }
      done += len
    }
  }

  // --- shapes ------------------------------------------------------------------

  private paint(o: ShapeOpts) {
    const a = this.a
    if (o.fill) { a.fillStyle = o.fill; a.fill() }
    if (o.stroke) {
      a.save()
      a.strokeStyle = o.stroke
      a.lineWidth = o.lw ?? 0.028
      if (o.dash) a.setLineDash(o.dash)
      a.stroke()
      a.restore()
    }
  }

  // x, y is the top left corner
  rect(x: number, y: number, w: number, h: number, o: ShapeOpts = {}) {
    const a = this.a
    if (o.cover) this.f.clearRect(x, y, w, h)
    a.beginPath()
    if (o.r) a.roundRect(x, y, w, h, o.r)
    else a.rect(x, y, w, h)
    this.paint(o)
  }

  // the same, placed by its centre
  box(cx: number, cy: number, w: number, h: number, o: ShapeOpts = {}) {
    this.rect(cx - w / 2, cy - h / 2, w, h, o)
  }

  circle(x: number, y: number, r: number, o: ShapeOpts = {}) {
    this.a.beginPath()
    this.a.arc(x, y, r, 0, Math.PI * 2)
    this.paint(o)
  }

  arc(x: number, y: number, r: number, from: number, to: number, color: string, w = 0.028) {
    const a = this.a
    a.save()
    a.strokeStyle = color
    a.lineWidth = w
    a.beginPath()
    a.arc(x, y, r, from, to)
    a.stroke()
    a.restore()
  }

  // part of an ellipse: a full turn is a lid, half a turn is the front of a drum
  ellipse(x: number, y: number, rx: number, ry: number, from: number, to: number, color: string, w = 0.028) {
    const a = this.a
    a.save()
    a.strokeStyle = color
    a.lineWidth = w
    a.beginPath()
    a.ellipse(x, y, rx, ry, 0, from, to)
    a.stroke()
    a.restore()
  }

  poly(pts: Pt[], o: ShapeOpts = {}) {
    const a = this.a
    a.beginPath()
    pts.forEach(([x, y], i) => (i ? a.lineTo(x, y) : a.moveTo(x, y)))
    a.closePath()
    this.paint(o)
  }

  // A plated hole: a ring of metal round a drill.
  via(x: number, y: number, r = 0.11, metal = '#c99a45') {
    this.circle(x, y, r, { fill: metal })
    this.circle(x, y, r * 0.45, { fill: 'rgba(3, 14, 14, 0.9)' })
  }

  // --- lettering ---------------------------------------------------------------

  // Set in pixels with the transform lifted: a font size of 0.2 "pixels" under
  // a scale is not something every browser will rasterise cleanly.
  text(str: string, x: number, y: number, o: TextOpts = {}) {
    if ((o.size ?? 0.2) < SMALLEST_TYPE) return
    const a = this.a
    const px = (o.size ?? 0.2) * this.scale
    a.save()
    a.setTransform(1, 0, 0, 1, 0, 0)
    a.translate(this.art.width / 2 + x * this.scale, this.art.height / 2 + y * this.scale)
    if (o.rot) a.rotate(o.rot)
    a.font = `${o.weight ?? 500} ${px}px ${FONTS[o.font ?? 'mono']}`
    a.fillStyle = o.color ?? '#e6efe9'
    a.textAlign = o.align ?? 'left'
    a.textBaseline = o.baseline ?? 'alphabetic'
    // not every browser has canvas letter spacing yet; without it the label is
    // simply set tighter
    if (o.track) (a as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${o.track * this.scale}px`
    a.fillText(str, 0, 0)
    a.restore()
  }

  // how wide a label will set, in plate units
  measure(str: string, o: TextOpts = {}) {
    const a = this.a
    a.save()
    a.font = `${o.weight ?? 500} ${(o.size ?? 0.2) * this.scale}px ${FONTS[o.font ?? 'mono']}`
    const w = a.measureText(str).width / this.scale
    a.restore()
    return w + (o.track ?? 0) * str.length
  }
}

// --- routing -------------------------------------------------------------------

// A trace the way a board is routed: straight out of the pad, one 45 degree
// run, then straight in. `out` is the direction it leaves in and `first` is
// how far it goes before turning.
export function route(from: Pt, out: Pt, to: Pt, first: number): Pt[] {
  const p1: Pt = [from[0] + out[0] * first, from[1] + out[1] * first]
  const dx = to[0] - p1[0]
  const dy = to[1] - p1[1]
  const d = Math.min(Math.abs(dx), Math.abs(dy))
  const p2: Pt = [p1[0] + Math.sign(dx) * d, p1[1] + Math.sign(dy) * d]
  const pts: Pt[] = [from, p1]
  if (d > 1e-6) pts.push(p2)
  if (Math.hypot(to[0] - p2[0], to[1] - p2[1]) > 1e-6) pts.push(to)
  return pts
}

// The same, but arriving square on: straight out, one 45 degree run, then a
// final straight of length `last` across the way it set out. A row of these
// with the same `last` nests into the fan a bus makes between a chip and a
// connector.
export function fan(from: Pt, out: Pt, to: Pt, last: number): Pt[] {
  const flat = out[0] !== 0
  const along = Math.abs(flat ? to[0] - from[0] : to[1] - from[1])
  const across = Math.abs(flat ? to[1] - from[1] : to[0] - from[0])
  const diag = Math.max(0, across - last)
  const first = along - diag
  const sx = Math.sign(to[0] - from[0])
  const sy = Math.sign(to[1] - from[1])
  const p1: Pt = flat ? [from[0] + sx * first, from[1]] : [from[0], from[1] + sy * first]
  const p2: Pt = [p1[0] + sx * diag, p1[1] + sy * diag]
  return [from, p1, p2, to]
}

// A length-matching meander on a horizontal run from x0 to x1: `turns` loops
// of height `h`, the kind a designer adds so two signals arrive together.
// Every corner is clipped at 45 degrees, as a board house would want.
export function meander(x0: number, x1: number, y: number, turns: number, h: number): Pt[] {
  const pts: Pt[] = []
  const pitch = (x1 - x0) / (turns * 2)
  const c = Math.min(Math.abs(pitch), Math.abs(h)) * 0.3
  const sx = Math.sign(pitch)
  const sy = Math.sign(h)
  for (let i = 0; i < turns; i++) {
    const a = x0 + pitch * (i * 2)
    const b = a + pitch
    pts.push(
      [a - sx * c, y], [a, y + sy * c],
      [a, y + h - sy * c], [a + sx * c, y + h],
      [b - sx * c, y + h], [b, y + h - sy * c],
      [b, y + sy * c], [b + sx * c, y],
    )
  }
  pts.push([x1, y])
  return pts
}

// The length of a polyline and the point a given distance along it.
export function lengthOf(pts: Pt[]) {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return total
}

export function pointAt(pts: Pt[], dist: number): Pt {
  let left = Math.max(0, dist)
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (left <= len || i === pts.length - 1) {
      const u = len > 0 ? Math.min(1, left / len) : 0
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]
    }
    left -= len
  }
  return pts[pts.length - 1]
}
