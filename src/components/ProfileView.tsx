import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Languages,
  Lock,
  Palette,
  RotateCcw,
  User,
} from "lucide-react";
import { languageOptions } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import { useThemeEntitlement } from "../i18n/ThemeEntitlementContext";
import { hardResetLocalData } from "../lib/devReset";
import { fileToAvatarDataUri } from "../lib/userAvatar";
import { useConfirm } from "./ConfirmProvider";
import ViewHeaderCard from "./ViewHeaderCard";
import ViewShell from "./ViewShell";

export type SubscriptionPlan = "basic" | "pro";

type ProfileViewProps = {
  onExit: () => void;
  /** `null` mientras la Bóveda de Titanio no tiene nombre guardado — ver Misión 1/3 de `DashboardLayout.tsx`. */
  userName: string | null;
  onSaveName: (name: string) => void;
  userCode: string;
  subscriptionPlan: SubscriptionPlan;
  profileImage: string | null;
  onProfileImageChange: (image: string | null) => void;
  /** Navega al Showroom de Apariencia (`ThemeView`) — ver Misión 2/3. */
  onOpenThemeView: () => void;
};

/**
 * Vista completa del perfil: "Cuenta", "Tienda de Estudio" (IAP de temas) y
 * "Preferencias de Interfaz" (idioma + acceso al Showroom).
 */
