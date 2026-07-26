import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";

/** Bóveda de apariencia — tema + modo de iluminación. */
const THEME_DB_FILE = "theme.bin";
const CURRENT_THEME_KEY = "current-theme";
const THEME_MODE_KEY = "theme-mode";

/** Acentos por tema (localStorage). Clave legacy: string global único. */
const THEME_ACCENTS_STORAGE_KEY = "estudio-theme-accents";
const LEGACY_ACCENT_STORAGE_KEY = "estudio-accent-color";

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

/** ID exacto de la Interfaz Clásica (sin foto de fondo). */
export const CLASSIC_THEME_ID = "tema-predeterminado" as const;

/**
 * Muestra gratuita freemium: único tema `isPremium` usable sin paquete IAP.
 * El resto de entornos fotográficos requieren `hasThemesPack` / plan Excellence.
 */
export const FREE_SAMPLE_THEME_ID = "tema-bosque-dorado" as const;

/**
 * Catálogo: Interfaz Clásica + entornos fotográficos (`/themes/N.webp`).
 * Las paletas de Modo Claro viven en `LIGHT_THEME_PALETTES` (opcionales).
 */
export const THEME_CATALOG: readonly ThemeConfig[] = [
  {
    id: CLASSIC_THEME_ID,
    name: "Interfaz Clásica",
    isPremium: false,
    hasImage: false,
  },
  {
    id: "tema-refugio-felino",
    name: "Refugio Felino",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/1.webp",
  },
  {
    id: "tema-manantial-esmeralda",
    name: "Manantial Esmeralda",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/2.webp",
  },
  {
    id: "tema-jardin-zen",
    name: "Jardín Zen",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/3.webp",
  },
  {
    id: "tema-biblioteca-infinita",
    name: "Biblioteca Infinita",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/4.webp",
  },
  {
    id: "tema-paseo-lluvioso",
    name: "Paseo Lluvioso",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/5.webp",
  },
  {
    id: "tema-puente-carmesi",
    name: "Puente Carmesí",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/6.webp",
  },
  {
    id: "tema-senda-sakura",
    name: "Senda Sakura",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/7.webp",
  },
  {
    id: "tema-bosque-dorado",
    name: "Bosque Dorado",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/8.webp",
  },
  {
    id: "tema-honor-samurai",
    name: "Honor Samurai",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/9.webp",
  },
  {
    id: "tema-atardecer-romano",
    name: "Atardecer Romano",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/10.webp",
  },
  {
    id: "tema-bastion-lunar",
    name: "Bastión Lunar",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/11.webp",
  },
  {
    id: "tema-mente-cosmica",
    name: "Mente Cósmica",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/12.webp",
  },
  {
    id: "tema-reflejo-astral",
    name: "Reflejo Astral",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/13.webp",
  },
  {
    id: "tema-gambito-medianoche",
    name: "Gambito de Medianoche",
    isPremium: true,
    hasImage: true,
    backgroundImage: "/themes/14.webp",
  },
];

export type ThemeId = (typeof THEME_CATALOG)[number]["id"];

const DEFAULT_THEME: ThemeId = CLASSIC_THEME_ID;
const DEFAULT_MODE: ThemeMode = "dark";
const THEME_IDS = new Set<string>(THEME_CATALOG.map((theme) => theme.id));

/** IDs/aliases antiguos → Interfaz Clásica (catálogo fotográfico regenerado). */
const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "premium-dark": CLASSIC_THEME_ID,
  "zen-light": CLASSIC_THEME_ID,
  "neon-pop": CLASSIC_THEME_ID,
  cuervo: CLASSIC_THEME_ID,
  zen: CLASSIC_THEME_ID,
  pop: CLASSIC_THEME_ID,
  obsidiana: CLASSIC_THEME_ID,
  basalto: CLASSIC_THEME_ID,
  "tema-basalto": CLASSIC_THEME_ID,
  "tema-niebla": CLASSIC_THEME_ID,
  "tema-fuji": CLASSIC_THEME_ID,
  "tema-seda": CLASSIC_THEME_ID,
  "tema-sakura": CLASSIC_THEME_ID,
};
export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.has(value);
}

