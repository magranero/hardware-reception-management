import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd());
  
  // Get API URL from environment or use default
  const apiUrl = env.VITE_API_URL || 'http://localhost:3002/api';
  console.log(`Using API URL: ${apiUrl}`);
  
  // The base URL for the API without the /api path
  const apiBaseUrl = apiUrl.endsWith('/api') 
    ? apiUrl.substring(0, apiUrl.length - 4) 
    : apiUrl;
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Make environment variables available to the client
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    },
    build: {
      // Generate sourcemaps for better debugging
      sourcemap: true,
      // Ensure we show any warnings during build
      reportCompressedSize: true
    }
  };
});