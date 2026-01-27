import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      usePolling: true, // 👈 Windows users ke liye zaroori hai code changes reflect karne ke liye
    },
  },
  base: './', // 👈 Path fix for assets
  build: {
    outDir: 'dist', 
    emptyOutDir: true,
  }
})