import { mkdtempSync, writeFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Regenerates public/og-image.jpg, the card LinkedIn / Slack / iMessage show
// when the site is shared.
//
//   npm run build && node scripts/make-og.mjs
//
// Afterwards bump the ?v= query on the og:image and twitter:image URLs in
// index.html, or those services keep serving the cached old one.
//
// It photographs the site itself. This used to be a hand-kept copy of the
// intro in an HTML string, which drifted every time the design moved, and it
// could not have drawn the board anyway: that is WebGL. So it serves the
// built site, opens the home page in headless Chrome at card size, and takes
// the picture. Reduced motion is switched on for the shot, which is what makes
// it repeatable: the board is drawn whole and still, and the typing line shows
// its first phrase instead of whatever letter it had reached.
//
// No dependencies beyond the project's own: Chrome is already on the machine.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const DEBUG_PORT = 9333
const SITE_PORT = 4179
const W = 1200
const H = 630

if (!existsSync(join(root, 'dist/index.html'))) {
  console.error('no dist/: run `npm run build` first')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const up = async (url) => { try { return (await fetch(url)).ok } catch { return false } }

const site = spawn('npx', ['vite', 'preview', '--port', String(SITE_PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
const dir = mkdtempSync(join(tmpdir(), 'og-'))
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${join(dir, 'profile')}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  // the board is WebGL: ask for the real GPU rather than a software fallback
  '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist',
  'about:blank',
], { stdio: 'ignore' })

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
  for (let i = 0; i < 60 && !(await up(`http://localhost:${SITE_PORT}/`)); i++) await sleep(250)
  for (let i = 0; i < 60 && !(await up(`http://127.0.0.1:${DEBUG_PORT}/json/version`)); i++) await sleep(250)

  const target = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  await cdp(ws, 'Page.enable')
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  await cdp(ws, 'Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp(ws, 'Page.navigate', { url: `http://localhost:${SITE_PORT}/` })

  // wait for the board: the scene is a lazy chunk, and it draws its plate once
  // the fonts it letters it with have arrived
  const ready = async () => (await cdp(ws, 'Runtime.evaluate', {
    expression: "document.querySelector('.ride-canvas')?.dataset.ready === 'true'", returnByValue: true,
  })).result?.value
  for (let i = 0; i < 60 && !(await ready()); i++) await sleep(250)
  await sleep(1200)

  // A card is not a page: no navbar, no scroll cue, and the address where the
  // cue was.
  await cdp(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const style = document.createElement('style')
      style.textContent = 'header, .ride-cue { display: none !important } .ride-copy-intro { padding-top: 3rem !important; padding-bottom: 3rem !important }'
      document.head.appendChild(style)
      const foot = document.createElement('div')
      foot.textContent = 'erickk.cloud'
      foot.style.cssText = 'position:absolute;left:0;right:0;bottom:30px;text-align:center;z-index:9;font:500 15px "JetBrains Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(233,241,238,.62)'
      document.querySelector('.ride-stage').appendChild(foot)
    })()`,
  })
  await sleep(400)

  // JPEG, not PNG: some apps (WhatsApp among them) skip a preview image over
  // about 300KB
  const { data } = await cdp(ws, 'Page.captureScreenshot', { format: 'jpeg', quality: 88 })
  writeFileSync(join(root, 'public/og-image.jpg'), Buffer.from(data, 'base64'))
  console.log('wrote public/og-image.jpg  (%dx%d)', W, H)
  ws.close()
} finally {
  chrome.kill()
  site.kill()
}
