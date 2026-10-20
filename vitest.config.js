import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Los mismos alias que `vite.config.js`: sin ellos, un módulo que importa
  // `@/lib/db` se prueba distinto de como se ejecuta.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tokens': path.resolve(__dirname, './src/tokens'),
      '@copy': path.resolve(__dirname, './src/copy'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
  // El JSX se transforma como en la app —con el runtime automático, sin
  // `import React`—: sin esto, una prueba que pinte un componente a HTML se
  // encuentra con `React is not defined`.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    setupFiles: ['./src/lib/db/__tests__/setup.js'],
    include: ['src/**/*.test.js'],
  },
})
