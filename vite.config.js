import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Las funciones serverless (/api) corren aparte con `vercel dev`
      // en el puerto 3000; ver README/notas de desarrollo local.
      '/api': 'http://localhost:3000',
    },
  },
})
