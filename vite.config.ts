import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When the repo was last touched, baked in at build time.
//
// The footer says "last updated <date>", and the honest source for that is the
// repository itself. Read here rather than fetched from the GitHub API in the
// browser: the deploy runs on every push to `main`, so the build date and the
// commit date are the same moment, and this way the footer costs no request,
// works offline, and cannot be rate-limited or fail to a blank.
//
// The fallback matters for a tarball checkout or a shallow clone with no
// history — a missing date should not fail the build.
const lastUpdated = (() => {
  try {
    return execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return new Date().toISOString()
  }
})()

// Using './' makes build artifacts work at any deploy path (GitHub Pages subpaths, Vercel root, etc.)
// If deploying to a repo page like erick-6.github.io/personal-website/, change to '/personal-website/'
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __LAST_UPDATED__: JSON.stringify(lastUpdated),
  },
})
