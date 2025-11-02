import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Bundle analyzer configuration
 * Run with: vite build --config vite.config.visualize.ts
 * 
 * Optional: Install visualizer for enhanced analysis
 * npm install --save-dev rollup-plugin-visualizer
 * 
 * Then uncomment the visualizer plugin below
 */
export default defineConfig({
  plugins: [
    react(),
    // Uncomment after installing rollup-plugin-visualizer:
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: 'dist/bundle-analysis.html',
    // }),
  ],
  server: {
    port: 34115,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 2, // Run compression twice for better optimization
      },
      output: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    target: 'ES2020',
    // Report compressed file size
    reportCompressedSize: true,
  },
})

