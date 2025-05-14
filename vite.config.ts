import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  base:'/fedimint-web-wallet/',
  plugins: [react(), wasm()],
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
    plugins: () => [
      wasm()
    ]
  },
  optimizeDeps: {
    exclude: ['@fedimint/core-web'],
  },
})
