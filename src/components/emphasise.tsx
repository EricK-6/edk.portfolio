import { Fragment } from 'react'

// `**like this**` in a project highlight or an experience bullet becomes the
// same emphasis About uses for the phrases that matter. Two full sentences of
// flat grey give the eye nothing to land on, and these bullets are the densest
// text on the page; the bolded runs are the ones the CV itself bolds, so the
// site and the PDF stress the same things. Kept as markers in the data rather than JSX so the strings stay
// readable straight against the CV.
export function emphasise(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-grey-900">{part}</strong>
      : <Fragment key={i}>{part}</Fragment>
  )
}
