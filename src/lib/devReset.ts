/**
 * Reseteo duro de datos locales (Perfil → Privacidad y Datos).
 * Limpia localStorage (incl. `hasSeenPrivacyModal`), IndexedDB de media
 * y recarga — el modal de privacidad vuelve a mostrarse al reiniciar.
 */

import {
  clearPrivacyModalFlag,
  PRIVACY_MODAL_STORAGE_KEY,
} from "./privacyModal";
import { clearUserAvatar, USER_AVATAR_STORAGE_KEY } from "./userAvatar";

const MEDIA_DB_NAME = "estudio-media";

function clearIndexedDb(name: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve();
      return;
    }
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

export async function hardResetLocalData(): Promise<void> {
  // Explícito antes del wipe total — garantiza que el onboarding reaparezca.
  clearPrivacyModalFlag();
  clearUserAvatar();

  try {
    localStorage.removeItem(PRIVACY_MODAL_STORAGE_KEY);
    localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
    localStorage.clear();
  } catch (error) {
    console.error("[devReset] localStorage.clear falló:", error);
  }

  await clearIndexedDb(MEDIA_DB_NAME);

  window.location.reload();
}
