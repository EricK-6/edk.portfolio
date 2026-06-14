# Personal Portfolio

Hey, I'm **Dohyun (Eric) Kim**, a Computer Systems Engineering (Hons) student at the University of Auckland. This is the personal site I built to show what I've worked on and to point recruiters at while I'm hunting for internships.

🔗 **Live at [erickk.cloud](https://erickk.cloud/)**

It's a single-page site, but I didn't want it to feel like a CV crammed into a webpage, so I had some fun with it:

- **Two ways to get around** — normal scrolling, or a "box mode" where each section is its own screen you move through with the arrow keys or the mouse wheel.
- **A "type my name" hero** — start typing and my name reveals letter by letter.
- **Command palette** (`Cmd`/`Ctrl + K`) and a small terminal dock for the keyboard people.
- **Dark / light themes**, remembered between visits.

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
├── CV.pdf                         # my CV — copy-cv.mjs copies this into public/
├── .github/workflows/deploy.yml   # auto-deploy on push to main
├── scripts/copy-cv.mjs            # copies CV.pdf → public/ before dev & build
├── public/
│   ├── CV.pdf                     # what the "Download CV" button grabs
│   └── favicon.svg
├── src/
│   ├── App.jsx                    # theme + layout (scroll vs box mode)
│   ├── main.jsx
│   ├── index.css                  # Tailwind + my shared component classes
│   └── components/
│       ├── Navbar.jsx
│       ├── Hero.jsx               # bento grid + the type-my-name bit
│       ├── About.jsx
│       ├── Projects.jsx           # 3D coverflow carousel
│       ├── Experience.jsx
│       ├── Skills.jsx
│       ├── Education.jsx
│       ├── Certifications.jsx     # cert cards that link out to Credly
│       ├── Leadership.jsx
│       ├── Contact.jsx            # Formspree contact form
│       ├── Footer.jsx
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

I keep `CV.pdf` at the project root — the `copy-cv` script copies it into `public/` automatically whenever I run dev or build, and the Download CV button just points at `/CV.pdf`. So I only swap that one file.

## A few notes to self

- Dark mode follows the system on first load, then remembers whatever I last picked.
- The contact form posts to Formspree (set by `FORMSPREE_ENDPOINT` in `Contact.jsx`), with a plain `mailto:` fallback underneath it.
- `public/CV.pdf` is public once the site is deployed — if I don't want my phone number scraped, I can keep a redacted PDF in `public/` and the full one to myself.
