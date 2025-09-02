
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
      manifest: {
        name: '',
        short_name: 'MyApp',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4a90e2',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
   server: {
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
            secure: false,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
          headers: {
       'User-Agent': 'my-app/1.0 (ruthig910@gmail.com)', // חובה! שים אימייל שלך
        'Accept': 'application/json'
      }
      },
    },
  },
})