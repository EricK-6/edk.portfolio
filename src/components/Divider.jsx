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
        <span className="section-divider-mark">✳</span>
      </div>
    </div>
  )
}
