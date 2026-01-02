
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: ./' is critical: it ensures assets (js/css) are loaded relatively 
  // instead of from the root domain, which breaks in file:// protocols (apps).
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173
  }
});
