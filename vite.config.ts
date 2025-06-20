import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd());
  
  // Get API URL from environment or use default
  const apiUrl = env.VITE_API_URL || '/api';
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        }
      }
    },
    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'react-hook-form', 'react-dropzone', 'react-beautiful-dnd'],
            utils: ['axios', 'date-fns', 'zustand', 'xlsx', 'clsx']
          }
        }
      }
    }
  };
});