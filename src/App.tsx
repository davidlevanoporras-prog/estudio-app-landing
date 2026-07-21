import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import OnboardingView from "./components/OnboardingView";
import PrivacyOnboarding, {
  persistPrivacyAccepted,
  readPrivacyAccepted,
} from "./components/PrivacyOnboarding";
import SplashScreenView from "./components/SplashScreenView";
import { useAppStore } from "./hooks/useAppStore";
import { LanguageProvider } from "./i18n/LanguageContext";
import { LicenseProvider } from "./i18n/LicenseContext";
import { VAULT_KEYS } from "./lib/vaultKeys";
import { useFlashcardStore } from "./store/flashcardStore";
import { useThemeStore } from "./store/themeStore";

/**
 * "Secuencia de Arranque Cinematográfica": duración exacta del telón de
 * suspenso (Misión 1) — debe calzar con las animaciones CSS
 * `splash-veil-fade` / `splash-text-fade` de `src/index.css`, las mismas
 * que `SplashScreenView.tsx` aplica con esta cifra en milisegundos.
 */
const SPLASH_DURATION_MS = 5000;

/**
 * "El Orquestador de Rutas" (Misión 3): máquina de estados sin router de
 * terceros — las pantallas nunca conviven dos a la vez:
 *
 *   1. `showSplash` — SOLO el telón (Misión 1). En paralelo: tema,
 *      `userName` y `initStore()` de la bóveda física (`excellence_vault.json`).
 *   2. A los 5000ms se espera a que nombre + vault estén listos.
 *   3. Sin `privacyAccepted` en localStorage → `PrivacyOnboarding`.
 *   4. `userName` nulo/vacío → `OnboardingView`; con contenido real →
 *      `DashboardLayout`.
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(readPrivacyAccepted);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const isVaultReady = useFlashcardStore((state) => state.isReady);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setShowSplash(false),
      SPLASH_DURATION_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Fase 4 — hidrata el wallpaper HD desde `theme.bin` en paralelo al Splash.
  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  // Gira la llave: carga `decks` + `flashcards` desde AppData una sola vez.
  useEffect(() => {
    void useFlashcardStore.getState().initStore();
  }, []);

  // Sincronización inteligente: al recuperar el foco, relee el JSON por si
  // iCloud/Drive trajo cambios desde otro dispositivo.
  useEffect(() => {
    const handleFocus = () => {
      void useFlashcardStore.getState().syncWithDisk();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const {
    value: userName,
    setValue: setUserName,
    isLoading: isUserNameLoading,
  } = useAppStore<string | null>(VAULT_KEYS.userName, null);

  const hasUserName = (userName?.trim().length ?? 0) > 0;
  const isBootstrapping = isUserNameLoading || !isVaultReady;

  const handlePrivacyAccept = () => {
    persistPrivacyAccepted();
    setPrivacyAccepted(true);
  };

  return (
    <LanguageProvider>
      <LicenseProvider>
        {showSplash ? (
          <SplashScreenView />
        ) : isBootstrapping ? (
          // Telón negro mientras Rust responde el nombre o el FS hidrata
          // la bóveda — evita montar Dashboard/Onboarding con estado vacío.
          <div className="fixed inset-0 bg-black" aria-hidden="true" />
        ) : !privacyAccepted ? (
          <PrivacyOnboarding onAccept={handlePrivacyAccept} />
        ) : hasUserName ? (
          <DashboardLayout
            userName={(userName as string).trim()}
            onUserNameChange={setUserName}
          />
        ) : (
          <OnboardingView onComplete={setUserName} />
        )}
      </LicenseProvider>
    </LanguageProvider>
  );
}
