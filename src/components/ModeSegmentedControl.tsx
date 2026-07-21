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
 * Control Claro / Oscuro / Auto — Silent Luxury.
 * Solo afecta a "Interfaz Clásica"; los entornos fotográficos lo ignoran.
 */
export default function ModeSegmentedControl({
  mode,
  resolvedMode,
  onChange,
  groupLabel,
  labels,
}: ModeSegmentedControlProps) {
  const activeIndex = themeModeOptions.indexOf(mode);
  const isDark = resolvedMode === "dark";

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className={[
        "relative inline-flex items-center rounded-full p-1 transition-colors duration-300",
        isDark
          ? "bg-zinc-900/50 ring-1 ring-white/5"
          : "bg-gray-100 ring-1 ring-black/5",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute inset-y-1 rounded-full transition-transform duration-300 ease-out",
          isDark
            ? "bg-zinc-700 shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
            : "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]",
        ].join(" ")}
        style={{
          left: "0.25rem",
          width: `calc((100% - 0.5rem) / ${themeModeOptions.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

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
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-300",
              isActive
                ? isDark
                  ? "text-zinc-50"
                  : "text-zinc-900"
                : isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-500 hover:text-zinc-700",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
