import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve webpack ~ prefix to node_modules for IBM Plex fonts
      '~@ibm/plex': path.resolve(__dirname, 'node_modules/@ibm/plex'),
      '~@ibm/plex-mono': path.resolve(__dirname, 'node_modules/@ibm/plex-mono'),
      '~@ibm/plex-sans': path.resolve(__dirname, 'node_modules/@ibm/plex-sans'),
      '~@ibm/plex-serif': path.resolve(__dirname, 'node_modules/@ibm/plex-serif'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
