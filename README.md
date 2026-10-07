# Personal Portfolio

Hey, I'm **Dohyun (Eric) Kim**, a Computer Systems Engineering (Hons) student at the University of Auckland. This is the personal site I built to show what I've worked on and to share my CV and projects.

🔗 **Live at [erickk.cloud](https://erickk.cloud/)**

It's one page that scrolls, top to bottom, and I've deliberately kept it that way:

- **A full-bleed intro** — one photograph from Queenstown, my name on it, and the line about what I build. It's the only place on the site type sits on a picture.
- **Everything below is paper** — a flat off-white document, a narrow reading measure, hairline rules between sections, and a numbered contents index in the header that tracks where you are.
- **Command palette** (`Cmd`/`Ctrl + K`) and a **terminal** (`Ctrl + \``) that browses the page as a filesystem: `ls`, `cd` (the page scrolls with you), `cat`, `grep`, pipes, `open spottern` (opens its build log), `./spottern` (a replay of the pipeline), and `ask` for plain questions. Every name it prints is clickable, so you don't need to know a single command.
- **The page never fights the scroll.** There's no wheel hijacking, no snap, nothing that moves once it's arrived — the animation is all entrance. That's on purpose: an earlier version made each section its own route and reinterpreted the wheel as travel between them, which cost the scrollbar, `Cmd+F`, and a sane Back button.

---

## Built with

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- Hosted on **GitHub Pages**, deployed automatically with GitHub Actions

There's no backend — all the content lives in one file, `src/content.ts`, and the contact form runs through [Formspree](https://formspree.io/).

## Running it locally

```bash
npm install      # first time only
npm run dev      # start the dev server
```

Then open http://localhost:5173.

## Building for production

```bash
npm run build      # type-checks (tsc --noEmit), then outputs the static site into dist/
npm run preview    # serve that build locally to double-check it
npm run typecheck  # tsc --noEmit on its own
npm run lint       # eslint .
```

## Deploying

I let GitHub handle this. Every time I push to `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the build and publishes `dist/` to the `gh-pages` branch, so the live site updates on its own — no manual step.

If I ever need to push a build by hand:

```bash
npm run deploy
```

> **On `base`:** `vite.config.ts` uses `base: './'` so the build works wherever it's served from. I'd only touch this if I moved it to a repo subpath like `erick-6.github.io/personal-website/`.

## How it's laid out

```
├── .github/workflows/deploy.yml   # auto-deploy on push to main
├── scripts/make-og.mjs            # regenerates public/og-image.jpg (see its header)
├── public/
│   ├── 404.html                   # also catches guessed URLs: /cv, /projects, /spottern …
│   ├── CV_SWE.pdf                 # the two CVs the navbar links to
│   ├── CV_EEE.pdf
│   ├── qt.jpg / qt.webp           # the intro photograph, WebP with a JPEG fallback (+ qt-sm.* for small screens)
│   └── og-image.jpg
├── src/
│   ├── App.tsx                    # the document: every section, in reading order
│   ├── content.ts                 # every word and link the site shows (see below)
│   ├── analytics.ts               # GoatCounter click events (data-track="…")
│   ├── shell/                     # the terminal's brain: a filesystem built from content.ts, commands, replays
│   ├── main.tsx
│   ├── router.ts                  # anchors + the scrollspy the contents index uses
│   ├── sitemap.ts                 # the sections and their labels, in one place
│   ├── useOnScreen.ts             # pauses the project demo clips when off screen
│   ├── index.css                  # Tailwind + my shared component classes
│   └── components/
│       ├── Navbar.tsx             # masthead + numbered contents index
│       ├── Hero.tsx               # the full-bleed photo intro
│       ├── Divider.tsx            # the rule between sections
│       ├── About.tsx
│       ├── Projects.tsx           # feature rows for the two placements, a flip-card grid for the rest
│       ├── Experience.tsx
│       ├── Skills.tsx
│       ├── Education.tsx
│       ├── Certifications.tsx     # cert cards that link out to Credly
│       ├── Leadership.tsx
│       ├── Contact.tsx            # Formspree contact form
│       ├── Footer.tsx
│       ├── CommandPalette.tsx     # Cmd/Ctrl + K
│       ├── TerminalDock.tsx       # the terminal drawer (src/shell does the work)
│       ├── Cursor.tsx             # the dot-and-trail cursor (fine pointers only)
│       ├── Section.tsx            # shared section wrapper
│       └── Reveal.tsx             # scroll-into-view animation
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Editing the content

Everything the site says lives in **`src/content.ts`**: profile links, the two résumés, the intro's rotating phrases, projects (with their build logs), experience, skills, education, certifications and leadership. Edit a line there and every place that shows it agrees — the section, the terminal, the command palette, and the counts in About ("4 cloud certifications", "8 projects") are computed from the lists.

For a project's media, drop the file into `public/` and set `image` (and `video`, if there is a clip) on its entry. Each project's `slug` is its anchor (`erickk.cloud/#spottern`), so don't rename one lightly.

## Updating my CV

Both CVs (`CV_SWE.pdf` and `CV_EEE.pdf`) live in `public/` and are committed to the repo — the Résumé menu in the navbar links straight to them. To update one, just replace the PDF in `public/` and push.

## A few notes to self

- The palette is locked light — there's no theme toggle, and no `dark:` classes in the markup.
- `public/404.html` redirects guessed URLs before painting. It can't import `content.ts`, so if a project's `slug` changes, update its list there too.
- Clicks worth counting carry `data-track="name"`; one listener in `analytics.ts` reports them to GoatCounter as events (localhost is never counted).
- Anchor offsets are `scroll-padding-top` on `<html>`, in one place. Don't also add `scroll-mt` to sections — they add up.
- The contact form posts to Formspree (set by `FORMSPREE_ENDPOINT` in `Contact.tsx`), with a plain `mailto:` fallback underneath it.
- `public/CV_SWE.pdf` is public once the site is deployed — if I don't want my phone number scraped, I can keep a redacted PDF in `public/` and the full one to myself.
