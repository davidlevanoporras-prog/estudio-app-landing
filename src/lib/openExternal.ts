import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";

/**
 * Placeholder de checkout / landing Pro.
 * Sustituir por el dominio real cuando esté listo.
 */
export const PRO_CHECKOUT_URL = "https://tu-landing-page.com";

/**
 * Abre una URL en el navegador nativo del SO (Safari/Chrome/Edge).
 * En Tauri usa `plugin-opener` — nunca el webview interno.
 * En Vite/navegador cae a `window.open` como respaldo de desarrollo.
 */
export async function openExternalUrl(url: string): Promise<void> {
  const target = url.trim();
  if (!target) return;

  try {
    if (isTauri()) {
      await openUrl(target);
      return;
    }
  } catch (error) {
    console.error("[openExternal] plugin-opener falló:", error);
  }

  // Respaldo web / si el plugin no está disponible.
  window.open(target, "_blank", "noopener,noreferrer");
}
