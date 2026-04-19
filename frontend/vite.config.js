import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    // Configure proxy to avoid CORS issues during development
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  build: {
    // Output directory
    outDir: "dist",
    
    // Enable source maps in production for debugging (remove in production if concerned about security)
    sourcemap: false,
    
    // Minification
    minify: "terser",
    
    // Build optimization
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Rollup options for better bundling
    rollupOptions: {
      output: {
        // Split code into chunks
        manualChunks: {
          // Vendor libraries
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          axios: ["axios"],
        },
      },
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify("1.0.0"),
  },
});
