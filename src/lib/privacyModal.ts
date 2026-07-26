/** Clave canónica — primer lanzamiento (spec App Store / iOS). */
export const PRIVACY_MODAL_STORAGE_KEY = "hasSeenPrivacyModal";

/** Claves legacy — se migran a `hasSeenPrivacyModal`. */
const LEGACY_PRIVACY_KEYS = [
  "hasSeenPrivacyOnboarding",
  "privacyAccepted",
] as const;

/** `true` si el usuario ya cerró el modal de privacidad. */
export function readPrivacyAccepted(): boolean {
  try {
    if (localStorage.getItem(PRIVACY_MODAL_STORAGE_KEY) === "true") {
      return true;
    }
    for (const legacy of LEGACY_PRIVACY_KEYS) {
      if (localStorage.getItem(legacy) === "true") {
        localStorage.setItem(PRIVACY_MODAL_STORAGE_KEY, "true");
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/** Guarda `hasSeenPrivacyModal = true`. */
export function persistPrivacyAccepted(): void {
  try {
    localStorage.setItem(PRIVACY_MODAL_STORAGE_KEY, "true");
  } catch {
    // Si falla el storage, el modal puede reaparecer; no bloqueamos el CTA.
  }
}

/** Borra la bandera (p. ej. al borrar datos locales). */
export function clearPrivacyModalFlag(): void {
  try {
    localStorage.removeItem(PRIVACY_MODAL_STORAGE_KEY);
    for (const legacy of LEGACY_PRIVACY_KEYS) {
      localStorage.removeItem(legacy);
    }
  } catch {
    /* ignore */
  }
}
