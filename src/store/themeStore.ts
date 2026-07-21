import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";

/** Bóveda de apariencia — tema + modo de iluminación. */
const THEME_DB_FILE = "theme.bin";
const CURRENT_THEME_KEY = "current-theme";
const THEME_MODE_KEY = "theme-mode";

/** Iluminación del tema predeterminado. `auto` sigue al SO. */
export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedMode = "light" | "dark";

export const THEME_MODE_OPTIONS: readonly ThemeMode[] = [
  "light",
  "dark",
  "auto",
];

export function isValidThemeMode(value: string | null): value is ThemeMode {
  return THEME_MODE_OPTIONS.includes(value as ThemeMode);
}

/**
 * Configuración de un entorno visual.
 * El acento NO vive aquí: lo impone el Color de Acento global.
 */
export interface ThemeConfig {
  id: string;
  name: string;
  isPremium: boolean;
  hasImage: boolean;
  backgroundImage?: string;
}

/** Acento por defecto cuando el usuario aún no eligió uno. */
export const DEFAULT_ACCENT_HEX = "#7A5B51";

/**
 * Catálogo: 1 Interfaz Clásica (gratis) + 5 Entornos Fotográficos (Premium).
 */
export const THEME_CATALOG: readonly ThemeConfig[] = [
  {
    id: "tema-predeterminado",
    name: "Interfaz Clásica",
    isPremium: false,
    hasImage: false,
  },
  {
    id: "tema-basalto",
    name: "Basalto",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/tema-basalto.webp",
  },
  {
    id: "tema-niebla",
    name: "Niebla",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/tema-niebla.webp",
  },
  {
    id: "tema-fuji",
    name: "Fuji",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/tema-fuji.webp",
  },
  {
    id: "tema-seda",
    name: "Seda",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/tema-seda.webp",
  },
  {
    id: "tema-sakura",
    name: "Refugio Sakura",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/tema-sakura.webp",
  },
];

export type ThemeId = (typeof THEME_CATALOG)[number]["id"];

const DEFAULT_THEME: ThemeId = "tema-predeterminado";
const DEFAULT_MODE: ThemeMode = "dark";
const THEME_IDS = new Set<string>(THEME_CATALOG.map((theme) => theme.id));

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "premium-dark": "tema-predeterminado",
  "zen-light": "tema-predeterminado",
  "neon-pop": "tema-predeterminado",
  cuervo: "tema-predeterminado",
  zen: "tema-predeterminado",
  pop: "tema-predeterminado",
  obsidiana: "tema-niebla",
  basalto: "tema-basalto",
};

export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.has(value);
}

export function getThemeConfig(id: string): ThemeConfig | undefined {
  return THEME_CATALOG.find((theme) => theme.id === id);
}

