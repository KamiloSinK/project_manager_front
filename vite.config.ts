import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: true
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
