# Eric Kim — Personal Website

Personal CV / portfolio website for **Dohyun (Eric) Kim**, a Computer Systems Engineering (Hons) student at the University of Auckland. Built as a single-page site for internship applications.

**Live:** https://erickk.cloud/

---

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- Deployed to **GitHub Pages** via [`gh-pages`](https://www.npmjs.com/package/gh-pages)

## Local development

Install once:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173.

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serves the built site locally
```

## Deploy to GitHub Pages

### Automatic (current setup)

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs `npm ci`, `npm run build`, and publishes `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`. Just push and the live site updates — no local deploy step needed.

In the GitHub repo **Settings → Pages**, the source is set to the `gh-pages` branch.

### Manual (fallback)

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch from your machine.

### Notes on `base`

`vite.config.js` uses `base: './'`, which works at any deploy path. If you ever move to a repo subpath (e.g. `erick-6.github.io/personal-website/`), change it to `base: '/personal-website/'`. For a root user-page at `erick-6.github.io`, keep `base: './'`.

## Project layout

```
Personal Website/
├── CV.pdf                  # source CV (copied into public/ by scripts/copy-cv.mjs)
├── .github/workflows/
│   └── deploy.yml          # auto-deploys to GitHub Pages on push to main
├── scripts/
│   └── copy-cv.mjs         # copies CV.pdf → public/ before dev/build
├── public/
│   ├── CV.pdf              # served at /CV.pdf (wired to the Download CV button)
│   └── favicon.svg
├── src/
│   ├── App.jsx             # theme + layout
│   ├── main.jsx
│   ├── index.css           # Tailwind + component classes
│   └── components/
│       ├── Navbar.jsx
│       ├── Hero.jsx        # bento-grid hero + "type my name" challenge
│       ├── About.jsx
│       ├── Projects.jsx    # 3D coverflow carousel (PROJECTS array)
│       ├── Experience.jsx
│       ├── Skills.jsx
│       ├── Education.jsx
│       ├── Certifications.jsx
│       ├── Leadership.jsx
│       ├── Contact.jsx     # Formspree-backed contact form
│       ├── Footer.jsx
│       ├── Section.jsx     # shared section wrapper
│       └── Reveal.jsx      # scroll-into-view fade/slide animation
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Editing content

Each section keeps its data in a constant at the top of its component file — open the file, edit the array, save. No CMS, no DB.

- **Projects** → `src/components/Projects.jsx` (`PROJECTS` array)
- **Experience** → `src/components/Experience.jsx`
- **Skills** → `src/components/Skills.jsx`
- **Certifications** → `src/components/Certifications.jsx`
- **Leadership** → `src/components/Leadership.jsx`

To replace the project image placeholders with real screenshots, drop images into `public/` and swap the gradient placeholder `<div>` in `Projects.jsx` with `<img src="/your-image.png" …>`.

## Updating the CV

Replace `public/CV.pdf` with the latest version. The Download CV button in the hero links to `/CV.pdf`, so nothing else needs to change.

## Notes

- Dark mode follows system preference on first load and can be toggled from the navbar.
- The contact form POSTs to [Formspree](https://formspree.io/) (no backend of our own); messages are delivered to the inbox configured there. A "Just email me directly" `mailto:` link is offered as a fallback. To point it at a different inbox, change `FORMSPREE_ENDPOINT` in `src/components/Contact.jsx`.
- `public/CV.pdf` is served publicly once deployed. If you'd rather not expose your phone number to scrapers, keep a redacted PDF in `public/` and the full one private.
