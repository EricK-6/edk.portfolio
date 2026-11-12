// Flappy Universe's random source: a 16 bit Fibonacci LFSR implementing
// x^16 + x^15 + x^13 + x^4 + 1, so the taps are bits 16, 15, 13 and 4, counted
// from the end the feedback enters at. It is maximal length: all 65,535
// non-zero states before it repeats.
//
// It lives in its own file because two things clock it: the logic floor of
// the ride draws a real state of it, and the bench runs it.
export const LFSR_TAPS = [16, 15, 13, 4]

export function lfsrStep(state: number) {
  let bit = 0
  for (const tap of LFSR_TAPS) bit ^= (state >> (16 - tap)) & 1
  return ((state >> 1) | (bit << 15)) & 0xffff
}
