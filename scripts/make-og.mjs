import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Regenerates public/og-image.png, the card LinkedIn / Slack / iMessage show
// when the site is shared.
//
//   node scripts/make-og.mjs
//
// Afterwards bump the ?v= query on the og:image and twitter:image URLs in
// index.html, or those services keep serving the cached old one.
//
// This used to compose an SVG with sharp, which meant the preview drifted from
// the site every time the design moved — it was still showing the retired
// boarding pass long after the site stopped looking like that. It now renders
// in headless Chrome from the site's own photograph, fonts and palette, so it
// can only look like whatever the site currently looks like. No dependencies:
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
  .stage { position: relative; width: ${W}px; height: ${H}px; }
  .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .haze { position: absolute; inset: 0;
    background: radial-gradient(120% 100% at 50% 45%,
      rgba(255,255,255,.5) 0%, rgba(255,255,255,.3) 45%, rgba(255,255,255,.1) 100%); }
  .card { position: absolute; inset: 52px; border-radius: 30px;
    border: 1px solid rgba(255,255,255,.7); background: rgba(255,255,255,.74);
    backdrop-filter: blur(30px) saturate(135%) brightness(1.12);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 0 64px; box-shadow: 0 24px 60px rgba(0,0,0,.12); }
  .pill { display: inline-flex; align-items: center; gap: 9px; border-radius: 999px;
    border: 1px solid rgba(21,128,61,.25); background: rgba(240,253,244,.8);
    padding: 7px 16px; font-size: 17px; font-weight: 600; color: #166534; }
  .dot { width: 9px; height: 9px; border-radius: 999px; background: #16a34a; }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 102px;
    letter-spacing: -.02em; color: #1c1917; margin: 24px 0 0; line-height: 1; }
  .builds { margin-top: 22px; font-size: 29px; color: #292524; }
  .builds b { color: #0f766e; font-weight: 600; }
  .role { margin-top: 14px; font-size: 21px; color: #44403c; }
  .foot { position: absolute; bottom: 32px; left: 0; right: 0; text-align: center;
    font-size: 16px; letter-spacing: .22em; text-transform: uppercase; color: #635c57; }
</style>
<div class="stage">
  <img class="photo" src="file://${join(root, 'public/qt.jpg')}">
  <div class="haze"></div>
  <div class="card">
    <span class="pill"><span class="dot"></span>Open to 2026/27 summer internships</span>
    <h1>Eric Kim</h1>
    <div class="builds">I build <b>robots that hold your gaze</b></div>
    <div class="role">Computer Systems Engineering (Hons) · University of Auckland</div>
    <div class="foot">erickk.cloud</div>
  </div>
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
  const { data } = await cdp(ws, 'Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(root, 'public/og-image.png'), Buffer.from(data, 'base64'))
  console.log('wrote public/og-image.png  (%dx%d)', W, H)
  ws.close()
} finally {
  chrome.kill()
}
