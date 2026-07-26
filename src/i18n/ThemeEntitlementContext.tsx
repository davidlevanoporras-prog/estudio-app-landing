import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  purchaseThemesPack,
  restoreThemePurchases,
} from "../lib/themeIap";
import { getVaultValue, isVaultAvailable, setAndPersist } from "../lib/appStore";
import { getSecureJSON, setSecureJSON } from "../lib/secureStorage";
import { VAULT_KEYS } from "../lib/vaultKeys";

type ThemeEntitlementContextValue = {
  /** Paquete de temas fotográficos desbloqueado vía IAP. */
  hasThemesPack: boolean;
  isLoading: boolean;
  isBusy: boolean;
  purchaseThemesPack: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
};

const ThemeEntitlementContext =
  createContext<ThemeEntitlementContextValue | null>(null);

const LEGACY_KEY = "estudio-themes-pack-owned";

async function loadOwned(): Promise<boolean> {
  if (isVaultAvailable()) {
    const fromVault = await getVaultValue<boolean>(VAULT_KEYS.themesPackOwned);
    if (typeof fromVault === "boolean") return fromVault;
  }
  try {
    return getSecureJSON<boolean>(LEGACY_KEY) === true;
  } catch {
    return false;
  }
}

async function persistOwned(owned: boolean): Promise<void> {
  if (isVaultAvailable()) {
    await setAndPersist(VAULT_KEYS.themesPackOwned, owned);
    return;
  }
  try {
    setSecureJSON(LEGACY_KEY, owned);
  } catch {
    /* ignore */
  }
}

/**
 * Entitlement del paquete de temas (IAP Apple — no suscripción, no Lemon Squeezy).
 */
export function ThemeEntitlementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hasThemesPack, setHasThemesPack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadOwned().then((owned) => {
      if (!mounted) return;
      setHasThemesPack(owned);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const purchase = useCallback(async () => {
    setIsBusy(true);
    try {
      const result = await purchaseThemesPack();
      if (result.owned) {
        setHasThemesPack(true);
        await persistOwned(true);
        return true;
      }
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsBusy(true);
    try {
      const result = await restoreThemePurchases();
      if (result.owned) {
        setHasThemesPack(true);
        await persistOwned(true);
        return true;
      }
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const value = useMemo<ThemeEntitlementContextValue>(
    () => ({
      hasThemesPack,
      isLoading,
      isBusy,
      purchaseThemesPack: purchase,
      restorePurchases: restore,
    }),
    [hasThemesPack, isLoading, isBusy, purchase, restore],
  );

  return (
    <ThemeEntitlementContext.Provider value={value}>
      {children}
    </ThemeEntitlementContext.Provider>
  );
}

export function useThemeEntitlement(): ThemeEntitlementContextValue {
  const ctx = useContext(ThemeEntitlementContext);
  if (!ctx) {
    throw new Error(
      "useThemeEntitlement must be used within a ThemeEntitlementProvider",
    );
  }
  return ctx;
}
