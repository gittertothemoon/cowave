import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <– qui entra in gioco Tailwind v4
  ],
  resolve: {
    alias: {
      clsx: path.resolve(__dirname, 'src/utils/clsx.js'),
    },
  },
})
