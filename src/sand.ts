// One word turning into another, as sand.
//
// The two words are lined up on the letters they share ("EB" in KEB and WEB3).
// Those letters are drawn once and never move. Everything else is sand, and
// the change is a wipe: an upright edge crosses the word from left to right.
// The letters only the first word has crumble as it passes, the grains blow
// along the line of type, and the letters only the second word has fill in
// behind a second pass of the same edge, left to right again.
//
// Nothing here is simulated. Where a grain is depends only on how far through
// the change the word is (`p`, 0 to 1), so a frame can be drawn for any `p` in
// any order. That is what lets a change be turned round halfway: run `p` back
// down and every grain retraces its path.
//
// The letters themselves stay real type the whole way. A grain is one CSS
// pixel of a letter; until it leaves, and once it lands, that pixel is shown
// by drawing the actual glyph through a mask of the pixels that are home. So
// the word is sharp at both ends and there is no frame where type is swapped
// for dots.

export interface SandOptions {
  // font size in CSS pixels
  size: number
  weight: number
  family: string
  // the colour of the type, and of most grains
  ink: string
  // the colours the rest of the grains take while they are in the air
  tints: string[]
}

// Room for the grains to fly, in ems: above the capitals, below the baseline,
// and either side. CAP is Inter's cap height, which is what the canvas is
// sized by before the font has loaded and the real one can be measured.
const HEAD = 0.66
const CAP = 0.727
const FOOT = 0.2
const SIDE = 0.24

// A pixel counts as part of a letter from this much coverage (of 255). The
// faint fringe below it is antialiasing, not ink.
const INKED = 24

// The share of the change spent letting go, and how long one grain is in the
// air. They add up to 1: the last grain to leave lands as the change ends.
const LETTING_GO = 0.42
const AIRBORNE = 0.58

export function sandHeight(size: number) {
  return Math.round((HEAD + CAP + FOOT) * size)
}

// How far in from the canvas edge the word starts, so whatever holds the
// canvas can pull it back by as much and line the type up with its column.
export function sandInset(size: number) {
  return Math.round(SIDE * size)
}

// the longest run of letters both words have
function shared(a: string, b: string) {
  let best = { at: 0, bt: 0, len: 0 }
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let n = 0
      while (i + n < a.length && j + n < b.length && a[i + n] === b[j + n]) n++
      if (n > best.len) best = { at: i, bt: j, len: n }
    }
  }
  return best
}

// a small seeded generator, so the grains fall the same way on every visit
function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Word {
  // the letters before and after the shared run
  lead: string
  tail: string
  // the pixels of those letters, as x, y pairs
  cells: Float32Array
}

// One direction of the change, every grain's whole journey worked out ahead.
interface Flight {
  n: number
  // where it leaves, where it lands
  sx: Float32Array; sy: Float32Array
  dx: Float32Array; dy: Float32Array
  // when it lets go and how long it flies, as shares of the change
  at: Float32Array; air: Float32Array
  // how high it is thrown, how far it drifts, how much it wobbles and where
  // in the wobble it starts
  lift: Float32Array; drift: Float32Array; wob: Float32Array; phase: Float32Array
  big: Uint8Array
  tint: Uint8Array
}

export class SandWord {
  readonly width: number
  readonly height: number
  private g: CanvasRenderingContext2D
  // the scratch canvas the masked letters are drawn on
  private m: CanvasRenderingContext2D
  private mask: HTMLCanvasElement
  private font: string
  private mid: string
  // the x the shared letters start at, the x they end at, and the baseline
  private x0: number
  private x1: number
  private base: number
  private words: [Word, Word]
  private flights: [Flight, Flight]
  private o: SandOptions

