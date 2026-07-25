import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { themeModeOptions, type ResolvedMode, type ThemeMode } from "../types/theme";

type ModeSegmentedControlProps = {
  mode: ThemeMode;
  /** El modo ya resuelto ("auto" nunca llega aquí). */
  resolvedMode: ResolvedMode;
  onChange: (mode: ThemeMode) => void;
  groupLabel: string;
  labels: Record<ThemeMode, string>;
};

const MODE_ICONS: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
};

/**
 * Segmented control premium — Claro / Oscuro / Sistema.
 * Inactivo: transparente. Activo: píldora sólida contrastante + icono.
 */
export default function ModeSegmentedControl({
  mode,
  resolvedMode,
  onChange,
  groupLabel,
  labels,
}: ModeSegmentedControlProps) {
  const isDark = resolvedMode === "dark";

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="inline-flex items-center gap-1 rounded-full p-1"
    >
      {themeModeOptions.map((option) => {
        const Icon = MODE_ICONS[option];
        const isActive = option === mode;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={[
              "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs tracking-wide",
              "transition-all duration-300 ease-in-out active:scale-95",
              isActive
                ? [
                    "font-semibold shadow-sm",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
                  ].join(" ")
                : [
                    "bg-transparent font-medium",
                    isDark
                      ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      : "text-gray-500 hover:bg-black/[0.04] hover:text-gray-700",
                  ].join(" "),
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>{labels[option]}</span>
          </button>
        );
      })}
    </div>
  );
}
