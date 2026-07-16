// Copies CV_SWE.pdf from the project root into public/ so Vite serves it at /CV_SWE.pdf.
// Runs automatically via the "postinstall" and "predev" / "prebuild" npm scripts.
import { existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'CV_SWE.pdf')
const destDir = resolve(root, 'public')
const dest = resolve(destDir, 'CV_SWE.pdf')

if (!existsSync(src)) {
  console.warn('[copy-cv] CV_SWE.pdf not found at project root — skipping.')
  process.exit(0)
}

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log('[copy-cv] Copied CV_SWE.pdf → public/CV_SWE.pdf')
