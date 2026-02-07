import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')

  // Determine backend URL based on VITE_BACKEND_MODE
  const backendMode = env.VITE_BACKEND_MODE || 'local'
  const backendUrl = backendMode === 'live'
    ? (env.VITE_LIVE_BACKEND_URL || 'http://49.13.223.175:5000/api')
    : (env.VITE_LOCAL_BACKEND_URL || 'http://localhost:5000/api')

  // Remove /api suffix for proxy target
  const proxyTarget = backendUrl.replace('/api', '')

  console.log(`🔧 Vite Proxy: ${backendMode.toUpperCase()} mode → ${proxyTarget}`)

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
