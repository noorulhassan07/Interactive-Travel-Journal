import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // FIX: Explicitly set the project root.
  // The root is the directory containing the 'public' and 'src' folders.
  root: './', 
});