# Personal Portfolio

Hey, I'm **Dohyun (Eric) Kim**, a Computer Systems Engineering (Hons) student at the University of Auckland. This is the personal site I built to show what I've worked on and to share my CV and projects.

🔗 **Live at [erickk.cloud](https://erickk.cloud/)**

It's four pages, each one a normal scrolling document, and one idea runs through all of them: the motto, **from silicon to serverless**, taken literally.

- **Home** (the ride, About, Experience, a drum machine), **Projects** (projects, the bench, skills), **Background** (education, certifications, volunteering) and **Contact**. Every section keeps its own anchor, so `#skills` opens the Projects page and scrolls to Skills.

- **The ride.** The home page opens on a live circuit board with my name on it. Scrolling pushes one signal off a pin of the ATmega328P and up through six floors: silicon, logic, firmware, robotics, software, cloud. Each floor is drawn in code from the work I did on it (the energy monitor's display, Flappy Universe's real LFSR taps, a UART frame that spells my initials, a maze being searched, SLOTLY's own constraint, Spottern's pipeline), and the ride ends by climbing through the clouds onto the paper the rest of the site is printed on. It is Three.js, loaded as its own chunk after first paint.
- **The stack is a system, not a hero image.** The same six floors filter the Projects page, sit as a small tower on every project card, and answer to `stack` and `floor 3` in the terminal. Which projects are on which floor is read from `content.ts`.
- **The bench.** Four ideas out of the projects, rebuilt small enough to run in the page: twenty concurrent bookings against one slot, A* against breadth first search on a 15 x 19 maze, a 16 bit LFSR clocking, and RMS from raw ADC samples. Each is a simulation and says so, tuned to the numbers in the projects' own READMEs and reports.
- **Off the clock.** I drum, so the home page keeps a drum machine: sixteen steps, four voices, every sound synthesised with the Web Audio API, and a pattern is one copyable link.
- **Everything below the ride is paper.** A flat off-white document, a narrow reading measure, hairline rules between sections, and a header that lists the four pages and underlines the one you're on. Every page ends at the lake: the photograph from Queenstown that used to be the hero is now the footer.
- **Command palette** (`Cmd`/`Ctrl + K`) and a **terminal** (`Ctrl + \``) that browses the page as a filesystem: `ls`, `cd` (it opens the right page and scrolls there), `cat`, `grep`, pipes, `stack`, `floor 3`, `open spottern` (opens its build log), `./spottern` (a replay of the pipeline), `./slotly` (takes you to its experiment on the bench). It works like a normal shell: you type, it prints, and `help` lists the commands.
- **The page never fights the scroll.** There's no wheel hijacking and no snap. The ride is a `position: sticky` stage inside a tall section: the scroll is only ever read, never taken over, so the scrollbar, `Cmd+F`, the keyboard and Back all behave. An earlier version of this site reinterpreted the wheel as travel between sections, and that cost all four.
- **It steps aside.** With reduced motion on, on a window too short to hold it, or with no WebGL, the ride becomes a still board (or none) and the six floors become a plain list with the same words and links. Add `?flat` to the URL to see that version.

---

## Built with

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Three.js](https://threejs.org/) for the ride, in a lazy chunk of its own
- The Web Audio API for the drum machine: no samples, no library
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
│   ├── 404.html                   # also catches guessed URLs: /cv, /projects, /spottern, /bench …
│   ├── CV_SWE.pdf                 # the two CVs the navbar links to
│   ├── CV_EEE.pdf
│   ├── qt.jpg / qt.webp           # the lake, now the footer of every page (+ qt-sm.* for small screens)
│   └── og-image.jpg
├── src/
│   ├── App.tsx                    # the four pages, and which sections each holds
│   ├── content.ts                 # every word and link the site shows, and the six floors (see below)
│   ├── analytics.ts               # GoatCounter click events (data-track="…")
│   ├── ride/                      # the ride's scene: the only place three.js is imported
│   │   ├── timeline.ts            # the ride's clock, in beats: what happens when, shared with the page
│   │   ├── scene.ts               # camera, shaders, the signal, the sky
│   │   ├── plates.ts              # the six floors' artwork, drawn in code
│   │   ├── pen.ts                 # the 2D pen that draws a floor and its signal paths
│   │   └── lfsr.ts                # Flappy Universe's LFSR, used by the logic floor and the bench
│   ├── bench/                     # the four experiments, and the furniture they share (Lab.tsx)
│   ├── shell/                     # the terminal's brain: a filesystem built from content.ts, commands, replays
│   ├── main.tsx
│   ├── router.ts                  # picks the page from the URL hash and lands on the section
│   ├── sitemap.ts                 # the pages, their sections and their labels, in one place
│   ├── useOnScreen.ts             # pauses clips and experiments when off screen
│   ├── index.css                  # Tailwind + my shared component classes + the ride's stage
│   └── components/
│       ├── Navbar.tsx             # masthead + contents index (turns light while over the ride)
│       ├── Ride.tsx               # the pinned stage: name, captions, gauge, and scroll into beats
│       ├── Motto.tsx              # "From silicon to serverless." where the ride ends
│       ├── Divider.tsx            # the rule between sections
│       ├── About.tsx
│       ├── Experience.tsx
│       ├── Drums.tsx              # off the clock: the drum machine
│       ├── Projects.tsx           # feature rows, a flip-card grid, the floor filter and towers
│       ├── Bench.tsx              # the bench section
│       ├── Skills.tsx
│       ├── Education.tsx
│       ├── Certifications.tsx     # cert cards that link out to Credly
│       ├── Volunteering.tsx
│       ├── Contact.tsx            # Formspree contact form
│       ├── Footer.tsx             # the lake, and what time it is in Auckland
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

Everything the site says lives in **`src/content.ts`**: profile links, the two résumés, the intro's rotating phrases, projects (with their build logs), experience, skills, education, certifications and volunteering. Edit a line there and every place that shows it agrees — the section, the terminal, the command palette, and the counts in About ("4 cloud certifications", "8 projects") are computed from the lists.

Each project also names the floors of the stack it was built on (`floors: [2, 3]`, the one it mostly lives on first), and each floor's own words live in `STACK` in the same file. That is all the ride, the Projects filter, the cards' towers and the terminal's `stack` need: add a project with its floors and it appears on the right floor everywhere.

For a project's media, drop the file into `public/` and set `image` (and `video`, if there is a clip) on its entry. Each project's `slug` is its anchor (`erickk.cloud/#spottern`), so don't rename one lightly.

## Updating my CV

Both CVs (`CV_SWE.pdf` and `CV_EEE.pdf`) live in `public/` and are committed to the repo — the Résumé menu in the navbar links straight to them. To update one, just replace the PDF in `public/` and push.

## A few notes to self

- The palette is locked light: there's no theme toggle, and no `dark:` classes in the markup. The ride and the bench's screens are dark on purpose and carry their own colours.
- The ride's pace is one number, `BEAT_VH` in `src/ride/timeline.ts`: how much scrolling one beat costs. Everything else in that file is when things happen, in beats.
- The ride sets `data-sky` on `<html>` (`dark` or `light`); the navbar and the cursor read it from CSS. Nothing else should need to know.
- A floor's artwork is drawn by `src/ride/plates.ts` onto two canvases: what you see, and a map of how far along each wire every pixel is. The second is what lets pulses run along traces and lets the scroll light the signal's route.
- The bench is honest about being a simulation. If a number in it changes in the real project (the deadlock rate, the map size, the taps), change it there too.
- `public/404.html` redirects guessed URLs before painting. It can't import `content.ts`, so if a project's `slug` changes, update its list there too.
- Clicks worth counting carry `data-track="name"`; one listener in `analytics.ts` reports them to GoatCounter as events (localhost is never counted).
- Anchor offsets are `scroll-padding-top` on `<html>`, in one place. Don't also add `scroll-mt` to sections — they add up.
- The contact form posts to Formspree (set by `FORMSPREE_ENDPOINT` in `Contact.tsx`), with a plain `mailto:` fallback underneath it.
- `public/CV_SWE.pdf` is public once the site is deployed — if I don't want my phone number scraped, I can keep a redacted PDF in `public/` and the full one to myself.
