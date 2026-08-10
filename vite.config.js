import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createRequire } from 'module';

const { version } = createRequire(import.meta.url)('./package.json');

export default defineConfig({
  plugins: [react()],
  // Única fuente de la versión: package.json. Escrita a mano en la UI se
  // quedaba desfasada en cada release.
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
  },
});
