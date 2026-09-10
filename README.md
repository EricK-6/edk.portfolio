# Personal Portfolio

Hey, I'm **Dohyun (Eric) Kim**, a Computer Systems Engineering (Hons) student at the University of Auckland. This is the personal site I built to show what I've worked on and to point recruiters at while I'm hunting for internships.

🔗 **Live at [erickk.cloud](https://erickk.cloud/)**

It's one page that scrolls, top to bottom, and I've deliberately kept it that way:

- **A full-bleed intro** — one photograph from Queenstown, my name on it, and the line about what I build. It's the only place on the site type sits on a picture.
- **Everything below is paper** — a flat off-white document, a narrow reading measure, hairline rules between sections, and a numbered contents index in the header that tracks where you are.
- **Command palette** (`Cmd`/`Ctrl + K`) and a small terminal dock for the keyboard people.
- **The page never fights the scroll.** There's no wheel hijacking, no snap, nothing that moves once it's arrived — the animation is all entrance. That's on purpose: an earlier version made each section its own route and reinterpreted the wheel as travel between them, which cost the scrollbar, `Cmd+F`, and a sane Back button.

---

## Built with

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Hosted on **GitHub Pages**, deployed automatically with GitHub Actions

There's no backend — all the content lives right in the components, and the contact form runs through [Formspree](https://formspree.io/).

## Running it locally

```bash
npm install      # first time only
npm run dev      # start the dev server
```

Then open http://localhost:5173.

## Building for production

```bash
npm run build    # outputs the static site into dist/
npm run preview  # serve that build locally to double-check it
```

## Deploying

I let GitHub handle this. Every time I push to `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the build and publishes `dist/` to the `gh-pages` branch, so the live site updates on its own — no manual step.

If I ever need to push a build by hand:

```bash
npm run deploy
```

> **On `base`:** `vite.config.js` uses `base: './'` so the build works wherever it's served from. I'd only touch this if I moved it to a repo subpath like `erick-6.github.io/personal-website/`.

## How it's laid out

```
├── .github/workflows/deploy.yml   # auto-deploy on push to main
├── scripts/make-og.mjs            # regenerates public/og-image.png (see its header)
├── public/
│   ├── CV_SWE.pdf                 # the two CVs the intro links to
│   ├── CV_EEE.pdf
│   ├── qt.jpg                     # the intro photograph (+ qt-sm.jpg for small screens)
│   └── og-image.png
├── src/
│   ├── App.jsx                    # the document: every section, in reading order
│   ├── main.jsx
│   ├── router.js                  # anchors + the scrollspy the contents index uses
│   ├── sitemap.js                 # the sections and their labels, in one place
│   ├── useOnScreen.js             # pauses the project demo clips when off screen
│   ├── index.css                  # Tailwind + my shared component classes
│   └── components/
│       ├── Navbar.jsx             # masthead + numbered contents index
│       ├── Hero.jsx               # the full-bleed photo intro
│       ├── Divider.jsx            # the rule between sections
│       ├── About.jsx
│       ├── Projects.jsx           # project explorer (list + detail card)
│       ├── Experience.jsx
│       ├── Skills.jsx
│       ├── Education.jsx
│       ├── Certifications.jsx     # cert cards that link out to Credly
│       ├── Leadership.jsx
│       ├── Contact.jsx            # Formspree contact form
│       ├── Footer.jsx
│       ├── CommandPalette.jsx     # Cmd/Ctrl + K
│       ├── TerminalDock.jsx        # the drawer for the keyboard people
│       ├── Cursor.jsx             # the dot-and-ring cursor (fine pointers only)
│       ├── Section.jsx            # shared section wrapper
│       └── Reveal.jsx             # scroll-into-view animation
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Editing the content

I kept this dead simple — every section stores its data in a constant at the top of its own file. Open the file, edit the array, save.

- **Projects** → `src/components/Projects.jsx` (`PROJECTS`)
- **Experience** → `src/components/Experience.jsx`
- **Skills** → `src/components/Skills.jsx`
- **Certifications** → `src/components/Certifications.jsx`
- **Leadership** → `src/components/Leadership.jsx`

For real project screenshots, I drop an image into `public/` and swap the placeholder in `Projects.jsx` for an `<img>`.

## Updating my CV

Both CVs (`CV_SWE.pdf` and `CV_EEE.pdf`) live in `public/` and are committed to the repo — the RÉSUMÉ control in the intro links straight to them. To update one, just replace the PDF in `public/` and push.

## A few notes to self

- The palette is locked light — there's no theme toggle. (`dark:` classes are still in the markup, but nothing ever puts `dark` on `<html>`; they were left in so the decision stays reversible.)
- Anchor offsets are `scroll-padding-top` on `<html>`, in one place. Don't also add `scroll-mt` to sections — they add up.
- The contact form posts to Formspree (set by `FORMSPREE_ENDPOINT` in `Contact.jsx`), with a plain `mailto:` fallback underneath it.
- `public/CV_SWE.pdf` is public once the site is deployed — if I don't want my phone number scraped, I can keep a redacted PDF in `public/` and the full one to myself.
