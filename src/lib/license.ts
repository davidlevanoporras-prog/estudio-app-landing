import { getVaultValue, isVaultAvailable, setAndPersist } from "./appStore";
import { VAULT_KEYS } from "./vaultKeys";

/**
 * "God Mode" — código VIP del MVP. Exacto, case-sensitive, sin espacios
 * laterales (el consumidor hace `trim()` antes de comparar).
 */
export const VIP_LICENSE_CODE = "EXCELLENCE-VIP";

/** Fallback de navegador cuando no hay shell Tauri — misma semántica que la Bóveda. */
const BROWSER_FALLBACK_KEY = "estudio-is-premium";

/** Lectura de `isPremium`. Nunca lanza. Por defecto `false`. */
export async function loadIsPremium(): Promise<boolean> {
  const fromVault = await getVaultValue<boolean>(VAULT_KEYS.isPremium);
  if (typeof fromVault === "boolean") return fromVault;

  if (!isVaultAvailable()) {
    try {
      return localStorage.getItem(BROWSER_FALLBACK_KEY) === "true";
    } catch {
      return false;
    }
  }

  return false;
}

/** Persistencia inmediata en Bóveda (o localStorage en navegador). */
export async function saveIsPremium(value: boolean): Promise<void> {
  if (isVaultAvailable()) {
    await setAndPersist(VAULT_KEYS.isPremium, value);
    return;
  }

  try {
    localStorage.setItem(BROWSER_FALLBACK_KEY, value ? "true" : "false");
  } catch {
    /* private mode — el flag vive solo en RAM esta sesión */
  }
}

/** `true` si el código (ya recortado) desbloquea God Mode. */
export function isValidVipCode(code: string): boolean {
  return code === VIP_LICENSE_CODE;
}
