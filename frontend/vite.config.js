import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://fastapi-backend-je9z.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})