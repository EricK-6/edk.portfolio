// The ride's clock, shared by the scene (which moves the signal and the
// camera) and the page (which fades the words in and out beside it).
//
// Time here is not seconds. It is how far the reader has scrolled, counted in
// beats, and it runs backwards when they scroll back up. Keeping the numbers
// in one file is what keeps the picture and the captions in step: a floor's
// caption arrives exactly as the signal does, because both read its arrival
// from here.
//
// No imports on purpose. The scene is a lazy chunk with three.js in it, and
// the page needs these numbers before that chunk has loaded.

export const FLOORS = 6

// The whole ride, in beats: the intro, six floors and the climb into the sky.
export const T_END = 8

// How much scrolling one beat costs, in viewport heights. This is the pace of
// the whole thing: lower and floors blur past, higher and the reader is
// scrolling through an intro they did not ask for.
export const BEAT_VH = 40

// When the signal crosses a floor: it leaves the floor's entry at `from` and
// reaches its exit at `to`. The first floor starts almost at once, so the very
// first scroll moves the signal and the reader learns what scrolling does.
export function travel(floor: number): { from: number; to: number } {
  return floor === 0 ? { from: 0.22, to: 1.62 } : { from: 1 + floor, to: 1.62 + floor }
}

// The climb between two floors runs from one floor's `to` to the next one's
// `from`. The last climb is the long one, out through the clouds.
export const SKY_FROM = travel(FLOORS - 1).to

// 0 before `a`, 1 after `b`, a straight ramp between.
export const ramp = (t: number, a: number, b: number) => (t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a))

// Slow in, slow out. The signal stops at every via, the way a lift does at
// every floor.
export const ease = (u: number) => u * u * (3 - 2 * u)

// Present between b and c, faded in over a..b and out over c..d.
export const window4 = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(t, a, b), 1 - ramp(t, c, d))

// --- what is on stage, and when ----------------------------------------------

// The name and the opening line: there on arrival, gone once the signal is
// properly under way.
export const introAt = (t: number) => 1 - ramp(t, 0.16, 0.62)

// A floor's caption comes in as the signal finishes climbing to it and leaves
// as the signal starts climbing away.
export function captionAt(t: number, floor: number) {
  if (floor === 0) return window4(t, 0.66, 0.94, 1.6, 1.84)
  const at = 1 + floor
  return window4(t, at - 0.16, at + 0.1, at + 0.6, at + 0.84)
}

// The motto, once the signal is through the clouds.
export const mottoAt = (t: number) => ramp(t, 7.18, 7.6)

// The page under the ride is paper. The stage reaches that exact colour just
// before it lets go, so the seam between the picture and the document is
// never seen.
export const paperAt = (t: number) => ramp(t, 7.05, 7.7)

// Where the reader is, as a floor number with a fraction: 2.5 is half way up
// the climb from floor 2 to floor 3. This is what the gauge draws.
export function altitude(t: number) {
  for (let i = 0; i < FLOORS; i++) {
    const { to } = travel(i)
    if (t < to) return i
    const nextFrom = i === FLOORS - 1 ? T_END : travel(i + 1).from
    if (t < nextFrom) return i + ease(ramp(t, to, nextFrom))
  }
  return FLOORS
}

// The beat at which a floor is best seen: its caption fully in, the signal a
// little way across. This is where the gauge sends the reader.
export const floorBeat = (floor: number) => (floor === 0 ? 1.08 : 1 + floor + 0.26)
