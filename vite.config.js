import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/**
 * El modo del build nativo: `vite build --mode ios` (SPEC_21.1 §4.4).
 *
 * **Dentro de la app de iPhone no hay service worker** (DP-21.7). Los archivos
 * ya vienen empaquetados en el binario, así que un service worker sobra, y
 * además podría servir una versión vieja de la app después de una
 * actualización. Netlify lo conserva: el build normal no cambia.
 */
export const MODO_IOS = 'ios'

/** ¿Se apaga el PWA en este modo? Solo en el build nativo. */
export function pwaApagado(mode) {
  return mode === MODO_IOS
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      disable: pwaApagado(mode),
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Strivo',
        short_name: 'Strivo',
        description: 'Refugio digital para terminar cada día en paz contigo mismo.',
        theme_color: '#191428',
        background_color: '#FBF8F4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Cache-first para assets; network-first para API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-cache', networkTimeoutSeconds: 10 }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tokens': path.resolve(__dirname, './src/tokens'),
      '@copy': path.resolve(__dirname, './src/copy'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    }
  }
}))
