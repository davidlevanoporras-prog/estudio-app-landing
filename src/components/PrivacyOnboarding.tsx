import { useLayoutEffect, useState } from "react";
import { HardDrive, ImageIcon, ShieldCheck } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { persistPrivacyAccepted } from "../lib/privacyModal";

export {
  PRIVACY_MODAL_STORAGE_KEY,
  readPrivacyAccepted,
  persistPrivacyAccepted,
  clearPrivacyModalFlag,
} from "../lib/privacyModal";

/** @deprecated Usar `PRIVACY_MODAL_STORAGE_KEY`. */
export { PRIVACY_MODAL_STORAGE_KEY as PRIVACY_ONBOARDING_STORAGE_KEY } from "../lib/privacyModal";
/** @deprecated Usar `PRIVACY_MODAL_STORAGE_KEY`. */
export { PRIVACY_MODAL_STORAGE_KEY as PRIVACY_ACCEPTED_STORAGE_KEY } from "../lib/privacyModal";

type PrivacyOnboardingProps = {
  /** Persiste el consentimiento y desbloquea el resto de la app. */
  onAccept: () => void;
};

/**
 * Modal de permisos / privacidad al primer inicio.
 * Glassmorphic; se muestra si `hasSeenPrivacyModal` no es `"true"`.
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
      icon: ImageIcon,
      title: copy.photosTitle,
      body: copy.photosBody,
    },
    {
      icon: HardDrive,
      title: copy.storageTitle,
      body: copy.storageBody,
    },
  ] as const;

  const handleAccept = () => {
    persistPrivacyAccepted();
    onAccept();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-onboarding-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl"
    >
      <div
        className={[
          "glow-card photo-glass-panel w-[92%] max-w-lg border border-card-rest p-6 shadow-2xl transition-all duration-700 ease-out sm:w-full sm:p-8",
          "bg-card/90 backdrop-blur-md",
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
        <p className="mt-3 text-center text-sm leading-relaxed text-secondary-foreground">
          {copy.intro}
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

        <div className="mt-6 flex gap-3 rounded-xl border border-card-rest bg-background/30 px-4 py-3">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.privacyNote}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          className="touch-target premium-btn mt-8 w-full rounded-lg border border-primary/60 bg-primary px-5 py-3 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
        >
          {copy.cta}
        </button>
      </div>
    </div>
  );
}
