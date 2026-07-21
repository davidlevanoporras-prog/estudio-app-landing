import { create } from "zustand";
import { saveIsPremium } from "../lib/license";

const USER_PRO_KEY = "excellence-user-is-pro";
const USER_LICENSE_KEY = "excellence-user-license-key";

function readPersistedPro(): boolean {
  try {
    return localStorage.getItem(USER_PRO_KEY) === "true";
  } catch {
    return false;
  }
}

function readPersistedLicense(): string | null {
  try {
    return localStorage.getItem(USER_LICENSE_KEY);
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

export const useUserStore = create<UserStoreState>((set) => ({
  isPro: readPersistedPro(),
  licenseKey: readPersistedLicense(),

  activatePro: async (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem(USER_PRO_KEY, "true");
      localStorage.setItem(USER_LICENSE_KEY, trimmed);
    } catch (error) {
      console.error("[userStore] No se pudo persistir la licencia:", error);
    }

    // Mantiene compatibilidad con el gate Pro existente (temas, BYOK, nav).
    await saveIsPremium(true);

    set({ isPro: true, licenseKey: trimmed });
  },

  deactivatePro: () => {
    try {
      localStorage.removeItem(USER_PRO_KEY);
      localStorage.removeItem(USER_LICENSE_KEY);
    } catch {
      /* ignore */
    }
    set({ isPro: false, licenseKey: null });
  },
}));
