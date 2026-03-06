import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';
import path from 'path';

/**
 * Makes CSS non-render-blocking by converting stylesheet links to
 * preload+onload pattern. Works because we inline critical CSS in the
 * HTML template, so the full stylesheet can load asynchronously.
 */
function asyncCssPlugin(): Plugin {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        '<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel=\'stylesheet\'">' +
        '<noscript><link rel="stylesheet" crossorigin href="$1"></noscript>',
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    asyncCssPlugin(),
    compression({ algorithm: 'gzip', exclude: [/\.(br)$/i] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(gz)$/i] }),
  ],
  resolve: {
    conditions: ['style'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@root/types': path.resolve(__dirname, './types'),
      '@root/api/schemas': path.resolve(__dirname, './src/api/schemas'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    cssMinify: 'esbuild',
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          // Radix UI (umbrella + individual packages)
          if (id.includes('node_modules/radix-ui') || id.includes('node_modules/@radix-ui/')) {
            return 'radix';
          }
          // Icons — lucide-react
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Charts — recharts + d3 deps
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          // Forms — react-hook-form + resolvers + zod
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform/') || id.includes('node_modules/zod')) {
            return 'forms';
          }
          // Table
          if (id.includes('node_modules/@tanstack/react-table') || id.includes('node_modules/@tanstack/table-core')) {
            return 'table';
          }
          // Utility libs
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority')
          ) {
            return 'utils';
          }
          // Toast + theme
          if (id.includes('node_modules/sonner') || id.includes('node_modules/next-themes')) {
            return 'toast';
          }
          // Command menu + drawer
          if (id.includes('node_modules/cmdk') || id.includes('node_modules/vaul')) {
            return 'overlay';
          }
        },
      },
    },
  },
});
