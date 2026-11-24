import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import serviceWorker from './tools/sw-plugin.ts'

// Relative base so the built site works from any GitHub Pages path. The service worker plugin
// precaches the build so the app works offline after the first visit.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
