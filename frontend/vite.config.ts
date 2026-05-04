import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  plugins: [
    vue(),
    legacy({
      targets: ['chrome >= 75', 'iOS >= 12', 'Safari >= 12'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['sql.js'],
  },
  build: {
    cssTarget: 'chrome75',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
}))
