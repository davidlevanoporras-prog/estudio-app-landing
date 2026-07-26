import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";

/**
 * Abre una URL en el navegador nativo del SO.
 * Bloquea pasarelas de pago externas (Lemon Squeezy, Stripe, etc.):
 * las compras de la app van solo por IAP de Apple (temas).
 */
export async function openExternalUrl(url: string): Promise<void> {
  const target = url.trim();
  if (!target) return;

  if (/lemonsqueezy|stripe\.com|buy\.stripe|checkout/i.test(target)) {
    console.info("[openExternal] pasarela externa bloqueada — use IAP de temas");
    return;
  }

  try {
    if (isTauri()) {
      await openUrl(target);
      return;
    }
  } catch (error) {
    console.error("[openExternal] plugin-opener falló:", error);
  }

  window.open(target, "_blank", "noopener,noreferrer");
}
