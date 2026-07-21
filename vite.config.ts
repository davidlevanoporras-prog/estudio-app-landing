import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `strictPort` es obligatorio para Tauri: `src-tauri/tauri.conf.json` apunta
// su `devUrl` a un puerto fijo (5173) — si Vite escalara silenciosamente a
// otro puerto por estar ocupado, la ventana nativa cargaría una URL muerta.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
  // Evita que el propio HMR de Vite se confunda con el reload nativo de la
  // ventana de Tauri en macOS/Linux/Windows.
  clearScreen: false,
});