export function resolveThemeId(raw: string | null | undefined): ThemeId {
  if (!raw) return DEFAULT_THEME;
  if (isThemeId(raw)) return raw;
  return LEGACY_THEME_MAP[raw] ?? DEFAULT_THEME;
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveThemeMode(
  mode: ThemeMode,
  systemPrefersDark = getSystemPrefersDark(),
): ResolvedMode {
  if (mode === "auto") return systemPrefersDark ? "dark" : "light";
  return mode;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

function normalizeAccent(accentColor: string | null): string {
  if (accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor)) {
    return accentColor;
  }
  return DEFAULT_ACCENT_HEX;
}

/**
 * Inyecta paneles + tipografía + acento global en `<html>`.
 * - Predeterminado: obedece `resolvedMode` (claro/oscuro).
 * - Fotográficos: inmunes al modo — paneles `black/80` + texto claro.
 * - Acento: siempre el del picker (o default wenge).
 */
export function applyThemeAppearance(
  themeId: string,
  resolvedMode: ResolvedMode,
  accentColor: string | null,
): void {
  if (typeof document === "undefined") return;

  const config = getThemeConfig(themeId) ?? getThemeConfig(DEFAULT_THEME)!;
  const accent = normalizeAccent(accentColor);
  const root = document.documentElement;

  root.setAttribute("data-theme", config.id);
  root.setAttribute("data-mode", resolvedMode);
  root.removeAttribute("data-hybrid-theme");

  let panel: string;
  let background: string;
  let text: string;
  let mutedText: string;
  let secondaryText: string;
  let iconMuted: string;
  let primaryForeground: string;

  if (config.hasImage) {
    // Inmunidad fotográfica — ignora themeMode.
    // Vidrio oscuro translúcido: legible bajo luz diurna en móvil, con
    // backdrop-blur aplicado en `index.css` sobre aside/header/.glow-card.
    panel = "rgb(11 13 15 / 0.85)";
    background = "#0B0D0F";
    text = "#F2F0EC";
    mutedText = "rgb(242 240 236 / 0.62)";
    secondaryText = "rgb(242 240 236 / 0.78)";
    iconMuted = "rgb(242 240 236 / 0.5)";
    primaryForeground = "#0B0D0F";
  } else if (resolvedMode === "light") {
    panel = "rgb(255 255 255 / 0.95)";
    background = "#FAFAFA";
    text = "#18181B";
    mutedText = "#52525B";
    secondaryText = "#3F3F46";
    iconMuted = "#71717A";
    primaryForeground = "#FFFFFF";
  } else {
    panel = "rgb(11 13 15 / 0.95)";
    background = "#0B0D0F";
    text = "#F2F0EC";
    mutedText = "rgb(242 240 236 / 0.62)";
    secondaryText = "rgb(242 240 236 / 0.78)";
    iconMuted = "rgb(242 240 236 / 0.5)";
    primaryForeground = "#0B0D0F";
  }

  root.style.setProperty("--cuervo", panel);
  root.style.setProperty("--card", panel);
  root.style.setProperty("--secondary", panel);
  root.style.setProperty("--muted", panel);
  root.style.setProperty("--background", background);

  root.style.setProperty("--foreground", text);
  root.style.setProperty("--card-foreground", text);
  root.style.setProperty("--secondary-foreground", secondaryText);
  root.style.setProperty("--muted-foreground", mutedText);
  root.style.setProperty("--icon-muted", iconMuted);

  // Color de Acento global — todos los temas.
  root.style.setProperty("--primary", accent);
  root.style.setProperty("--wenge", accent);
  root.style.setProperty("--wenge-deep", accent);
  root.style.setProperty("--primary-soft", hexToRgba(accent, 0.12));
  root.style.setProperty("--primary-foreground", primaryForeground);
  root.style.setProperty("--card-border-rest", hexToRgba(accent, 0.18));
  root.style.setProperty("--border", hexToRgba(accent, 0.22));
  root.style.setProperty(
    "--glow-interactive",
    `0 0 14px ${hexToRgba(accent, 0.28)}`,
  );
  root.style.setProperty(
    "--glow-interactive-sm",
    `0 0 10px ${hexToRgba(accent, 0.2)}`,
  );
  root.style.setProperty("--glow-card", "none");
}

let dbConnection: Promise<Store> | null = null;

function connectDb(): Promise<Store> {
  if (!dbConnection) {
    dbConnection = Store.load(THEME_DB_FILE);
  }
  return dbConnection;
}

interface ThemeStoreState {
  currentTheme: ThemeId;
  themeMode: ThemeMode;
  setTheme: (themeId: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  currentTheme: DEFAULT_THEME,
  themeMode: DEFAULT_MODE,

  loadTheme: async () => {
    if (!isTauri()) return;

    try {
      const db = await connectDb();
      const persistedTheme = await db.get<string>(CURRENT_THEME_KEY);
      const persistedMode = await db.get<string>(THEME_MODE_KEY);

      const nextTheme = resolveThemeId(persistedTheme);
      const nextMode: ThemeMode = isValidThemeMode(persistedMode ?? null)
        ? (persistedMode as ThemeMode)
        : persistedMode === "system"
          ? "auto"
          : DEFAULT_MODE;

      set({ currentTheme: nextTheme, themeMode: nextMode });

      if (persistedTheme !== nextTheme) {
        await db.set(CURRENT_THEME_KEY, nextTheme);
      }
      if (persistedMode !== nextMode) {
        await db.set(THEME_MODE_KEY, nextMode);
      }
      await db.save();
    } catch (error) {
      console.error("[themeStore] loadTheme falló:", error);
    }
  },

  setTheme: async (themeId: string) => {
    const next = resolveThemeId(themeId);
    set({ currentTheme: next });

    if (!isTauri()) return;

    try {
      const db = await connectDb();
      await db.set(CURRENT_THEME_KEY, next);
      await db.save();
    } catch (error) {
      console.error("[themeStore] setTheme no pudo persistir:", error);
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    if (!isValidThemeMode(mode)) return;
    set({ themeMode: mode });

    if (!isTauri()) return;

    try {
      const db = await connectDb();
      await db.set(THEME_MODE_KEY, mode);
      await db.save();
    } catch (error) {
      console.error("[themeStore] setThemeMode no pudo persistir:", error);
    }
  },
}));
