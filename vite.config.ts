import { defineConfig, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

const proxy: ProxyOptions = {
  target: 'http://localhost:3000',
  changeOrigin: true
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/accidents': proxy,
      '/status':  proxy
    }
  }
})
