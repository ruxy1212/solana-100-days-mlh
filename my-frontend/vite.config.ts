import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: '/solana-100-days-mlh/my-frontend/',
  plugins: [react(), tailwindcss()],
});
