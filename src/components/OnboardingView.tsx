import { useLayoutEffect, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

type OnboardingViewProps = {
  /**
   * Persiste el nombre en la Bóveda de Titanio Y actualiza el estado
   * global en el mismo movimiento — en la práctica, `setValue` de la única
   * instancia de `useAppStore` que vive en `App.tsx` (Misión 3), así que
   * este componente no sabe nada de `tauri-plugin-store` ni de disco.
   */
  onComplete: (name: string) => void;
};

/**
 * "El Ritual de Iniciación" (Misión 2): pantalla de único uso — solo
 * aparece cuando la Bóveda todavía no tiene un `userName` guardado (ver el
 * enrutamiento de `App.tsx`). Una vez que `onComplete` persiste un nombre
 * real, `App.tsx` deja de renderizar este componente para siempre y pasa
 * al `DashboardLayout`.
 */
export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { dict } = useLanguage();
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Entrada "Silent Luxury": nace invisible y se revela en el siguiente
  // frame — mismo patrón de `isViewVisible` en `DashboardLayout.tsx`, para
  // que el relevo desde el Splash (ya desvanecido) nunca sea un salto seco.
  useLayoutEffect(() => {
    const rafId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onComplete(trimmedName);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/85 p-6 backdrop-blur-xl">
      <form
        onSubmit={handleSubmit}
        className={[
          "glow-card w-full max-w-sm p-8 text-center transition-all duration-700 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {dict.onboarding.heading}
        </h1>
        <p className="mt-2 text-sm text-secondary-foreground">
          {dict.onboarding.subtitle}
        </p>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={dict.onboarding.namePlaceholder}
          aria-label={dict.onboarding.namePlaceholder}
          autoFocus
          className="mt-6 w-full rounded-lg border border-card-rest bg-background/60 px-4 py-3 text-center text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="premium-btn mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary px-5 py-3 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card disabled:pointer-events-none disabled:opacity-40"
        >
          {dict.onboarding.cta}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
