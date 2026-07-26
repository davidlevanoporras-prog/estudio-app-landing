import { Palette, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useThemeEntitlement } from "../i18n/ThemeEntitlementContext";

type ProUpgradeModalProps = {
  onClose: () => void;
  /** Opcional: navegar al Perfil / Tienda tras cerrar. */
  onOpenStore?: () => void;
};

/**
 * Aviso de contenido premium visual — sin licencias ni checkout externo.
 * La compra real ocurre en Perfil → Tienda de Estudio (StoreKit).
 */
export default function ProUpgradeModal({
  onClose,
  onOpenStore,
}: ProUpgradeModalProps) {
  const { dict } = useLanguage();
  const { hasThemesPack, isBusy, purchaseThemesPack } = useThemeEntitlement();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="glow-card relative w-full max-w-md overflow-hidden border border-card-rest bg-background/90 p-7 backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={dict.proUpgrade.closeLabel}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="relative z-10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/40 bg-primary-soft text-primary">
            <Palette className="h-5 w-5" strokeWidth={1.75} />
          </div>

          <h2
            id="pro-upgrade-title"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            {dict.profile.storeProductTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {dict.profile.storeProductDescription}
          </p>

          {hasThemesPack ? (
            <p className="mt-6 text-sm font-medium text-primary">
              {dict.profile.themesUnlockedBadge}
            </p>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                void purchaseThemesPack().then((ok) => {
                  if (ok) onClose();
                });
              }}
              className="premium-btn mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isBusy
                ? dict.profile.storeBusyLabel
                : dict.profile.unlockThemesCta}
            </button>
          )}

          {onOpenStore && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStore();
              }}
              className="mt-3 w-full text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {dict.profile.storeSectionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
