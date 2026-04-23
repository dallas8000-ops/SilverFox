import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Backend default PORT is 3001 (see kistie-store/backend/index.js). Override with VITE_API_ORIGIN.
const apiTarget = process.env.VITE_API_ORIGIN || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