  constructor(canvas: HTMLCanvasElement, pair: [string, string], o: SandOptions) {
    this.o = o
    const { size } = o
    this.font = `${o.weight} ${size}px ${o.family}`
    const g = canvas.getContext('2d')!
    this.g = g
    g.font = this.font

    const run = shared(pair[0], pair[1])
    this.mid = pair[0].slice(run.at, run.at + run.len)
    const split = (w: string, at: number) => ({ lead: w.slice(0, at), tail: w.slice(at + run.len) })
    const parts = [split(pair[0], run.at), split(pair[1], run.bt)]
    const wide = (s: string) => g.measureText(s).width

    const side = sandInset(size)
    this.x0 = side + Math.ceil(Math.max(wide(parts[0].lead), wide(parts[1].lead)))
    this.x1 = this.x0 + wide(this.mid)
    this.base = Math.round((HEAD + CAP) * size)
    this.width = Math.ceil(this.x1 + Math.max(wide(parts[0].tail), wide(parts[1].tail))) + side
    this.height = sandHeight(size)

    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    this.mask = document.createElement('canvas')
    for (const c of [canvas, this.mask]) {
      c.width = Math.round(this.width * dpr)
      c.height = Math.round(this.height * dpr)
    }
    canvas.style.width = `${this.width}px`
    canvas.style.height = `${this.height}px`
    this.m = this.mask.getContext('2d')!
    for (const c of [g, this.m]) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      c.font = this.font
      c.textBaseline = 'alphabetic'
    }

