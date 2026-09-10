import React from 'react'
import ReactDOM from 'react-dom/client'
// self-hosted fonts (replaces the old Google Fonts stylesheet): only the
// weights the site actually uses
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource-variable/fraunces'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/600.css'
import App from './App.jsx'
import { upgradeLegacyHash } from './router.js'
import './index.css'

// Bookmarks and shared links from the route-per-section era used '#/about'.
// Rewrite them to the anchor form before React paints, so an old link still
// lands on the right section instead of at the top of the page.
upgradeLegacyHash()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
