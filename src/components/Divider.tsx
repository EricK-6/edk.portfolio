// The rule between sections: a hairline that fades out at both ends, with a
// small mark set into the middle of it.
//
// It is doing the job the frosted tile edges used to do. When each section was
// its own floating pane, the pane itself said "a new thing starts here". In a
// continuous document that boundary has to be drawn, or nine sections read as
// one undifferentiated column — but it should be quiet enough that it never
// competes with the kicker sitting just below it.
export default function Divider() {
  return (
    <div className="container-page" aria-hidden="true">
      <div className="section-divider">
        {/* U+FE0E forces the text-style glyph rather than the emoji one.
            Without it, iOS/Android's colour-emoji fonts render ✳ as a green
            bitmap asterisk that ignores `text-grey-300` entirely — the mark
            stayed quiet on desktop and stood out as a stray green icon on
            phones, right where the design leans on it being the opposite. */}
        <span className="section-divider-mark">✳︎</span>
      </div>
    </div>
  )
}
