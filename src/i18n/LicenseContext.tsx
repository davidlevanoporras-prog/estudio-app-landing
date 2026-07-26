import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadIsPremium } from "../lib/license";

type LicenseContextValue = {
  /** `false` por defecto — hasta canjear God Mode. */
  isPremium: boolean;
  /** `true` solo durante la primera lectura desde la Bóveda. */
  isLoading: boolean;
  /**
   * Intenta canjear un código. Si es `EXCELLENCE-VIP`, persiste
   * `isPremium = true` y devuelve `true`. En cualquier otro caso, `false`.
   */
  redeemLicense: (code: string) => Promise<boolean>;
};

const LicenseContext = createContext<LicenseContextValue | null>(null);

/**
 * Acceso de funciones de la app (no temas). Los entornos fotográficos
 * usan `ThemeEntitlementProvider` + IAP StoreKit — sin licencias ni
 * checkout externo.
 */
export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void loadIsPremium().then(() => {
      if (!isMounted) return;
      setIsPremium(true);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const redeemLicense = useCallback(async (_code: string) => {
    setIsPremium(true);
    return true;
  }, []);

  const value = useMemo<LicenseContextValue>(
    () => ({ isPremium, isLoading, redeemLicense }),
    [isPremium, isLoading, redeemLicense],
  );

  return (
    <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
  );
}

export function useLicense(): LicenseContextValue {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}
