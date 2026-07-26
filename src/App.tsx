import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import DashboardLayout from "./components/DashboardLayout";
import OnboardingView from "./components/OnboardingView";
import PrivacyOnboardingModal, {
  persistPrivacyAccepted,
  readPrivacyAccepted,
} from "./components/PrivacyOnboardingModal";
import SplashScreenView from "./components/SplashScreenView";
import { useAppStore } from "./hooks/useAppStore";
import { VAULT_KEYS } from "./lib/vaultKeys";
import { useFlashcardStore } from "./store/flashcardStore";
import { useThemeStore } from "./store/themeStore";
import Landing from "./landing";

/**
 * "Secuencia de Arranque Cinematográfica": duración exacta del telón de
 * suspenso — debe calzar con las animaciones CSS `splash-veil-fade` /
 * `splash-text-fade` de `src/index.css`.
 */
const SPLASH_DURATION_MS = 5000;

/**
 * Shell de escritorio (Tauri): splash → privacy → onboarding/dashboard.
 * El usuario nativo nunca ve la Landing de marketing.
 */
function DesktopApp() {
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

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  // TODO(unify-vault): flashcardStore solo marca boot ready + canal
  // secundario (`excellence_vault.json`). Mazos UI = deckStore / app_data.dat.
  useEffect(() => {
    void useFlashcardStore.getState().initStore();
  }, []);

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

  if (showSplash) {
    return <SplashScreenView />;
  }

  if (isBootstrapping) {
    return <div className="fixed inset-0 bg-black" aria-hidden="true" />;
  }

  if (!privacyAccepted) {
    return <PrivacyOnboardingModal onAccept={handlePrivacyAccept} />;
  }

  if (hasUserName) {
    return (
      <DashboardLayout
        userName={(userName as string).trim()}
        onUserNameChange={setUserName}
      />
    );
  }

  return <OnboardingView onComplete={setUserName} />;
}

/**
 * Enrutamiento híbrido Web vs Desktop:
 * - Tauri → Dashboard interno (nunca Landing).
 * - Browser → Landing de marketing en `/`.
 *
 * Providers i18n/licencia viven en `main.tsx` y envuelven ambos shells.
 */
export default function App() {
  if (isTauri()) {
    return <DesktopApp />;
  }

  return <Landing />;
}
