import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL || 'http://127.0.0.1:8001';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/accounts': { target: backendUrl, changeOrigin: true },
        '/api': { target: backendUrl, changeOrigin: true },
        '/engine': { target: backendUrl, changeOrigin: true },
        '/curriculum': { target: backendUrl, changeOrigin: true },
        '/library': { target: backendUrl, changeOrigin: true },
      }
    }
  }
})
