import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
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
  build: {
    cssTarget: 'chrome75',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}))
