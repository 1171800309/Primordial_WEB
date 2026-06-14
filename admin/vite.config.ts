import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/auth': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => `/api/admin${path}`,
      },
      '/users': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => `/api/admin${path}`,
      },
      '/shop': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => `/api/admin${path}`,
      },
      '/operation-logs': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => `/api/admin${path}`,
      },
      '/uploads': {
        target: 'http://localhost:5101',
        changeOrigin: true,
      },
    },
  },
})
