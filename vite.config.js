import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built site work from any folder or host (Vercel, Netlify, GitHub Pages).
export default defineConfig({ plugins: [react()], base: "./" });
