import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔍 Build Mode:', mode)
  console.log('🔍 VITE_API_URL:', env.VITE_API_URL)
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: true
    },
    // Asegurar que las variables estén disponibles durante el build
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'production' 
          ? 'https://kamilo123.pythonanywhere.com/api'
          : env.VITE_API_URL || 'http://localhost:8000/api'
      ),
      'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL || 'https://project-manager-front.vercel.app')
    },
    // Configuración específica para build
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
})
