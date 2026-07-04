import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/gacha/' : '/',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        smokefree: resolve(__dirname, 'smoke-free.html'),
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }
          if (
            id.includes('/leaflet/') ||
            id.includes('/react-leaflet/') ||
            id.includes('/@react-leaflet/')
          ) {
            return 'vendor-leaflet'
          }
          if (id.includes('/@supabase/')) {
            return 'vendor-supabase'
          }
        },
      },
    },
  },
})
