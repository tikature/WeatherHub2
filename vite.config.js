import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/weather': {
        target: 'https://api.weatherapi.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/weather/, '')
      },
      '/api/location': {
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/location/, '')
      }
    }
  }
})
