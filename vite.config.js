import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react-dom") || (id.includes("node_modules/react") && !id.includes("react-router"))) return "vendor-react";
          if (id.includes("node_modules/react-router")) return "vendor-router";
          if (id.includes("node_modules/recharts")) return "vendor-recharts";
          if (id.includes("node_modules/lucide-react")) return "vendor-lucide";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
