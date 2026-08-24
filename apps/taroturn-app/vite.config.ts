import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/ttagy': {
        target: 'http://127.0.0.1:8970',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ttagy/, '/api/v1'),
      },
    },
  },
});
