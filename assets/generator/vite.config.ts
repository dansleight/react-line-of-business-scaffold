import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { plateServerPlugin as generatorServerPlugin } from './server/vitePlugin.ts'

export default defineConfig({
  plugins: [react(), generatorServerPlugin()],
  server: {
    port: 3199,
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'mixed-decls',
          'legacy-js-api',
          'color-functions',
          'import',
          'global-builtin',
          'slash-div',
          'if-function',
        ],
      },
    },
  },
})
