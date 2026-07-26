/**
 * Modo de iluminación — Claro / Oscuro / Auto (tokens de UI globales).
 */
export type ThemeMode = "light" | "dark" | "auto";

/** Modo ya resuelto — nunca "auto". */
export type ResolvedMode = "light" | "dark";

export const themeModeOptions: ThemeMode[] = ["light", "dark", "auto"];

export function isValidThemeMode(value: string | null): value is ThemeMode {
  return themeModeOptions.includes(value as ThemeMode);
}

/**
 * @deprecated El catálogo vive en `src/store/themeStore.ts` (`THEME_CATALOG`).
 * Se mantiene el tipo mínimo por compatibilidad con `ModeSegmentedControl`.
 */
export type Theme = string;
