import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          // UI components chunk - only include packages that actually exist
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group'
          ],
          // Routing and state management
          routing: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          // Charts and visualization
          charts: ['recharts'],
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Date and utility libraries
          utils: ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          // Icons and animations
          icons: ['lucide-react', 'framer-motion'],
          // Other utilities
          misc: ['uuid', 'prismjs', 'sonner', 'cmdk', 'vaul']
        }
      }
    },
    // Increase chunk size warning limit to 600KB
    chunkSizeWarningLimit: 600,
    // Enable source maps for better debugging
    sourcemap: mode === 'development',
  },
  // Optimize dev server
  server: {
    open: true,
    port: 3000,
  },
}));
