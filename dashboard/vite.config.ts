import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
//
// The dev proxy mirrors the production shape: in both environments the
// browser always requests paths under `/api/...` and the Vite proxy
// strips nothing — it just forwards the full path to the backend. The
// backend's `/api` mount then handles routing identically locally and
// in production.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Production build: emit assets with relative paths so the bundle
  // works regardless of the Vercel project URL or subpath. Without
  // this, assets can 404 if the user later adds a custom domain with
  // a path prefix.
  build: {
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
