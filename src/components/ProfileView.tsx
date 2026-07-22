import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Gauge,
  KeyRound,
  Languages,
  Lock,
  Palette,
  RotateCcw,
  ScrollText,
  Sparkles,
  User,
  Waves,
  Zap,
} from "lucide-react";
import { useAppStore } from "../hooks/useAppStore";
import { languageOptions } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import { useLicense } from "../i18n/LicenseContext";
import { hardResetLocalData } from "../lib/devReset";
import { VAULT_KEYS } from "../lib/vaultKeys";
import { UI_SPEED_DURATION_MS, uiSpeedIds, type UiSpeed } from "../types/uiSpeed";

export type SubscriptionPlan = "basic" | "pro";

type ProfileViewProps = {
  onExit: () => void;
  /** `null` mientras la Bóveda de Titanio no tiene nombre guardado — ver Misión 1/3 de `DashboardLayout.tsx`. */
  userName: string | null;
  onSaveName: (name: string) => void;
  userCode: string;
  subscriptionPlan: SubscriptionPlan;
  onUpgradeClick: () => void;
  profileImage: string | null;
  onProfileImageChange: (image: string | null) => void;
  uiSpeed: UiSpeed;
  onUiSpeedChange: (speed: UiSpeed) => void;
  /** Navega al Showroom de Apariencia (`ThemeView`) — ver Misión 2/3. */
  onOpenThemeView: () => void;
};

const UI_SPEED_ICONS: Record<UiSpeed, typeof Zap> = {
  fast: Zap,
  smooth: Waves,
  luxury: Sparkles,
};

/**
 * Vista completa del perfil (ya no un modal): "Cuenta" (identidad, avatar,
 * suscripción) y "Preferencias de Interfaz" (idioma, velocidad de interfaz —
 * "El Inyector de Lujo" — y el acceso al Showroom de Apariencia, donde ahora
 * viven el tema base y el color de acento, ver `ThemeView.tsx`). Se entra
 * únicamente desde el avatar del Header (ver `DashboardLayout.tsx`) y
 * `onExit` regresa siempre al Dashboard.
 */
