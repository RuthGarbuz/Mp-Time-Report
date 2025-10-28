
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt','logo.png'],
     manifest: {
    name: "MasterPlan",
    short_name: "MP",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4a90e2",
    lang: "en",
    scope: "/",
    icons: [
      {
        src: "/red-logo-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/red-logo-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }

    })
  ],
   build: {
    minify: 'terser',  // שימוש ב-Terser כמיניפייר
    terserOptions: {
      compress: {
        drop_console: true,    // מסיר את כל console.log
        drop_debugger: true,   // מסיר debugger אם יש
      },
    },
  },
   server: {
    proxy: {
       '/api': {
        target: 'https://mpwebapp.master-plan.co.il/GlobalWebAPI/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), 
         configure: (proxy, _options) => {
    proxy.on('proxyRes', (proxyRes, req, res) => {
      // add a debug header to the response the browser receives
      try { res.setHeader('X-Proxy-Debug', 'proxied-to-mpwebapp'); } catch (e) {}
      console.log('[vite-proxy] proxied', req.url, '=>', proxyRes.statusCode);
    });
  }
      },
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
