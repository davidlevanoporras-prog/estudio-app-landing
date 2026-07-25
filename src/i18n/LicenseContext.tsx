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
  isValidVipCode,
  loadIsPremium,
  saveIsPremium,
} from "../lib/license";
import { isDevProForced } from "../lib/devPro";

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
 * Estado global de licencia Pro / God Mode. Vive junto a
 * `LanguageProvider` en `App.tsx` para que Sidebar, Perfil y Showroom
 * lean el mismo flag sin prop-drilling.
 */
export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void loadIsPremium().then((value) => {
      if (!isMounted) return;
      // Flag VITE_DEV_PRO: solo en Vite DEV; nunca en producción.
      setIsPremium(value || isDevProForced());
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const redeemLicense = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!isValidVipCode(trimmed)) return false;
    await saveIsPremium(true);
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