    this.words = [this.read(parts[0]), this.read(parts[1])]
    this.flights = [
      this.plan(this.words[0], this.words[1], 11),
      this.plan(this.words[1], this.words[0], 29),
    ]
  }

  // a word's own letters, either side of the shared run
  private letters(c: CanvasRenderingContext2D, w: { lead: string; tail: string }) {
    c.textAlign = 'right'
    c.fillText(w.lead, this.x0, this.base)
    c.textAlign = 'left'
    c.fillText(w.tail, this.x1, this.base)
  }

  // Which pixels a word's own letters cover, read off a drawing of them at
  // one canvas pixel to the CSS pixel.
  private read(w: { lead: string; tail: string }): Word {
    const c = document.createElement('canvas')
    c.width = this.width
    c.height = this.height
    const x = c.getContext('2d', { willReadFrequently: true })!
    x.font = this.font
    x.textBaseline = 'alphabetic'
    this.letters(x, w)
    const { data } = x.getImageData(0, 0, c.width, c.height)
    const cells: number[] = []
    for (let y = 0; y < c.height; y++) {
      for (let px = 0; px < c.width; px++) {
        if (data[(y * c.width + px) * 4 + 3] >= INKED) cells.push(px, y)
      }
    }
    return { ...w, cells: Float32Array.from(cells) }
  }

  // Pair every pixel that leaves with one that arrives. Both go by how far
  // left they are, so the edge of the change stands upright and each grain is
  // in the air about as long as any other. Whichever
  // side has fewer pixels is shared out: a K has less ink in it than a W and
  // a 3, so most of its pixels send off two or three grains.
  private plan(from: Word, to: Word, seed: number): Flight {
    const rnd = seeded(seed)
    const { size } = this.o
    const order = (cells: Float32Array, key: (x: number, y: number) => number) => {
      const count = cells.length / 2
      const keys = new Float32Array(count)
      for (let i = 0; i < count; i++) keys[i] = key(cells[i * 2], cells[i * 2 + 1])
      return Array.from({ length: count }, (_, i) => i).sort((a, b) => keys[a] - keys[b])
    }
    // leaving and landing: leftmost first, with a ragged edge
    const out = order(from.cells, (x) => x / this.width + 0.05 * rnd())
    const home = order(to.cells, (x) => x / this.width + 0.04 * rnd())

    const n = out.length && home.length ? Math.max(out.length, home.length) : 0
    const f: Flight = {
      n,
      sx: new Float32Array(n), sy: new Float32Array(n),
      dx: new Float32Array(n), dy: new Float32Array(n),
      at: new Float32Array(n), air: new Float32Array(n),
      lift: new Float32Array(n), drift: new Float32Array(n),
      wob: new Float32Array(n), phase: new Float32Array(n),
      big: new Uint8Array(n), tint: new Uint8Array(n),
    }
    for (let j = 0; j < n; j++) {
      const s = out[Math.floor((j * out.length) / n)]
      const d = home[Math.floor((j * home.length) / n)]
      const sx = from.cells[s * 2], sy = from.cells[s * 2 + 1]
      const dx = to.cells[d * 2], dy = to.cells[d * 2 + 1]
      f.sx[j] = sx; f.sy[j] = sy; f.dx[j] = dx; f.dy[j] = dy
      f.air[j] = AIRBORNE * (0.86 + 0.14 * rnd())
      f.at[j] = Math.min(LETTING_GO * (j / n), 1 - f.air[j])
      // No throw: a grain scatters a little above or below its line and is
      // blown ahead, the way the edge is moving.
      f.lift[j] = size * 0.3 * (rnd() - 0.5)
      f.drift[j] = size * 0.22 * rnd()
      f.wob[j] = size * (0.015 + 0.05 * rnd())
      f.phase[j] = rnd() * Math.PI * 2
      f.big[j] = rnd() < 0.14 ? 1 : 0
      // most grains keep the ink; the rest take a tint while they fly
      f.tint[j] = rnd() < 0.5 || !this.o.tints.length ? 0 : 1 + Math.floor(rnd() * this.o.tints.length)
    }
    return f
  }

  // A word's letters, but only the pixels the mask lets through: `home` says
  // whether grain j is on its pixel, and `cells` which pixel that is.
  private masked(w: Word, f: Flight, xs: Float32Array, ys: Float32Array, home: (j: number) => boolean) {
    const m = this.m
    m.globalCompositeOperation = 'source-over'
    m.clearRect(0, 0, this.width, this.height)
    m.fillStyle = this.o.ink
    this.letters(m, w)
    // Keep the type only where a pixel is home. One path and one fill: every
    // fill under this mode wipes what it does not cover, so pixel by pixel
    // each would erase the last. A quarter pixel over on every side, so the
    // antialiased fringe of the letter comes through with its pixel.
    m.globalCompositeOperation = 'destination-in'
    m.beginPath()
    let any = false
    for (let j = 0; j < f.n; j++) {
      if (!home(j)) continue
      any = true
      m.rect(xs[j] - 0.25, ys[j] - 0.25, 1.5, 1.5)
    }
    // an empty path fills nothing, which would leave the whole word showing
    if (!any) return
    m.fill()
    this.g.drawImage(this.mask, 0, 0, this.width, this.height)
  }

  // Draw the change from word `from` to the other one, `p` of the way through.
  render(from: 0 | 1, p: number) {
    const g = this.g
    const to = (1 - from) as 0 | 1
    g.clearRect(0, 0, this.width, this.height)
    g.fillStyle = this.o.ink
    g.textAlign = 'left'
    g.fillText(this.mid, this.x0, this.base)

    const f = this.flights[from]
    // at rest, or two words with nothing to turn to sand: plain type
    if (p <= 0 || p >= 1 || !f.n) {
      this.letters(g, this.words[p >= (f.n ? 1 : 0.5) ? to : from])
      return
    }

    this.masked(this.words[from], f, f.sx, f.sy, (j) => p <= f.at[j])
    this.masked(this.words[to], f, f.dx, f.dy, (j) => p >= f.at[j] + f.air[j])

    const colours = [this.o.ink, ...this.o.tints]
    for (let c = 0; c < colours.length; c++) {
      g.fillStyle = colours[c]
      for (let j = 0; j < f.n; j++) {
        if (f.tint[j] !== c) continue
        const u = (p - f.at[j]) / f.air[j]
        if (u <= 0 || u >= 1) continue
        // `arc` is 0 at both ends and 1 mid-flight, so the scatter comes and goes
        const arc = Math.sin(Math.PI * u)
        const ease = u * u * (3 - 2 * u)
        const turn = f.phase[j] + u * 9
        const x = f.sx[j] + (f.dx[j] - f.sx[j]) * ease + arc * (f.drift[j] + f.wob[j] * Math.sin(turn))
        const y = f.sy[j] + (f.dy[j] - f.sy[j]) * u - arc * f.lift[j] + arc * f.wob[j] * Math.cos(turn * 0.8)
        const r = f.big[j] ? 1.7 : 1.1
        g.fillRect(x, y, r, r)
      }
    }
  }
}