export default function ProfileView({
  onExit,
  userName,
  onSaveName,
  userCode,
  subscriptionPlan: _subscriptionPlan,
  profileImage,
  onProfileImageChange,
  onOpenThemeView,
}: ProfileViewProps) {
  const { dict, language, setLanguage } = useLanguage();
  const {
    hasThemesPack,
    isBusy: isStoreBusy,
    purchaseThemesPack,
    restorePurchases,
  } = useThemeEntitlement();
  const confirm = useConfirm();
  const [draftName, setDraftName] = useState(userName ?? "");
  const [copied, setCopied] = useState(false);
  const [storeFeedback, setStoreFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(userName ?? "");
  }, [userName]);

  const trimmedUserName = userName?.trim() ?? "";
  const hasUserName = trimmedUserName.length > 0;
  const isNameDirty =
    draftName.trim().length > 0 && draftName.trim() !== trimmedUserName;

  const transitionStyle = { transitionDuration: "300ms" };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible — se omite en silencio */
    }
  };

  const handleSaveName = () => {
    if (!isNameDirty) return;
    onSaveName(draftName.trim());
  };

  /** Sube la foto como Data URI Base64 persistente (`excellence_user_avatar`). */
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite volver a elegir el mismo archivo más adelante

    if (!file) return;
    if (profileImage?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage);
    }

    void fileToAvatarDataUri(file)
      .then((dataUri) => {
        onProfileImageChange(dataUri);
      })
      .catch((error) => {
        console.error("[ProfileView] No se pudo guardar el avatar:", error);
      });
  };

  return (
    <ViewShell
      className="mx-auto max-w-3xl"
      header={
        <ViewHeaderCard>
          <button
            type="button"
            onClick={onExit}
            style={transitionStyle}
            className="premium-btn flex w-fit items-center gap-2 self-start rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-secondary-foreground transition-all hover:border-primary hover:text-foreground hover:shadow-glow-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {dict.profile.backLabel}
          </button>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {dict.profile.title}
          </h2>
        </ViewHeaderCard>
      }
      bodyClassName="flex flex-col gap-8 pb-4"
    >
      {/* ── Sección 1: Identidad ── */}
      <section className="glow-card p-6">
        <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.profile.accountSection}
        </h3>

        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar de gran tamaño + "Cambiar Fotografía" debajo */}
          <div className="flex flex-col items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={dict.header.avatarLabel}
                className="h-24 w-24 shrink-0 rounded-full border border-primary object-cover shadow-glow-sm"
              />
            ) : (
              <span
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-3xl font-semibold text-primary-foreground shadow-glow-sm"
                aria-label={dict.header.avatarLabel}
              >
                {hasUserName ? (
                  trimmedUserName.charAt(0).toUpperCase()
                ) : (
                  <User className="h-10 w-10" strokeWidth={2} />
                )}
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={transitionStyle}
              className="premium-btn flex items-center gap-2 rounded-lg border border-card-rest px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:border-primary hover:text-foreground hover:shadow-glow-sm"
            >
              <Camera className="h-3.5 w-3.5" strokeWidth={2} />
              {dict.profile.changePhotoLabel}
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <label
              htmlFor="profile-name"
              className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
            >
              {dict.profile.nameLabel}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="profile-name"
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder={dict.profile.namePlaceholder}
                style={transitionStyle}
                className="w-full min-w-0 rounded-lg border border-card-rest bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
              />
              {isNameDirty && (
                <button
                  type="button"
                  onClick={handleSaveName}
                  style={transitionStyle}
                  className="premium-btn shrink-0 rounded-lg border border-primary/60 bg-primary px-3 py-2 text-xs font-medium tracking-wide text-primary-foreground uppercase transition-all hover:border-primary hover:shadow-glow-card"
                >
                  {dict.profile.saveLabel}
                </button>
              )}
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {dict.profile.codeLabel}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-card-rest bg-background/60 px-3 py-2.5">
                <span className="font-mono text-sm text-secondary-foreground">
                  {userCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label={dict.profile.copyLabel}
                  title={dict.profile.copyLabel}
                  style={transitionStyle}
                  className="premium-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-icon-muted transition-all hover:text-primary hover:shadow-glow-sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              {copied && (
                <p className="mt-1.5 text-xs text-primary">{dict.profile.copiedLabel}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {dict.profile.storeSectionLabel}
          </p>
          <div className="mt-2 rounded-lg border border-card-rest bg-background/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
                <Palette className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground">
                  {dict.profile.storeProductTitle}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dict.profile.storeProductDescription}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {hasThemesPack ? (
                <span
                  className="inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary-soft px-3.5 py-2.5 text-xs font-semibold tracking-wide text-primary"
                  aria-label={dict.profile.themesUnlockedBadge}
                >
                  {dict.profile.themesUnlockedBadge}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isStoreBusy}
                  onClick={() => {
                    setStoreFeedback(null);
                    void purchaseThemesPack().then((ok) => {
                      if (!ok) {
                        setStoreFeedback(dict.profile.purchaseErrorMessage);
                      }
                    });
                  }}
                  style={transitionStyle}
                  className="premium-btn inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-sm transition-all hover:shadow-glow-card disabled:opacity-60 sm:flex-none"
                >
                  {isStoreBusy
                    ? dict.profile.storeBusyLabel
                    : dict.profile.unlockThemesCta}
                </button>
              )}

              <button
                type="button"
                disabled={isStoreBusy}
                onClick={() => {
                  setStoreFeedback(null);
                  void restorePurchases().then((ok) => {
                    if (!ok && !hasThemesPack) {
                      setStoreFeedback(dict.profile.restoreEmptyMessage);
                    }
                  });
                }}
                style={transitionStyle}
                className="inline-flex items-center justify-center rounded-lg border border-card-rest bg-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
              >
                {dict.profile.restorePurchasesCta}
              </button>
            </div>

            {storeFeedback && (
              <p className="mt-2 text-xs text-muted-foreground" role="status">
                {storeFeedback}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Preferencias de Interfaz ── */}
      <section className="glow-card p-6">
        <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.profile.preferencesSection}
        </h3>

        {/* Idioma */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-icon-muted" strokeWidth={2} />
            <span className="text-sm font-medium text-secondary-foreground">
              {dict.profile.languageLabel}
            </span>
          </div>
          <div
            className="flex items-center gap-1 rounded-full border border-card-rest bg-background/60 p-1"
            role="group"
            aria-label={dict.header.languageSelectorLabel}
          >
            {languageOptions.map(({ id, label }) => {
              const isActive = language === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLanguage(id)}
                  aria-pressed={isActive}
                  style={transitionStyle}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="my-5 h-px bg-card-rest" />

        {/* El tema base y el color de acento ahora viven en su propio
            Showroom (`ThemeView.tsx`) — este botón es la única puerta de
            entrada, para que la personalización visual tenga su propio
            espacio "de lujo" en vez de compartir esta vista. */}
        <button
          type="button"
          onClick={onOpenThemeView}
          style={transitionStyle}
          className="premium-btn group flex w-full items-center gap-4 rounded-xl border border-primary/50 bg-primary-soft px-5 py-4 text-left transition-all hover:border-primary hover:shadow-glow-card"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/60 bg-primary text-primary-foreground shadow-glow-sm">
            <Palette className="h-5 w-5" strokeWidth={2} />
            {!hasThemesPack && (
              <span
                className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 bg-background text-muted-foreground"
                aria-hidden
              >
                <Lock className="h-2.5 w-2.5" strokeWidth={2.25} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
              <span>{dict.profile.customizeButton}</span>
              {!hasThemesPack && (
                <Lock
                  className="h-3.5 w-3.5 shrink-0 text-primary/55"
                  strokeWidth={2}
                  aria-label={dict.paywall.themeLockedLabel}
                />
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dict.profile.accentColorDescription}
            </p>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </button>
      </section>

      {/* Privacidad y Datos — borrado local con confirmación. */}
      <section className="glow-card p-6">
        <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.profileDev.toolsTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {dict.profileDev.toolsBody}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void (async () => {
                const ok = await confirm({
                  message: dict.profileDev.resetConfirm,
                  confirmLabel: dict.profileDev.resetButton,
                });
                if (!ok) return;
                await hardResetLocalData();
              })();
            }}
            className="premium-btn flex items-center gap-2 rounded-lg border border-card-rest px-3 py-2 text-xs font-medium tracking-wide text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.profileDev.resetButton}
          </button>
        </div>
      </section>
    </ViewShell>
  );
}