export function getThemeConfig(id: string): ThemeConfig | undefined {
  return THEME_CATALOG.find((theme) => theme.id === id);
}

/** `true` si el tema es la muestra gratuita (Bosque Dorado). */
export function isFreeSampleTheme(themeId: string): boolean {
  return themeId === FREE_SAMPLE_THEME_ID;
}

/**
 * Acceso freemium a un tema:
 * - Interfaz Clásica (`isPremium: false`) siempre.
 * - Bosque Dorado siempre (Free Sample).
 * - Resto de premium solo con paquete de temas / plan Excellence.
 */
export function isThemeAccessible(
  theme: Pick<ThemeConfig, "id" | "isPremium">,
  hasThemesPack: boolean,
): boolean {
  if (hasThemesPack || !theme.isPremium) return true;
  return isFreeSampleTheme(theme.id);
}

export function resolveThemeId(raw: string | null | undefined): ThemeId {
  if (!raw) return DEFAULT_THEME;
  // Migración: IDs fotográficos antiguos ya no existen en el catálogo.
  if (raw in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[raw]!;
  if (isThemeId(raw)) return raw;
  return DEFAULT_THEME;
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

export function isValidHexColor(value: string | null | undefined): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeAccent(accentColor: string | null): string {
  if (isValidHexColor(accentColor)) return accentColor;
  return DEFAULT_ACCENT_HEX;
}

/** Mapa Tema → Color de Acento hex (`#RRGGBB`). */
export type ThemeAccentsMap = Record<string, string>;

function readLegacyAccent(): string | null {
  if (typeof localStorage === "undefined") return null;
  const legacy = localStorage.getItem(LEGACY_ACCENT_STORAGE_KEY);
  return isValidHexColor(legacy) ? legacy : null;
}

function readThemeAccentsFromStorage(): ThemeAccentsMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(THEME_ACCENTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: ThemeAccentsMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && isValidHexColor(value)) {
        result[id] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function persistThemeAccents(map: ThemeAccentsMap): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEME_ACCENTS_STORAGE_KEY, JSON.stringify(map));
}

/**
 * Garantiza un acento para `themeId`. Primera visita → default (o legacy
 * una sola vez) y persiste. No toca acentos de otros temas.
 */
function ensureAccentForTheme(
  map: ThemeAccentsMap,
  themeId: string,
  legacyFallback: string | null = null,
): { map: ThemeAccentsMap; accent: string; changed: boolean } {
  const existing = map[themeId];
  if (isValidHexColor(existing)) {
    return { map, accent: existing, changed: false };
  }
  const seed = isValidHexColor(legacyFallback)
    ? legacyFallback
    : DEFAULT_ACCENT_HEX;
  const next = { ...map, [themeId]: seed };
  return { map: next, accent: seed, changed: true };
}

/** Acento efectivo de un tema (default si aún no hay entrada). */
export function getAccentForTheme(
  themeAccents: ThemeAccentsMap,
  themeId: string,
): string {
  return normalizeAccent(themeAccents[themeId] ?? null);
}

/**
 * Paletas cromáticas exclusivas por tema + Modo Claro.
 * Solo superficies, tipografía y bordes estructurales.
 *
 * Regla de oro: NUNCA fijar aquí botones primarios, badges activos ni acentos.
 * Esos tokens salen siempre del `accentColor` del usuario (`--primary`).
 */
type LightThemePalette = {
  dataPalette: string;
  /** Tarjetas, modales, búsqueda, paneles de contenido. */
  panel: string;
  /**
   * Sidebar / topbar. Si falta, reutiliza `panel`.
   * Útil en paletas sólidas con chrome distinto a las cards.
   */
  chrome?: string;
  background: string;
  text: string;
  mutedText: string;
  secondaryText: string;
  /** Íconos secundarios / en reposo (no acento de acción). */
  iconMuted: string;
  /** Bordes sutiles del tema; si falta, se derivan del acento del usuario. */
  border?: string;
  /** Superficies 100% opacas: sin blur/vidrio. */
  solid?: boolean;
  /** Sombra estructural de cards (inyecta `--glow-card`). */
  cardShadow?: string;
};

const LIGHT_THEME_PALETTES: Readonly<Record<string, LightThemePalette>> = {
  "tema-refugio-felino": {
    dataPalette: "refugio-felino-light",
    panel: "rgb(250 243 235 / 0.88)",
    background: "#FAF3EB",
    text: "#2D231E",
    mutedText: "#6B5348",
    secondaryText: "#4A3B34",
    iconMuted: "#2D231E",
    border: "rgb(230 208 192 / 0.25)",
  },
  "tema-jardin-zen": {
    dataPalette: "jardin-zen-light",
    panel: "rgb(230 244 241 / 0.85)",
    background: "#E6F4F1",
    text: "#0A2E26",
    mutedText: "#1A4D42",
    secondaryText: "#0F3D33",
    iconMuted: "#0A2E26",
    border: "rgb(178 223 219 / 0.20)",
  },
  "tema-biblioteca-infinita": {
    dataPalette: "biblioteca-infinita-light",
    panel: "rgb(243 236 227 / 0.88)",
    background: "#F3ECE3",
    text: "#2B1D14",
    mutedText: "#6B5348",
    secondaryText: "#4A3428",
    iconMuted: "#2B1D14",
    border: "rgb(212 196 181 / 0.25)",
  },
  "tema-bosque-dorado": {
    dataPalette: "bosque-dorado-light",
    panel: "rgb(248 241 229 / 0.90)",
    background: "#F8F1E5",
    text: "#2C221E",
    mutedText: "#6B5348",
    secondaryText: "#4A3B34",
    iconMuted: "#2C221E",
    border: "rgb(192 106 74 / 0.22)",
  },
  "tema-manantial-esmeralda": {
    dataPalette: "manantial-esmeralda-light",
    panel: "rgb(227 246 242 / 0.90)",
    background: "#E3F6F2",
    text: "#08221C",
    mutedText: "#1A3D34",
    secondaryText: "#0F2E27",
    iconMuted: "#08221C",
    border: "rgb(13 72 58 / 0.35)",
  },
  "tema-puente-carmesi": {
    dataPalette: "puente-carmesi-light",
    panel: "rgb(253 248 242 / 0.88)",
    background: "#FDF8F2",
    text: "#2B1810",
    mutedText: "#5C4033",
    secondaryText: "#3D2418",
    iconMuted: "#2B1810",
    border: "rgb(212 175 55 / 0.15)",
  },
  "tema-honor-samurai": {
    dataPalette: "honor-samurai-light",
    panel: "rgb(226 232 240 / 0.88)",
    background: "#E2E8F0",
    text: "#0F172A",
    mutedText: "#334155",
    secondaryText: "#1E293B",
    iconMuted: "#0F172A",
    border: "rgb(148 163 184 / 0.20)",
  },
  "tema-mente-cosmica": {
    dataPalette: "mente-cosmica-light",
    panel: "rgb(15 23 42 / 0.80)",
    background: "#0F172A",
    text: "#F8FAFC",
    mutedText: "rgb(248 250 252 / 0.62)",
    secondaryText: "rgb(248 250 252 / 0.82)",
    iconMuted: "#F8FAFC",
    border: "rgb(212 175 55 / 0.25)",
  },
  "tema-atardecer-romano": {
    dataPalette: "atardecer-romano-light",
    panel: "rgb(250 240 230 / 0.88)",
    background: "#FAF0E6",
    text: "#2D2421",
    mutedText: "#6B5348",
    secondaryText: "#4A3B34",
    iconMuted: "#2D2421",
    border: "rgb(226 199 184 / 0.20)",
  },
  "tema-paseo-lluvioso": {
    dataPalette: "paseo-lluvioso-light",
    panel: "rgb(15 28 36 / 0.82)",
    background: "#0F1C24",
    text: "#FFFFFF",
    mutedText: "rgb(255 255 255 / 0.62)",
    secondaryText: "rgb(255 255 255 / 0.82)",
    iconMuted: "#FFFFFF",
    border: "rgb(26 54 68 / 0.25)",
  },
  "tema-bastion-lunar": {
    dataPalette: "bastion-lunar-light",
    panel: "rgb(15 23 42 / 0.80)",
    background: "#0F172A",
    text: "#F8FAFC",
    mutedText: "rgb(248 250 252 / 0.62)",
    secondaryText: "rgb(248 250 252 / 0.82)",
    iconMuted: "#F8FAFC",
    border: "rgb(180 83 9 / 0.25)",
  },
  "tema-senda-sakura": {
    dataPalette: "senda-sakura-light",
    panel: "rgb(253 248 245 / 0.88)",
    background: "#FDF8F5",
    text: "#2A2421",
    mutedText: "#6B5E57",
    secondaryText: "#4A403A",
    iconMuted: "#2A2421",
    border: "rgb(232 216 208 / 0.25)",
  },
  /** Cristal tintado — mismo tono que el chrome, translúcido. */
  "tema-reflejo-astral": {
    dataPalette: "reflejo-astral-light",
    panel: "rgb(11 15 25 / 0.80)",
    chrome: "rgb(11 15 25 / 0.80)",
    background: "#0B0F19",
    text: "#F8FAFC",
    mutedText: "#64748B",
    secondaryText: "#94A3B8",
    iconMuted: "#94A3B8",
    border: "rgb(51 65 85 / 0.40)",
  },
  /** Executive Dark Glass — warm stone translúcido + bronce. */
  "tema-gambito-medianoche": {
    dataPalette: "gambito-medianoche-light",
    panel: "rgb(28 25 23 / 0.85)",
    chrome: "rgb(12 10 9 / 0.90)",
    background: "#0C0A09",
    text: "#F5F5F4",
    mutedText: "#78716C",
    secondaryText: "#A8A29E",
    iconMuted: "#A8A29E",
    border: "rgb(120 53 15 / 0.40)",
    cardShadow: "0 10px 25px -5px rgb(0 0 0 / 0.7)",
  },
};

/**
 * Inyecta paneles + tipografía + acento global en `<html>`.
 * Sidebar/Header/Cards consumen tokens de superficie; botones/badges
 * activos usan siempre el Color de Acento del usuario (`--primary`).
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
  const lightPalette =
    resolvedMode === "light" ? LIGHT_THEME_PALETTES[config.id] : undefined;

  root.setAttribute("data-theme", config.id);
  root.setAttribute("data-mode", resolvedMode);
  root.setAttribute("data-has-photo", config.hasImage ? "true" : "false");
  root.setAttribute("data-palette", lightPalette?.dataPalette ?? "default");
  root.removeAttribute("data-hybrid-theme");

  let panel: string;
  let chrome: string;
  let background: string;
  let text: string;
  let mutedText: string;
  let secondaryText: string;
  let iconMuted: string;
  let cardBorderRest: string;
  let border: string;
  let cardShadow = "none";

  // Acento del usuario — siempre dinámico (nunca hardcodeado por tema).
  const primary = accent;
  const primarySoft = hexToRgba(accent, 0.12);
  const primaryForeground =
    resolvedMode === "light" ? "#FFFFFF" : "#0B0D0F";

  if (lightPalette) {
    panel = lightPalette.panel;
    chrome = lightPalette.chrome ?? lightPalette.panel;
    background = lightPalette.background;
    text = lightPalette.text;
    mutedText = lightPalette.mutedText;
    secondaryText = lightPalette.secondaryText;
    iconMuted = lightPalette.iconMuted;
    cardBorderRest = lightPalette.border ?? hexToRgba(accent, 0.18);
    border = lightPalette.border ?? hexToRgba(accent, 0.22);
    cardShadow = lightPalette.cardShadow ?? "none";
  } else if (resolvedMode === "light") {
    panel = "rgb(255 255 255 / 0.95)";
    chrome = panel;
    background = "#FAFAFA";
    text = "#18181B";
    mutedText = "#52525B";
    secondaryText = "#3F3F46";
    iconMuted = "#71717A";
    cardBorderRest = hexToRgba(accent, 0.18);
    border = hexToRgba(accent, 0.22);
  } else {
    panel = "rgb(11 13 15 / 0.95)";
    chrome = panel;
    background = "#0B0D0F";
    text = "#F2F0EC";
    mutedText = "rgb(242 240 236 / 0.62)";
    secondaryText = "rgb(242 240 236 / 0.78)";
    iconMuted = "rgb(242 240 236 / 0.5)";
    cardBorderRest = hexToRgba(accent, 0.18);
    border = hexToRgba(accent, 0.22);
  }

  root.style.setProperty("--cuervo", chrome);
  root.style.setProperty("--card", panel);
  root.style.setProperty("--secondary", panel);
  root.style.setProperty("--muted", panel);
  root.style.setProperty("--background", background);

  root.style.setProperty("--foreground", text);
  root.style.setProperty("--card-foreground", text);
  root.style.setProperty("--secondary-foreground", secondaryText);
  root.style.setProperty("--muted-foreground", mutedText);
  root.style.setProperty("--icon-muted", iconMuted);

  root.style.setProperty("--primary", primary);
  root.style.setProperty("--accent-color", primary);
  root.style.setProperty("--wenge", primary);
  root.style.setProperty("--wenge-deep", primary);
  root.style.setProperty("--primary-soft", primarySoft);
  root.style.setProperty("--primary-foreground", primaryForeground);
  root.style.setProperty("--card-border-rest", cardBorderRest);
  root.style.setProperty("--border", border);
  root.style.setProperty(
    "--glow-interactive",
    `0 0 14px ${hexToRgba(primary, 0.28)}`,
  );
  root.style.setProperty(
    "--glow-interactive-sm",
    `0 0 10px ${hexToRgba(primary, 0.2)}`,
  );
  root.style.setProperty("--glow-card", cardShadow);
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
  /** Acento persistente por ID de tema. */
  themeAccents: ThemeAccentsMap;
  setTheme: (themeId: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** Guarda el acento solo para el tema activo. `null` → default. */
  setAccentColor: (color: string | null) => void;
  loadTheme: () => Promise<void>;
  /** Hidrata `themeAccents` desde localStorage (web + Tauri). */
  loadThemeAccents: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  currentTheme: DEFAULT_THEME,
  themeMode: DEFAULT_MODE,
  themeAccents: {},

  loadThemeAccents: () => {
    const map = readThemeAccentsFromStorage();
    const legacy = readLegacyAccent();
    const currentTheme = get().currentTheme;
    const ensured = ensureAccentForTheme(map, currentTheme, legacy);
    if (ensured.changed) {
      persistThemeAccents(ensured.map);
    }
    if (legacy) {
      localStorage.removeItem(LEGACY_ACCENT_STORAGE_KEY);
    }
    set({ themeAccents: ensured.map });
  },

  loadTheme: async () => {
    if (!isTauri()) {
      get().loadThemeAccents();
      return;
    }

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

      // Acentos + migración del string global legacy → solo el tema activo.
      const legacy = readLegacyAccent();
      const accents = readThemeAccentsFromStorage();
      const ensured = ensureAccentForTheme(accents, nextTheme, legacy);
      if (ensured.changed) {
        persistThemeAccents(ensured.map);
      }
      if (legacy) {
        localStorage.removeItem(LEGACY_ACCENT_STORAGE_KEY);
      }

      set({
        currentTheme: nextTheme,
        themeMode: nextMode,
        themeAccents: ensured.map,
      });

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
    const ensured = ensureAccentForTheme(get().themeAccents, next);
    if (ensured.changed) {
      persistThemeAccents(ensured.map);
    }
    set({ currentTheme: next, themeAccents: ensured.map });

    if (!isTauri()) return;

    try {
      const db = await connectDb();
      await db.set(CURRENT_THEME_KEY, next);
      await db.save();
    } catch (error) {
      console.error("[themeStore] setTheme no pudo persistir:", error);
    }
  },

  setAccentColor: (color: string | null) => {
    const { currentTheme, themeAccents } = get();
    const hex = color === null ? DEFAULT_ACCENT_HEX : normalizeAccent(color);
    const next = { ...themeAccents, [currentTheme]: hex };
    persistThemeAccents(next);
    set({ themeAccents: next });
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
