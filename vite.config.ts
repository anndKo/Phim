import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Xóa dòng import componentTagger

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Phim/' : '/', 
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Xóa dòng componentTagger() ở đây
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));