export default function ProfileView({
  onExit,
  userName,
  onSaveName,
  userCode,
  subscriptionPlan,
  onUpgradeClick,
  profileImage,
  onProfileImageChange,
  uiSpeed,
  onUiSpeedChange,
  onOpenThemeView,
}: ProfileViewProps) {
  const { dict, language, setLanguage } = useLanguage();
  const { isPremium, redeemLicense } = useLicense();
  const [draftName, setDraftName] = useState(userName ?? "");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BYOK — "Credenciales de Inteligencia Cognitiva": vive en la Bóveda
  // (`VAULT_KEYS.cognitiveApiKey`). El draft local permite editar sin
  // tocar disco hasta "Guardar Credencial".
  const {
    value: storedApiKey,
    setValue: setStoredApiKey,
    isLoading: isApiKeyLoading,
  } = useAppStore<string>(VAULT_KEYS.cognitiveApiKey, "");
  const [draftApiKey, setDraftApiKey] = useState("");
  const [credentialSaved, setCredentialSaved] = useState(false);

  // God Mode — código VIP (`EXCELLENCE-VIP`).
  const [licenseCode, setLicenseCode] = useState("");
  const [licenseError, setLicenseError] = useState(false);
  const [showVipToast, setShowVipToast] = useState(false);

  useEffect(() => {
    setDraftName(userName ?? "");
  }, [userName]);

  useEffect(() => {
    if (!isApiKeyLoading) {
      setDraftApiKey(storedApiKey);
    }
  }, [storedApiKey, isApiKeyLoading]);

  const trimmedUserName = userName?.trim() ?? "";
  const hasUserName = trimmedUserName.length > 0;
  const isNameDirty =
    draftName.trim().length > 0 && draftName.trim() !== trimmedUserName;

  // `.premium-btn` / `.glow-card` (ver `index.css`) ya declaran su propia
  // duración fija vía `transition: ... 0.2s/0.3s`, así que una clase
  // Tailwind `duration-*` no tiene garantía de ganarles en la cascada. Un
  // estilo en línea sí gana siempre — es la forma fiable de que todos los
  // selectores y botones de esta vista respeten el `uiSpeed` actual.
  const transitionStyle = { transitionDuration: `${UI_SPEED_DURATION_MS[uiSpeed]}ms` };

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

  const isApiKeyDirty = draftApiKey.trim() !== storedApiKey.trim();

  const handleSaveCredential = () => {
    if (!isPremium) return;
    setStoredApiKey(draftApiKey.trim());
    setCredentialSaved(true);
    window.setTimeout(() => setCredentialSaved(false), 2200);
  };

  const handleRedeemLicense = async () => {
    setLicenseError(false);
    const ok = await redeemLicense(licenseCode);
    if (!ok) {
      setLicenseError(true);
      return;
    }
    setLicenseCode("");
    setShowVipToast(true);
    window.setTimeout(() => setShowVipToast(false), 3800);
  };

  /** Sube la foto con `URL.createObjectURL` — sin backend, 100% local. Revoca la anterior para no filtrar memoria. */
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite volver a elegir el mismo archivo más adelante

    if (!file) return;
    if (profileImage?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImage);
    }
    onProfileImageChange(URL.createObjectURL(file));
  };

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-8">
      {/* Toast VIP — Silent Luxury, efímero, sin ruido comercial. */}
      {showVipToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-950/95 px-5 py-3 text-sm tracking-wide text-neutral-100 shadow-2xl"
        >
          {dict.profile.licenseVipToast}
        </div>
      )}

      <button
        type="button"
        onClick={onExit}
        style={transitionStyle}
        className="premium-btn flex w-fit items-center gap-2 self-start rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-secondary-foreground transition-all hover:border-primary hover:text-foreground hover:shadow-glow-sm"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {dict.profile.backLabel}
      </button>

      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {dict.profile.title}
      </h2>

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
            {dict.profile.subscriptionLabel}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-card-rest bg-background/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
                <Crown className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {dict.profile.currentPlanLabel}
                </p>
                <p className="mt-0.5 text-base font-semibold text-foreground">
                  {dict.profile.plans[subscriptionPlan]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onUpgradeClick}
              style={transitionStyle}
              className="premium-btn shrink-0 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all hover:border-primary hover:shadow-glow-card"
            >
              {subscriptionPlan === "basic"
                ? dict.profile.upgradeCta
                : dict.profile.manageCta}
            </button>
          </div>
        </div>
      </section>

      {/* ── Sección 2: Licencia de Uso (God Mode) ── */}
      <section className="glow-card p-6">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-icon-muted" strokeWidth={2} />
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {dict.profile.licenseSection}
          </h3>
        </div>

        {isPremium ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4" strokeWidth={2} />
            {dict.profile.licenseActiveLabel}
          </p>
        ) : (
          <div className="mt-4">
            <label
              htmlFor="profile-license-code"
              className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
            >
              {dict.profile.licenseCodeLabel}
            </label>
            <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="profile-license-code"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={licenseCode}
                onChange={(event) => {
                  setLicenseCode(event.target.value);
                  setLicenseError(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleRedeemLicense();
                  }
                }}
                placeholder={dict.profile.licenseCodePlaceholder}
                style={transitionStyle}
                className="w-full min-w-0 rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 font-mono text-sm tracking-wider text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
              />
              <button
                type="button"
                onClick={() => void handleRedeemLicense()}
                disabled={licenseCode.trim().length === 0}
                style={transitionStyle}
                className="premium-btn shrink-0 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-xs font-medium tracking-wide text-primary-foreground uppercase transition-all hover:border-primary hover:shadow-glow-card disabled:cursor-not-allowed disabled:opacity-40"
              >
                {dict.profile.licenseRedeemLabel}
              </button>
            </div>
            {licenseError && (
              <p className="mt-2 text-xs text-rose-400/90">
                {dict.profile.licenseInvalidLabel}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Sección 3: BYOK — Credenciales (candado financiero si !Pro) ── */}
      <section className="glow-card relative overflow-hidden p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-icon-muted" strokeWidth={2} />
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {dict.profile.credentialsSection}
          </h3>
        </div>

        <div
          className={[
            "mt-4 transition-all duration-300",
            isPremium ? "" : "pointer-events-none select-none blur-sm opacity-40",
          ].join(" ")}
          aria-hidden={!isPremium}
        >
          <label
            htmlFor="profile-api-key"
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {dict.profile.apiKeyLabel}
          </label>
          <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="profile-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draftApiKey}
              onChange={(event) => setDraftApiKey(event.target.value)}
              placeholder={dict.profile.apiKeyPlaceholder}
              disabled={isApiKeyLoading || !isPremium}
              tabIndex={isPremium ? 0 : -1}
              style={transitionStyle}
              className="w-full min-w-0 rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSaveCredential}
              disabled={!isPremium || !isApiKeyDirty || isApiKeyLoading}
              tabIndex={isPremium ? 0 : -1}
              style={transitionStyle}
              className="premium-btn shrink-0 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-xs font-medium tracking-wide text-primary-foreground uppercase transition-all hover:border-primary hover:shadow-glow-card disabled:cursor-not-allowed disabled:opacity-40"
            >
              {dict.profile.saveCredentialLabel}
            </button>
          </div>
          {credentialSaved && (
            <p className="mt-2 text-xs text-primary">
              {dict.profile.credentialSavedLabel}
            </p>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {dict.profile.credentialsDisclaimer}
          </p>
        </div>

        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/55 px-6 text-center backdrop-blur-[2px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-card-rest bg-card text-muted-foreground">
              <Lock className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground">
              {dict.profile.credentialsLockedLabel}
            </p>
          </div>
        )}
      </section>

      {/* ── Sección 4: Preferencias de Interfaz ── */}
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/60 bg-primary text-primary-foreground shadow-glow-sm">
            <Palette className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-wide text-primary">
              {dict.profile.customizeButton}
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

        <div className="my-5 h-px bg-card-rest" />

        {/* Velocidad de interfaz — "El Inyector de Lujo" */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-icon-muted" strokeWidth={2} />
            <span className="text-sm font-medium text-secondary-foreground">
              {dict.profile.uiSpeedLabel}
            </span>
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={dict.profile.uiSpeedLabel}
          >
            {uiSpeedIds.map((speed) => {
              const isActive = uiSpeed === speed;
              const Icon = UI_SPEED_ICONS[speed];
              return (
                <button
                  key={speed}
                  type="button"
                  onClick={() => onUiSpeedChange(speed)}
                  aria-pressed={isActive}
                  style={transitionStyle}
                  className={[
                    "premium-btn flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary-soft text-primary shadow-glow-sm"
                      : "border-card-rest text-secondary-foreground hover:border-primary hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {dict.profile.uiSpeedOptions[speed]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modo Dev — reseteo duro de datos locales (solo en desarrollo). */}
      {import.meta.env.DEV && (
        <section className="glow-card border border-rose-400/20 p-6">
          <h3 className="text-xs font-medium tracking-wider text-rose-300/80 uppercase">
            {dict.profileDev.toolsTitle}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {dict.profileDev.toolsBody}
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(dict.profileDev.resetConfirm)) {
                void hardResetLocalData();
              }
            }}
            className="premium-btn mt-4 flex items-center gap-2 rounded-lg border border-rose-400/35 px-3 py-2 text-xs font-medium tracking-wide text-rose-300 uppercase transition-colors hover:border-rose-300/60 hover:text-rose-200"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.profileDev.resetButton}
          </button>
        </section>
      )}
    </div>
  );
}
