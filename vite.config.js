import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: {
    alias: {
      // Polyfills for @solana/web3.js in browser
      buffer: 'buffer',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    cors: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      // Ensure buffer is bundled
      external: [],
    },
  },
})
