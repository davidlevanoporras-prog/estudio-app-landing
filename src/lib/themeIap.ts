import { invoke, isTauri } from "@tauri-apps/api/core";

/**
 * Producto IAP no consumible — paquete de entornos fotográficos (Showroom).
 * Debe coincidir con el ID configurado en App Store Connect.
 */
export const THEMES_PACK_PRODUCT_ID =
  "com.excellenceabsolue.desktop.themes_pack";

export type ThemeIapResult = {
  /** `true` si el usuario posee el paquete tras la operación. */
  owned: boolean;
  /** Mensaje opcional (errores / cancelación). */
  message?: string;
};

/**
 * Lanza la hoja nativa de compra (StoreKit vía comando Tauri).
 * En web/dev sin shell: simula compra local para pruebas de UI.
 */
export async function purchaseThemesPack(): Promise<ThemeIapResult> {
  if (isTauri()) {
    try {
      const owned = await invoke<boolean>("purchase_themes_pack", {
        productId: THEMES_PACK_PRODUCT_ID,
      });
      return { owned: Boolean(owned) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      return { owned: false, message };
    }
  }

  // Respaldo de desarrollo (navegador / sin StoreKit).
  return { owned: true };
}

/**
 * Restaura compras de Apple (obligatorio en App Store).
 */
export async function restoreThemePurchases(): Promise<ThemeIapResult> {
  if (isTauri()) {
    try {
      const owned = await invoke<boolean>("restore_theme_purchases", {
        productId: THEMES_PACK_PRODUCT_ID,
      });
      return { owned: Boolean(owned) };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      return { owned: false, message };
    }
  }

  return { owned: false, message: "restore_unavailable" };
}
