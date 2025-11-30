import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@jetstart/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  optimizeDeps: {
    include: ['@jetstart/shared'],
  },
});
