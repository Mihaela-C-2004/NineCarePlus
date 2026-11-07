import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite servește interfața pe portul 5173 și trimite cererile /api la serverul Node (portul 3001).
// "host: true" face aplicația accesibilă și de pe telefon, în aceeași rețea Wi-Fi.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
