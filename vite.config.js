import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // importante para builds que vão para GitHub Pages
  server: {
    host: true, // permite preview público (StackBlitz / containers)
    port: 5173,
  },
});
