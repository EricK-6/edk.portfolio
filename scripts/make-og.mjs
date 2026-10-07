import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Regenerates public/og-image.jpg, the card LinkedIn / Slack / iMessage show
// when the site is shared.
//
//   node scripts/make-og.mjs
//
// Afterwards bump the ?v= query on the og:image and twitter:image URLs in
// index.html, or those services keep serving the cached old one.
//
// This used to compose an SVG with sharp, which meant the preview drifted from
// the site every time the design moved. It now renders in headless Chrome from
// the site's own photograph, fonts and palette. It is still a hand-kept copy
// of the intro, though (the status line, the typing phrase, the degree line),
// so when Hero.tsx changes, change it here and regenerate. No dependencies:
// Chrome is already on the machine, everything else is a local file.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9333
const W = 1200
const H = 630

const b64 = (p) => readFileSync(p).toString('base64')

const inter = join(root, 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2')
const interSemi = join(root, 'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2')
const fraunces = join(root, 'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2')
for (const f of [inter, interSemi, fraunces]) {
  if (!existsSync(f)) { console.error('missing font file:', f); process.exit(1) }
}

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family: Inter; font-weight: 400; src: url(data:font/woff2;base64,${b64(inter)}) format('woff2'); }
  @font-face { font-family: Inter; font-weight: 600; src: url(data:font/woff2;base64,${b64(interSemi)}) format('woff2'); }
  @font-face { font-family: Fraunces; font-weight: 100 900; src: url(data:font/woff2;base64,${b64(fraunces)}) format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: Inter, sans-serif; }
  .stage { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #fbfaf9; }
  /* the intro as the site draws it: the photograph full bleed, no card, a wide
     haze behind the type, and the bottom dissolving into the page colour */
  .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    object-position: 50% 64%; filter: blur(1.5px); transform: scale(1.02); }
  .haze { position: absolute; inset: 0;
    background:
      radial-gradient(95% 62% at 50% 47%, rgba(255,255,255,.72) 0%, rgba(255,255,255,.5) 42%,
        rgba(255,255,255,.16) 76%, rgba(255,255,255,0) 100%),
      linear-gradient(to bottom, rgba(251,250,249,.35) 0%, rgba(251,250,249,0) 30%,
        rgba(251,250,249,0) 62%, #fbfaf9 100%); }
  .copy { position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center; padding-bottom: 36px;
    text-shadow: 0 0 18px rgba(255,255,255,.8), 0 1px 2px rgba(255,255,255,.65); }
  .status { display: inline-flex; align-items: center; gap: 10px; font-size: 21px; color: #292524; }
  .status b { font-weight: 600; }
  .dot { width: 11px; height: 11px; border-radius: 999px; background: #059669; }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 118px;
    letter-spacing: -.035em; color: #1c1917; margin-top: 22px; line-height: .95; }
  .builds { margin-top: 26px; font-size: 32px; color: #292524; }
  .builds b { color: #115e59; font-weight: 600; }
  .role { margin-top: 18px; font-size: 23px; color: #44403c; }
  .foot { position: absolute; bottom: 34px; left: 0; right: 0; text-align: center;
    font-size: 16px; letter-spacing: .22em; text-transform: uppercase; color: #635c57; }
</style>
<div class="stage">
  <img class="photo" src="file://${join(root, 'public/qt.jpg')}">
  <div class="haze"></div>
  <div class="copy">
    <div class="status"><span class="dot"></span><span><b>Status:</b> Open to chats and collaborations</span></div>
    <h1>Eric Kim</h1>
    <div class="builds">Kia ora, I build <b>embedded systems</b></div>
    <div class="role">BE(Hons) Computer Systems Engineering · University of Auckland</div>
  </div>
  <div class="foot">erickk.cloud</div>
</div>`

const dir = mkdtempSync(join(tmpdir(), 'og-'))
const page = join(dir, 'og.html')
writeFileSync(page, html)

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(dir, 'profile')}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--allow-file-access-from-files', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const cdp = (ws, method, params = {}) => {
  const id = Math.floor(Math.random() * 1e9)
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => {
    const on = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id === id) { ws.removeEventListener('message', on); resolve(m.result) }
    }
    ws.addEventListener('message', on)
  })
}

try {
  await sleep(2500)
  const target = await (await fetch(
    `http://127.0.0.1:${PORT}/json/new?file://${page}`, { method: 'PUT' },
  )).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  await cdp(ws, 'Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  await sleep(2500) // photo decode + font load
  // JPEG, not PNG: a photograph as PNG was 530KB, and some apps (WhatsApp
  // among them) skip a preview image over about 300KB
  const { data } = await cdp(ws, 'Page.captureScreenshot', { format: 'jpeg', quality: 86 })
  writeFileSync(join(root, 'public/og-image.jpg'), Buffer.from(data, 'base64'))
  console.log('wrote public/og-image.jpg  (%dx%d)', W, H)
  ws.close()
} finally {
  chrome.kill()
}
