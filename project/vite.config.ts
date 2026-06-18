import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Power Apps Code App — local dev MUST run on port 3000 for the Power Platform SDK.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
