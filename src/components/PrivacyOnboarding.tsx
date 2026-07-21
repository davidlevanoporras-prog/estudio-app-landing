import { useLayoutEffect, useState } from "react";
import { Archive, KeyRound, ShieldCheck } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export const PRIVACY_ACCEPTED_STORAGE_KEY = "privacyAccepted";

type PrivacyOnboardingProps = {
  /** Persiste el consentimiento y desbloquea el resto de la app. */
  onAccept: () => void;
};

/**
 * Gate obligatorio de Privacidad y Autonomía (App Store / Play Store).
 * Bloquea Onboarding y Dashboard hasta que el usuario acepte; la bandera
 * vive en `localStorage` (`privacyAccepted`) y no vuelve a mostrarse.
 */
export default function PrivacyOnboarding({ onAccept }: PrivacyOnboardingProps) {
  const { dict } = useLanguage();
  const copy = dict.privacyOnboarding;
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    const rafId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  const sections = [
    {
      icon: Archive,
      title: copy.vaultTitle,
      body: copy.vaultBody,
    },
    {
      icon: ShieldCheck,
      title: copy.privacyTitle,
      body: copy.privacyBody,
    },
    {
      icon: KeyRound,
      title: copy.permissionTitle,
      body: copy.permissionBody,
    },
  ] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
    >
      <div
        className={[
          "glow-card w-full max-w-lg p-8 transition-all duration-700 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <h1
          id="privacy-onboarding-title"
          className="text-center text-2xl font-semibold tracking-tight text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {copy.title}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-secondary-foreground">
          {copy.subtitle}
        </p>

        <ul className="mt-8 flex flex-col gap-5">
          {sections.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3.5 text-left">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-background/40 text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide text-foreground">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onAccept}
          className="premium-btn mt-8 w-full rounded-lg border border-primary/60 bg-primary px-5 py-3 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
        >
          {copy.cta}
        </button>
      </div>
    </div>
  );
}

/** Lectura síncrona del consentimiento — usada por `App.tsx` en el primer render. */
export function readPrivacyAccepted(): boolean {
  try {
    return localStorage.getItem(PRIVACY_ACCEPTED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persiste el consentimiento para que el gate no vuelva a aparecer. */
export function persistPrivacyAccepted(): void {
  try {
    localStorage.setItem(PRIVACY_ACCEPTED_STORAGE_KEY, "true");
  } catch {
    // Si el almacenamiento falla, el gate puede reaparecer; no bloqueamos el CTA.
  }
}
