import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    open: true
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://canvas-crafters.onrender.com/api'),
    'process.env.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'https://canvas-crafters.onrender.com'),
  }
});
