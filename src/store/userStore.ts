import { create } from "zustand";
import { DEV_PRO_LICENSE_KEY, isDevProForced } from "../lib/devPro";
import { saveIsPremium } from "../lib/license";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "../lib/secureStorage";

const USER_PRO_KEY = "excellence-user-is-pro";
const USER_LICENSE_KEY = "excellence-user-license-key";

function readPersistedPro(): boolean {
  try {
    return getSecureItem(USER_PRO_KEY) === "true";
  } catch {
    return false;
  }
}

function readPersistedLicense(): string | null {
  try {
    return getSecureItem(USER_LICENSE_KEY);
  } catch {
    return null;
  }
}

interface UserStoreState {
  isPro: boolean;
  licenseKey: string | null;
  /** Activa Pro en memoria + disco (validación API futura). */
  activatePro: (key: string) => Promise<void>;
  /** Solo para modo desarrollo / tests. */
  deactivatePro: () => void;
}

const bootAsPro = readPersistedPro() || isDevProForced();

export const useUserStore = create<UserStoreState>((set) => ({
  isPro: bootAsPro,
  licenseKey:
    readPersistedLicense() ??
    (isDevProForced() ? DEV_PRO_LICENSE_KEY : null),

  activatePro: async (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return;

    try {
      setSecureItem(USER_PRO_KEY, "true");
      setSecureItem(USER_LICENSE_KEY, trimmed);
    } catch (error) {
      console.error("[userStore] No se pudo persistir la licencia:", error);
    }

    // Mantiene compatibilidad con el gate Pro existente (temas, BYOK, nav).
    await saveIsPremium(true);

    set({ isPro: true, licenseKey: trimmed });
  },

  deactivatePro: () => {
    removeSecureItem(USER_PRO_KEY);
    removeSecureItem(USER_LICENSE_KEY);
    set({ isPro: false, licenseKey: null });
  },
}));
