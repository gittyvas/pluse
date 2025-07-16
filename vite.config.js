import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), Unocss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://backend.gitthit.com.ng',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: process.env.VITE_API_URL || 'https://backend.gitthit.com.ng',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
