import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@apps': path.resolve(__dirname, 'src/apps'),
      },
    },
    build: {
      // جداسازی باندل پنل‌ها از سایت عمومی — کاهش فشار روی لندینگ
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor';
            }
            if (id.includes('/components/AdminPortal') || id.includes('/components/Admin')) return 'portal-admin';
            if (id.includes('/components/VendorPortal') || id.includes('/components/VendorGamification')) return 'portal-seller';
            if (id.includes('/components/Wholesaler')) return 'portal-partner';
            if (id.includes('/components/CustomerPortal')) return 'portal-customer';
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
