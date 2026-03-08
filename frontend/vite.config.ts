import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function getBackendTarget(): string {
  try {
    const ip = execSync("ip route show default | awk '{print $3}'").toString().trim()
    if (ip) return `http://${ip}:8080`
  } catch {}
  return 'http://localhost:8080'
}

const backendTarget = getBackendTarget()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
