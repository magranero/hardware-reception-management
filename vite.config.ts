import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd());
  
  // Is this a production build?
  const isProduction = mode === 'production';
  
  // Get API URL from environment or use default
  const apiUrl = env.VITE_API_URL || '/api';
  
  console.log(`Building in ${mode} mode with API URL: ${apiUrl}`);
  
  return {
    plugins: [
      react(),
      // Add bundle visualizer in analyze mode
      process.env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            if (!isProduction) {
              proxy.on('error', (err) => {
                console.warn('Proxy error:', err);
              });
              proxy.on('proxyReq', (proxyReq, req) => {
                console.debug(`Proxy request: ${req.method} ${req.url}`);
              });
              proxy.on('proxyRes', (proxyRes, req) => {
                console.debug(`Proxy response: ${proxyRes.statusCode} ${req.url}`);
              });
            }
          }
        },
        '/uploads': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        }
      }
    },
    build: {
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react', 'react-hook-form', 'react-dropzone', 'react-beautiful-dnd'],
            'vendor-utils': ['axios', 'date-fns', 'zustand', 'xlsx', 'clsx'],
            'vendor-pdf': ['pdfjs-dist', 'tesseract.js']
          },
          // Improve chunk naming
          chunkFileNames: isProduction
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: isProduction
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          assetFileNames: isProduction
            ? 'assets/[ext]/[name]-[hash].[ext]'
            : 'assets/[ext]/[name].[ext]'
        }
      },
      // Minification options
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      }
    },
    // Define environment variables for the client
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'import.meta.env.BUILD_TIME': JSON.stringify(new Date().toISOString())
    }
  };
});