import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determinar la URL de la API según el entorno
  const apiUrl = mode === 'production' 
    ? 'https://kamilo123.pythonanywhere.com/api'
    : env.VITE_API_URL || 'http://localhost:8000/api'
  
  console.log('🔍 Build Mode:', mode)
  console.log('🔍 VITE_API_URL:', apiUrl)
  console.log('🔍 Environment Variables:', env)
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: true
    },
    // Forzar las variables correctas durante el build
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_BASE_URL': JSON.stringify(
        mode === 'production' 
          ? 'https://project-manager-front.vercel.app'
          : env.VITE_BASE_URL || 'http://localhost:3000'
      )
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
