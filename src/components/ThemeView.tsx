import { useState } from "react";
import { ArrowLeft, Check, Lock, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useThemeEntitlement } from "../i18n/ThemeEntitlementContext";
import {
  DEFAULT_ACCENT_HEX,
  getAccentForTheme,
  isFreeSampleTheme,
  isThemeAccessible,
  resolveThemeMode,
  THEME_CATALOG,
  useThemeStore,
  type ThemeConfig,
} from "../store/themeStore";
import type { ResolvedMode } from "../types/theme";
import ModeSegmentedControl from "./ModeSegmentedControl";
import ProUpgradeModal from "./ProUpgradeModal";
import ViewShell from "./ViewShell";

type ThemeViewProps = {
  onExit: () => void;
  /** Modo ya resuelto en el Layout (incluye `auto` → light/dark). */
  resolvedMode: ResolvedMode;
  systemPrefersDark: boolean;
};

function ThemeEcosystemPreview({
  theme,
  resolvedMode,
  accentHex,
}: {
  theme: ThemeConfig;
  resolvedMode: ResolvedMode;
  accentHex: string;
}) {
  const isPhoto = theme.hasImage;
  const panel =
    isPhoto
      ? "rgb(11 13 15 / 0.85)"
      : resolvedMode === "light"
        ? "rgb(255 255 255 / 0.95)"
        : "rgb(11 13 15 / 0.95)";
  const text =
    isPhoto || resolvedMode === "dark" ? "#F2F0EC" : "#18181B";
  const canvas =
    isPhoto && theme.backgroundImage
      ? undefined
      : resolvedMode === "light"
        ? "#FAFAFA"
        : "#0B0D0F";

  return (
    <div
      className="relative flex h-28 overflow-hidden rounded-lg border border-white/10 bg-cover bg-center bg-no-repeat"
      style={
        isPhoto && theme.backgroundImage
          ? {
              backgroundImage: `url(${theme.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : { backgroundColor: canvas }
      }
    >
      <div
        className="relative z-10 m-2 flex flex-1 flex-col justify-between rounded-md p-2.5"
        style={{
          backgroundColor: panel,
          border: `1px solid color-mix(in srgb, ${accentHex} 28%, transparent)`,
          ...(isPhoto
            ? {
                WebkitBackdropFilter: "blur(12px)",
                backdropFilter: "blur(12px)",
              }
            : {}),
        }}
      >
        <p
          className="truncate text-[11px] font-medium tracking-wide"
          style={{ color: text }}
        >
          {theme.name}
        </p>
        <div className="flex gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-white/15"
            style={{ backgroundColor: isPhoto ? "#0B0D0F" : canvas }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-white/15"
            style={{ backgroundColor: accentHex }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-white/15"
            style={{ backgroundColor: text }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Showroom: Interfaz Clásica + entornos fotográficos.
 * Acento persistente por tema (`themeAccents[themeId]`).
 */
export default function ThemeView({
  onExit,
  resolvedMode,
  systemPrefersDark,
}: ThemeViewProps) {
  const { dict } = useLanguage();
  const { hasThemesPack } = useThemeEntitlement();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeMode = useThemeStore((state) => state.themeMode);
  const themeAccents = useThemeStore((state) => state.themeAccents);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);

  const accentSwatch = getAccentForTheme(themeAccents, currentTheme);
  const hasCustomAccent =
    accentSwatch.toLowerCase() !== DEFAULT_ACCENT_HEX.toLowerCase();
  // Preview del control: si Auto, sigue al SO; si no, al modo elegido.
  const controlResolved =
    themeMode === "auto"
      ? resolveThemeMode("auto", systemPrefersDark)
      : resolvedMode;

  return (
    <>
    <ViewShell
      className="mx-auto max-w-4xl"
      bodyClassName="flex flex-col gap-8 pb-16 md:pb-24"
      header={
        /* Cabecera protectora: mismo cristal que el resto del Showroom. */
        <section className="glow-card rounded-2xl p-6">
          <button
            type="button"
            onClick={onExit}
            className="premium-btn mb-4 flex w-fit items-center gap-2 self-start rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-secondary-foreground transition-all duration-300 hover:border-primary hover:text-foreground hover:shadow-glow-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {dict.themeView.backLabel}
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {dict.themeView.title}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {dict.themeView.subtitle}
              </p>
            </div>

            <ModeSegmentedControl
              mode={themeMode}
              resolvedMode={controlResolved}
              onChange={(mode) => void setThemeMode(mode)}
              groupLabel={dict.themeView.modeGroupLabel}
              labels={{
                light: dict.themeView.modeOptions.light,
                dark: dict.themeView.modeOptions.dark,
                auto: dict.themeView.modeOptions.system,
              }}
            />
          </div>
        </section>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {THEME_CATALOG.map((theme) => {
          const isActive = currentTheme === theme.id;
          const isLocked = !isThemeAccessible(theme, hasThemesPack);
          const isSample = isFreeSampleTheme(theme.id);
          const showFreeBadge = isSample && !hasThemesPack && !isLocked;
          const showProBadge = theme.isPremium && !isLocked && !showFreeBadge;
          const themeAccent = getAccentForTheme(themeAccents, theme.id);

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                if (isLocked) {
                  setShowUpgradeModal(true);
                  return;
                }
                void setTheme(theme.id);
              }}
              aria-pressed={isActive}
              aria-disabled={isLocked}
              aria-label={
                isLocked
                  ? `${theme.name} — ${dict.paywall.themeLockedLabel}`
                  : `${dict.themeView.selectLabel}: ${theme.name}`
              }
              className={[
                "glow-card group relative flex flex-col gap-3 p-4 text-left transition-all duration-300",
                isActive && !isLocked ? "border-primary shadow-glow-card" : "",
                isLocked ? "cursor-pointer" : "",
              ].join(" ")}
              style={
                isActive && !isLocked
                  ? { boxShadow: "var(--glow-interactive)" }
                  : undefined
              }
            >
              <div className={isLocked ? "opacity-50 blur-sm" : undefined}>
                <ThemeEcosystemPreview
                  theme={theme}
                  resolvedMode={resolvedMode}
                  accentHex={themeAccent}
                />
              </div>

              {isLocked && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-950/80 text-neutral-300 shadow-2xl">
                    <Lock className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                    {dict.paywall.themeLockedLabel}
                  </span>
                </div>
              )}

              <div
                className={[
                  "flex items-center justify-between gap-2",
                  isLocked ? "opacity-50" : "",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {theme.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {theme.hasImage
                      ? "Entorno fotográfico"
                      : "Sin imagen de fondo"}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {showFreeBadge && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400 uppercase">
                      Free
                    </span>
                  )}
                  {showProBadge && (
                    <span className="rounded-full border border-primary/40 bg-primary-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                      Pro
                    </span>
                  )}
                  {isActive && !isLocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      {dict.themeView.selectedLabel}
                    </span>
                  ) : !isLocked && !theme.isPremium ? (
                    <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {dict.themeView.selectLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <section className="glow-card shrink-0 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-icon-muted" strokeWidth={2} />
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {dict.profile.accentColorLabel}
          </h3>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {dict.profile.accentColorDescription}
          </p>

          <div className="flex shrink-0 items-center gap-3">
            {hasCustomAccent && (
              <button
                type="button"
                onClick={() => setAccentColor(null)}
                aria-label={dict.profile.accentColorResetLabel}
                title={dict.profile.accentColorResetLabel}
                className="premium-btn flex h-11 w-11 items-center justify-center rounded-lg border border-card-rest text-icon-muted transition-all duration-300 hover:border-primary hover:text-primary"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
              </button>
            )}

            <div className="relative">
              <input
                type="color"
                value={accentSwatch}
                onChange={(event) => setAccentColor(event.target.value)}
                aria-label={dict.profile.accentColorLabel}
                className="h-11 w-20 cursor-pointer rounded-xl border-2 border-card-rest bg-transparent p-1 shadow-glow-sm transition-all duration-300 hover:border-primary hover:shadow-glow-card [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:rounded-lg [&::-webkit-color-swatch-wrapper]:p-0"
              />
            </div>
          </div>
        </div>
      </section>
    </ViewShell>

    {showUpgradeModal && (
      <ProUpgradeModal
        onClose={() => setShowUpgradeModal(false)}
        onOpenStore={onExit}
      />
    )}
    </>
  );
}
