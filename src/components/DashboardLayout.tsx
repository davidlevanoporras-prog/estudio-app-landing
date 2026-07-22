import { useEffect, useLayoutEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarCheck,
  Crosshair,
  Eye,
  EyeOff,
  GraduationCap,
  HandHelping,
  LayoutDashboard,
  Layers,
  Library,
  Lock,
  Menu,
  Puzzle,
  Pause,
  Play,
  RotateCcw,
  Timer,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useLicense } from "../i18n/LicenseContext";
import type { AssistantMode } from "../lib/assistantMemory";
import { loadDecks, saveDecks } from "../lib/deckStore";
import { removeDeckStats } from "../lib/studyStats";
import { loadGlobalTimer, saveGlobalTimer } from "../lib/time";
import type { Deck, StudyCardData } from "../types/deck";
import { createInitialSrsState } from "../utils/spacedRepetition";
import {
  isValidUiSpeed,
  UI_SPEED_DURATION_CLASSES,
  type UiSpeed,
} from "../types/uiSpeed";
import {
  applyThemeAppearance,
  getSystemPrefersDark,
  getThemeConfig,
  resolveThemeMode,
  useThemeStore,
} from "../store/themeStore";
import AnalyticsView from "./AnalyticsView";
import AssistantView from "./AssistantView";
import ChallengesView from "./ChallengesView";
import DashboardHomeView from "./DashboardHomeView";
import DeckEditorView from "./DeckEditorView";
import FlashcardsView from "./FlashcardsView";
import LaboratoryView from "./LaboratoryView";
import ProfileView, { type SubscriptionPlan } from "./ProfileView";
import SourcesView from "./SourcesView";
import StudyView from "./StudyView";
import ThemeView from "./ThemeView";
import TimeAnalyticsView from "./TimeAnalyticsView";
import SimulatorView from "../views/SimulatorView";

type ViewId =
  | "dashboard"
  | "flashcards"
  | "challenges"
  | "analisis"
  | "sources"
  | "simulator"
  | "assistant"
  | "study"
  | "editDeck"
  | "profile"
  | "theme";

/** Rutas del Sidebar que requieren licencia Pro. */
const PREMIUM_NAV_IDS: ReadonlySet<ViewId> = new Set(["assistant"]);

/**
 * Las 3 caras de la pestaña "Análisis": "El Laboratorio" (neuro-métricas —
 * Carga Cognitiva, Índice de Retención, Estabilidad Sináptica y la Curva del
 * Olvido, ver `LaboratoryView.tsx`) es la puerta de entrada por defecto;
 * memoria (aciertos/fallos) y tiempo invertido siguen disponibles como antes.
 */
type AnalyticsTab = "lab" | "performance" | "time";

type NavItem = {
  id: ViewId;
  labelKey:
    | "dashboard"
    | "flashcards"
    | "challenges"
    | "analytics"
    | "sources"
    | "simulator"
    | "assistant";
  icon: LucideIcon;
};

/** Un bloque del menú lateral con su propio encabezado ("Gestión" / "Soporte y Cognición") — Misión 3: "Reordenamiento del Sidebar". */
type NavGroup = {
  titleKey: "groupManagement" | "groupCognition";
  items: NavItem[];
};

const ACCENT_COLOR_STORAGE_KEY = "estudio-accent-color";
const UI_SPEED_STORAGE_KEY = "estudio-ui-speed";
const SESSION_TIME_STORAGE_KEY = "estudio-session-timer";

/**
 * Módulos del Sidebar agrupados en "Gestión" (operativo) y
 * "Soporte y Cognición" (analítico + herramientas).
 */
const navGroups: NavGroup[] = [
  {
    titleKey: "groupManagement",
    items: [
      { id: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { id: "flashcards", labelKey: "flashcards", icon: Layers },
      { id: "challenges", labelKey: "challenges", icon: CalendarCheck },
    ],
  },
  {
    titleKey: "groupCognition",
    items: [
      { id: "analisis", labelKey: "analytics", icon: BarChart3 },
      { id: "sources", labelKey: "sources", icon: Library },
      { id: "simulator", labelKey: "simulator", icon: Puzzle },
      { id: "assistant", labelKey: "assistant", icon: Bot },
    ],
  },
];

/** Valida un hex de `<input type="color">` (siempre `#rrggbb`) antes de confiar en lo persistido. */
function isValidHexColor(value: string | null): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

let deckIdSequence = 0;
function createDeckId(): string {
  deckIdSequence += 1;
  return `deck-${Date.now()}-${deckIdSequence}`;
}

/**
 * `sessionTime` — a diferencia de `globalTime` (telemetría inmortal, ver
 * `lib/time.ts`) — es un contador visual y manipulable: el usuario puede
 * restablecerlo a 0 en cualquier momento (ver `handleResetSessionTime`), así
 * que deliberadamente NO reconstruye el tiempo transcurrido durante un
 * reload como sí hace `loadGlobalTimer`. Se persiste aparte, en su propia
 * clave, para que un reset no pueda tocar jamás la telemetría de fondo.
 */
function loadSessionTime(): number {
  try {
    const raw = localStorage.getItem(SESSION_TIME_STORAGE_KEY);
    const parsed = raw === null ? 0 : Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

/** `MM:SS` — formato corto para el reloj visual de la sesión (ver Misión 3). */
function formatSessionTime(totalSeconds: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

type DashboardLayoutProps = {
  /**
   * "El Orquestador de Rutas" (`App.tsx`, Misión 3): garantizado no-vacío
   * — `DashboardLayout` solo se monta después de que el Ritual de
   * Iniciación (`OnboardingView`) ya guardó un nombre real en la Bóveda de
   * Titanio, así que aquí ya no hace falta un estado de carga ni un
   * fallback "invitado" para el saludo del Header.
   */
  userName: string;
  /** `setUserName` de la única instancia de `useAppStore` que vive en `App.tsx` — persiste en disco Y actualiza el mismo estado global que decide Onboarding-vs-Dashboard. */
  onUserNameChange: (name: string) => void;
};

export default function DashboardLayout({
  userName,
  onUserNameChange,
}: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("lab");
  /** Modo activo de la Consola Clínica — Inquisidor (chat) o Catedrático (simulacro). */
  const [assistantMode, setAssistantMode] =
    useState<AssistantMode>("inquisidor");
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeMode = useThemeStore((state) => state.themeMode);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const activeThemeConfig = getThemeConfig(currentTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);
  const resolvedMode = resolveThemeMode(themeMode, systemPrefersDark);
  // Color de Acento global — aplica a todos los temas.
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const { dict, t } = useLanguage();
  const { isPremium } = useLicense();
  /** Modal Silent Luxury del Paywall — se abre al tocar Asistente sin Pro. */
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  /** Drawer del Sidebar en viewport móvil (< md). En desktop el aside es fijo. */
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [userCode] = useState("#USR-9982");
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<SubscriptionPlan>("pro");

  // Avatar dinámico: nace vacío (usa la inicial) hasta que el usuario suba
  // una foto desde ProfileView vía `URL.createObjectURL`.
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // "El Inyector de Lujo": gobierna cuánto respiran las transiciones de toda
  // la interfaz. Por defecto 'luxury' — la app arranca en su modo más
  // elegante y el usuario puede bajarla a 'fast' si prioriza productividad.
  const [uiSpeed, setUiSpeed] = useState<UiSpeed>("luxury");
  const transitionDurationClass = UI_SPEED_DURATION_CLASSES[uiSpeed];

  // "Separación Quirúrgica": dos contadores que nacen del mismo tick pero
  // sirven propósitos opuestos.
  //   - `globalTime`  → telemetría INTOCABLE para las gráficas (ver
  //     `TimeAnalyticsView.tsx`). Vive en el Layout, sigue corriendo sin
  //     importar la pestaña activa, y `loadGlobalTimer` reconstruye el
  //     tiempo transcurrido durante un reload — nada la resetea jamás.
  //   - `sessionTime` → el reloj visual del Header (Misión 3). Es
  //     manipulable: el usuario puede restablecerlo a 0 sin que eso afecte
  //     un solo segundo de `globalTime`.
  // Ambos comparten el mismo `isPaused` (un solo Play/Pause para los dos) y
  // el mismo `setInterval`, pero cada uno se persiste por separado.
  const [initialTimerSnapshot] = useState(loadGlobalTimer);
  const [globalTime, setGlobalTime] = useState(initialTimerSnapshot.elapsedSeconds);
  const [sessionTime, setSessionTime] = useState(loadSessionTime);
  const [isPaused, setIsPaused] = useState(initialTimerSnapshot.isPaused);
  // Controla si el Header muestra los dígitos de `sessionTime` o "--:--".
  const [isTimerVisible, setIsTimerVisible] = useState(true);

  // Lives here (not inside FlashcardsView) so it survives view switches —
  // fixes the "amnesia" bug, since conditionally-rendered views unmount.
  //
  // "Sellado de la Memoria" (Misión 1): arranca vacío y se hidrata desde la
  // Bóveda de Titanio (`lib/deckStore.ts`) en el primer efecto — a
  // diferencia de `localStorage`, el plugin de Tauri habla IPC async, así
  // que no hay lectura síncrona posible en el render inicial. `App.tsx` ya
  // hizo esperar 5s de Splash + la lectura de `userName` antes de montar
  // este layout, así que en la práctica esta carga casi nunca es visible;
  // `isDecksLoading` cubre el caso raro en que sí lo sea (ver el `<main>`
  // más abajo).
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isDecksLoading, setIsDecksLoading] = useState(true);
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);
  const [editDeckId, setEditDeckId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadDecks().then((loaded) => {
      if (!isMounted) return;
      setDecks(loaded);
      setIsDecksLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  /**
   * Único punto de mutación de `decks`: calcula el próximo estado y lo
   * sobrescribe/persiste INMEDIATAMENTE en disco físico vía `saveDecks()`
   * (Misión 2) — nunca se deja el guardado para un `useEffect` aparte ni
   * para el cierre de la app, así una calificación SM-2 o cualquier otra
   * mutación de mazos sobrevive a un cierre abrupto del proceso.
   */
  const updateDecks = (updater: (current: Deck[]) => Deck[]) => {
    setDecks((current) => {
      const next = updater(current);
      void saveDecks(next);
      return next;
    });
  };

  useEffect(() => {
    const storedAccent = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
    if (isValidHexColor(storedAccent)) {
      setAccentColor(storedAccent);
    }

    const storedUiSpeed = localStorage.getItem(UI_SPEED_STORAGE_KEY);
    if (isValidUiSpeed(storedUiSpeed)) {
      setUiSpeed(storedUiSpeed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(UI_SPEED_STORAGE_KEY, uiSpeed);
  }, [uiSpeed]);

  // Si estaba dentro de una vista Pro sin licencia, lo devolvemos al Dashboard.
  useEffect(() => {
    if (!isPremium && PREMIUM_NAV_IDS.has(activeView)) {
      setActiveView("dashboard");
    }
  }, [isPremium, activeView]);

  // Cierra el drawer al cambiar de vista (navegación desde el menú móvil).
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [activeView]);

  // Al pasar a desktop, el drawer deja de tener sentido — lo cerramos.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileNavOpen(false);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Evita scroll del body detrás del drawer en móvil.
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileNavOpen]);

  // Auto: sigue prefers-color-scheme en vivo.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) =>
      setSystemPrefersDark(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Inyección: predeterminado respeta modo; fotográficos son inmunes; acento global.
  useEffect(() => {
    applyThemeAppearance(currentTheme, resolvedMode, accentColor);

    if (accentColor) {
      localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accentColor);
    } else {
      localStorage.removeItem(ACCENT_COLOR_STORAGE_KEY);
    }
  }, [currentTheme, resolvedMode, accentColor]);

  // Entorno Pro sin licencia → Interfaz Clásica.
  useEffect(() => {
    const config = getThemeConfig(currentTheme);
    if (!isPremium && config?.isPremium) {
      void useThemeStore.getState().setTheme("tema-predeterminado");
    }
  }, [isPremium, currentTheme]);

  // Único `setInterval` para toda la app: vive en el Layout, así que nunca
  // se desmonta al cambiar de vista. Si está en pausa, ni siquiera arranca.
  // Cada tick suma +1 a AMBOS contadores simultáneamente — nacen sincronizados,
  // y solo `handleResetSessionTime` puede hacer que se separen (Misión 2).
  useEffect(() => {
    if (isPaused) return;

    const intervalId = window.setInterval(() => {
      setGlobalTime((current) => current + 1);
      setSessionTime((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  // Persistencia separada: `globalTime` sigue viviendo en `lib/time.ts`
  // (junto con `isPaused`, que gobierna a ambos relojes); `sessionTime`
  // tiene su propia clave para que un reset no pueda filtrarse jamás hacia
  // la telemetría de fondo.
  useEffect(() => {
    saveGlobalTimer(globalTime, isPaused);
  }, [globalTime, isPaused]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_TIME_STORAGE_KEY, String(sessionTime));
    } catch {
      /* localStorage no disponible — el contador sigue corriendo en memoria esta sesión */
    }
  }, [sessionTime]);

  const handleToggleGlobalTimer = () => setIsPaused((current) => !current);
  const handleToggleTimerVisibility = () =>
    setIsTimerVisible((current) => !current);
  /** SOLO reinicia el reloj visual — `globalTime` (telemetría) permanece intacto siempre. */
  const handleResetSessionTime = () => setSessionTime(0);

  // "Lujo Percibido": cada cambio de vista respira con la velocidad elegida
  // en `uiSpeed`. `useLayoutEffect` apaga la opacidad *antes* del pintado
  // (sin flash de la vista nueva a opacidad completa) y un `requestAnimationFrame`
  // la vuelve a subir ya en el siguiente frame, disparando la transición CSS.
  const [isViewVisible, setIsViewVisible] = useState(true);

  useLayoutEffect(() => {
    setIsViewVisible(false);
    const rafId = requestAnimationFrame(() => setIsViewVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, [activeView]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return dict.greeting.morning;
    if (hour < 19) return dict.greeting.afternoon;
    return dict.greeting.evening;
  })();

  // Defensivo únicamente: `userName` ya llega recortado y no-vacío desde
  // `App.tsx` (el Onboarding no permite guardar una cadena en blanco), pero
  // todo el Header (saludo, mini-tarjeta de perfil, avatar) sigue leyendo de
  // aquí para tener un único punto de verdad, por si el día de mañana ese
  // contrato cambia.
  const trimmedUserName = userName.trim();
  const hasUserName = trimmedUserName.length > 0;

  const handleCreateDeck = (): string => {
    const newDeck: Deck = {
      id: createDeckId(),
      name: dict.flashcards.newDeckName,
      cards: [],
    };
    updateDecks((current) => [...current, newDeck]);
    return newDeck.id;
  };

  const handleRenameDeck = (id: string, name: string) => {
    updateDecks((current) =>
      current.map((deck) => (deck.id === id ? { ...deck, name } : deck)),
    );
  };

  const handleAddCard = (deckId: string, card: StudyCardData) => {
    updateDecks((current) =>
      current.map((deck) =>
        deck.id === deckId ? { ...deck, cards: [...deck.cards, card] } : deck,
      ),
    );
  };

  /** Confirma el borrador del editor de mazos: reemplaza `cards` de una sola vez. */
  const handleUpdateDeckCards = (deckId: string, cards: StudyCardData[]) => {
    updateDecks((current) =>
      current.map((deck) => (deck.id === deckId ? { ...deck, cards } : deck)),
    );
  };

  /**
   * "El Quirófano Matemático" (Misión 2 del Sellado de la Memoria):
   * persiste el `interval`/`easeFactor`/`nextReviewDate` que acaba de
   * calcular el motor SM-2 para UNA tarjeta. `updateDecks()` calcula el
   * próximo árbol de mazos y dispara `saveDecks()` de inmediato — el
   * progreso de repetición espaciada queda en disco físico ANTES de que
   * termine este handler, no cuando se cierre la app.
   */
  const handleUpdateCard = (
    deckId: string,
    cardId: number,
    patch: Partial<StudyCardData>,
  ) => {
    updateDecks((current) =>
      current.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              cards: deck.cards.map((card) =>
                card.id === cardId ? { ...card, ...patch } : card,
              ),
            }
          : deck,
      ),
    );
  };

  /** "Reiniciar repetición espaciada del mazo": vuelve TODAS sus tarjetas a su estado SM-2 de tarjeta nueva (Misión 3: quedan "due" de inmediato). */
  const handleResetDeckSrs = (deckId: string) => {
    updateDecks((current) =>
      current.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              cards: deck.cards.map((card) => ({
                ...card,
                ...createInitialSrsState(),
              })),
            }
          : deck,
      ),
    );
  };

  const handleOpenDeck = (id: string) => {
    setStudyDeckId(id);
    setActiveView("study");
  };

  const handleExitStudy = () => {
    setActiveView("flashcards");
    setStudyDeckId(null);
  };

  const handleEditDeck = (id: string) => {
    setEditDeckId(id);
    setActiveView("editDeck");
  };

  const handleExitDeckEditor = () => {
    setActiveView("flashcards");
    setEditDeckId(null);
  };

  /** Borra uno o varios mazos, persiste de inmediato en la Bóveda y limpia su rastro en localStorage (analítica). */
  const handleDeleteDecks = (ids: string[]) => {
    updateDecks((current) => current.filter((deck) => !ids.includes(deck.id)));

    ids.forEach((id) => removeDeckStats(id));

    if (studyDeckId && ids.includes(studyDeckId)) {
      setStudyDeckId(null);
      setActiveView("flashcards");
    }
    if (editDeckId && ids.includes(editDeckId)) {
      setEditDeckId(null);
      setActiveView("flashcards");
    }
  };

  const rootBackgroundStyle = activeThemeConfig?.hasImage
    ? {
        backgroundImage: `url(${activeThemeConfig.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        backgroundImage: "none",
        backgroundColor: "var(--background)",
      };

  return (
    <div
      className={[
        // Fondos fotográficos: cover/center/no-repeat (también en style inline).
        // `bg-fixed` solo desde md — en iOS móvil fixed backgrounds se rompen.
        "min-h-screen w-full bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out md:bg-fixed",
        "flex flex-col text-foreground md:flex-row",
      ].join(" ")}
      style={rootBackgroundStyle}
    >
      {/* Scrim del drawer móvil — no compite en desktop. */}
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label={dict.sidebar.closeMenuLabel}
          className="fixed inset-0 z-40 bg-[#0B0D0F]/55 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Hamburguesa flotante — libera el viewport vertical para las tarjetas. */}
      <button
        type="button"
        aria-expanded={isMobileNavOpen}
        aria-controls="app-sidebar"
        aria-label={
          isMobileNavOpen
            ? dict.sidebar.closeMenuLabel
            : dict.sidebar.openMenuLabel
        }
        onClick={() => setIsMobileNavOpen((open) => !open)}
        className={[
          "fixed bottom-5 left-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-cuervo text-foreground shadow-glow-card backdrop-blur-md transition-all duration-300 md:hidden",
          "hover:border-primary hover:text-primary",
        ].join(" ")}
      >
        {isMobileNavOpen ? (
          <X className="h-5 w-5" strokeWidth={2} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={2} />
        )}
      </button>

      {/* Sidebar — drawer off-canvas en móvil; columna fija desde `md:`.
          `md:overflow-visible`: el flyout hover del Asistente no se recorta. */}
      <aside
        id="app-sidebar"
        className={[
          "flex flex-col border-wenge-border-subtle bg-cuervo",
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] border-r transition-transform duration-300 ease-in-out",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:z-30 md:h-screen md:w-64 md:shrink-0 md:translate-x-0 md:overflow-visible",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-wenge-border-subtle px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-rest bg-card text-primary transition-all duration-300 hover:border-primary hover:shadow-glow-card">
            <BookOpen className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="sidebar-brand text-sm font-semibold tracking-wide text-foreground">
              {dict.sidebar.brand}
            </p>
            <p className="text-xs tracking-wider text-muted-foreground uppercase">
              {dict.sidebar.tagline}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-visible p-4 md:overflow-visible">
          {navGroups.map(({ titleKey, items }, groupIndex) => (
            <div
              key={titleKey}
              className="flex w-full flex-col items-stretch gap-1"
            >
              <p
                className={[
                  "px-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase",
                  groupIndex > 0 ? "mt-1 border-t border-wenge-border-subtle pt-4" : "",
                ].join(" ")}
              >
                {dict.sidebar[titleKey]}
              </p>

              {items.map(({ id, labelKey, icon: Icon }) => {
                const isActive = activeView === id;
                const label = dict.nav[labelKey];
                const isNavLocked = PREMIUM_NAV_IDS.has(id) && !isPremium;

                // "Asistente": flyout hover con los 3 modos. Si !Pro, el
                // clic no cambia de vista — abre el modal del Paywall.
                if (id === "assistant") {
                  return (
                    <AssistantNavItem
                      key={id}
                      label={label}
                      isActive={isActive}
                      isLocked={isNavLocked}
                      activeMode={assistantMode}
                      onSelectMode={(mode) => {
                        if (!isPremium) {
                          setShowPaywallModal(true);
                          setIsMobileNavOpen(false);
                          return;
                        }
                        setAssistantMode(mode);
                        setActiveView("assistant");
                      }}
                      onLockedClick={() => {
                        setShowPaywallModal(true);
                        setIsMobileNavOpen(false);
                      }}
                    />
                  );
                }

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (isNavLocked) {
                        setShowPaywallModal(true);
                        setIsMobileNavOpen(false);
                        return;
                      }
                      setActiveView(id);
                    }}
                    className={[
                      "group flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap",
                      isActive
                        ? "rounded-lg border border-primary bg-primary-soft text-primary shadow-glow-sm transition-all duration-300"
                        : "glow-card-nav text-secondary-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-5 w-5 shrink-0 transition-colors duration-300",
                        isActive
                          ? "text-primary"
                          : "text-icon-muted group-hover:text-primary",
                      ].join(" ")}
                      strokeWidth={2}
                    />
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      {label}
                      {isNavLocked && (
                        <Lock
                          className="h-3.5 w-3.5 shrink-0 text-icon-muted"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-wenge-border-subtle p-4">
          <div className="glow-card p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {dict.sidebar.planLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {dict.sidebar.planValue}
            </p>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-wenge-border-subtle bg-cuervo px-4 md:px-8">
          <div>
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {hasUserName
                ? t(dict.header.welcomeBack, { name: trimmedUserName })
                : dict.header.welcomeGeneric}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Reloj visual de la sesión: corre independientemente de
                `activeView`, por eso vive en el Header global y no dentro
                de ninguna vista. Muestra `sessionTime` (manipulable), NUNCA
                `globalTime` (telemetría, ver Misión 2/4).

                "Acordeón de Lujo": el ancho del contenedor interior es lo
                que se anima (600ms, `ease-in-out`) — al colapsar, el
                `overflow-hidden` recorta el tiempo y los controles como si
                se plegaran, dejando ÚNICAMENTE el ícono `EyeOff` visible en
                un carril de `w-10`. Por eso el clic en TODO el contenedor
                colapsado alterna `isTimerVisible`: no hay nada más que
                tocar ahí. En expandido, ese mismo clic queda desactivado
                porque cada control (Eye, Play/Pause, Reset) ya es
                interactivo por su cuenta. */}
            <div
              role="timer"
              aria-label={dict.header.globalTimerLabel}
              className="flex items-center rounded-full border border-card-rest bg-card transition-all duration-300 hover:border-primary hover:shadow-glow-card"
            >
              <div
                onClick={!isTimerVisible ? handleToggleTimerVisibility : undefined}
                onKeyDown={
                  isTimerVisible
                    ? undefined
                    : (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleToggleTimerVisibility();
                        }
                      }
                }
                role={isTimerVisible ? undefined : "button"}
                tabIndex={isTimerVisible ? undefined : 0}
                aria-label={isTimerVisible ? undefined : dict.header.timerShowLabel}
                title={isTimerVisible ? undefined : dict.header.timerShowLabel}
                className={[
                  "flex items-center overflow-hidden transition-all duration-[600ms] ease-in-out",
                  isTimerVisible
                    ? "w-44 gap-1.5 px-3 py-1.5"
                    : "w-10 cursor-pointer justify-center px-0 py-1.5 hover:text-primary",
                ].join(" ")}
              >
                {isTimerVisible ? (
                  <>
                    <Timer
                      className="h-3.5 w-3.5 shrink-0 text-icon-muted"
                      strokeWidth={2}
                    />
                    <span
                      className={[
                        "w-10 shrink-0 text-center text-xs font-semibold tabular-nums tracking-wide text-secondary-foreground",
                        isPaused ? "animate-pulse" : "",
                      ].join(" ")}
                    >
                      {formatSessionTime(sessionTime)}
                    </span>

                    <span
                      className="mx-0.5 h-4 w-px shrink-0 bg-wenge-border-subtle"
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={handleToggleTimerVisibility}
                      aria-label={dict.header.timerHideLabel}
                      title={dict.header.timerHideLabel}
                      className="premium-btn flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-icon-muted transition-all duration-300 hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleGlobalTimer}
                      aria-label={
                        isPaused
                          ? dict.header.timerResumeLabel
                          : dict.header.timerPauseLabel
                      }
                      title={
                        isPaused
                          ? dict.header.timerResumeLabel
                          : dict.header.timerPauseLabel
                      }
                      className="premium-btn flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-icon-muted transition-all duration-300 hover:text-primary"
                    >
                      {isPaused ? (
                        <Play className="h-3.5 w-3.5" strokeWidth={2} />
                      ) : (
                        <Pause className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSessionTime}
                      aria-label={dict.header.timerResetLabel}
                      title={dict.header.timerResetLabel}
                      className="premium-btn flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-icon-muted transition-all duration-300 hover:text-primary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </>
                ) : (
                  <EyeOff
                    className="h-3.5 w-3.5 shrink-0 text-icon-muted transition-colors duration-300"
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            {/* "Purga del Header" (Misión 1): el selector de idiomas ya NO
                vive aquí — queda accesible únicamente desde ProfileView
                (sección "Preferencias de Interfaz", misma fuente
                `languageOptions`), a un clic de distancia detrás del
                avatar. Un header más silencioso, fiel a 'Silent Luxury':
                menos controles compitiendo por atención junto al nombre del
                usuario. */}

            {/* El tema/color de acento vive en su Showroom (ThemeView) — el
                avatar es la única puerta de entrada, para no duplicar
                controles. */}
            <button
              type="button"
              onClick={() => setActiveView("profile")}
              className="premium-btn flex items-center gap-3 rounded-full border border-transparent py-1 pl-3 pr-1 transition-all duration-300 hover:border-primary hover:shadow-glow-card"
              aria-label={dict.header.goToProfileLabel}
            >
              <span className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {hasUserName ? trimmedUserName : dict.header.guestLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dict.header.role}
                </p>
              </span>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={dict.header.avatarLabel}
                  className="h-10 w-10 shrink-0 rounded-full border border-primary object-cover shadow-glow-sm"
                />
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-sm font-semibold text-primary-foreground shadow-glow-sm"
                  aria-label={dict.header.avatarLabel}
                >
                  {hasUserName ? (
                    trimmedUserName.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content — swaps per activeView; Header and Sidebar stay fixed.
            La opacidad y su duración dinámica (`transitionDurationClass`) son
            "El Inyector de Lujo": cada cambio de pantalla respira con la
            velocidad elegida en ProfileView (ver Misión 1). */}
        <main
          className={[
            "flex-1 overflow-y-auto p-4 pb-24 transition-opacity md:p-8 md:pb-8",
            transitionDurationClass,
            isViewVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {isDecksLoading ? (
            // Ventana teórica entre montar este layout y que la Bóveda
            // responda con los mazos — casi nunca visible (ver comentario
            // en la declaración de `decks` más arriba), pero cualquier
            // vista que dependa de `decks` debe esperar a los datos reales
            // en vez de flashear un dashboard vacío.
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {dict.loadingVault.decksLabel}
            </div>
          ) : (
            <>
              {activeView === "dashboard" && (
                <DashboardHomeView
                  decks={decks}
                  onNavigateToFlashcards={() => setActiveView("flashcards")}
                  onNavigateToChallenges={() => setActiveView("challenges")}
                />
              )}
              {activeView === "flashcards" && (
                <FlashcardsView
                  decks={decks}
                  onCreateDeck={handleCreateDeck}
                  onRenameDeck={handleRenameDeck}
                  onOpenDeck={handleOpenDeck}
                  onEditDeck={handleEditDeck}
                  onDeleteDecks={handleDeleteDecks}
                />
              )}
              {activeView === "study" && (
                <StudyView
                  deck={decks.find((deck) => deck.id === studyDeckId)}
                  onExit={handleExitStudy}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  onResetDeckSrs={handleResetDeckSrs}
                />
              )}
              {activeView === "editDeck" && (
                <DeckEditorView
                  deck={decks.find((deck) => deck.id === editDeckId)}
                  onExit={handleExitDeckEditor}
                  onSave={handleUpdateDeckCards}
                  onDeleteDeck={(deckId) => handleDeleteDecks([deckId])}
                />
              )}
              {activeView === "analisis" && (
                <div className="flex flex-col gap-6">
                  <div
                    className="flex w-fit items-center gap-1 rounded-full border border-card-rest bg-card p-1"
                    role="tablist"
                    aria-label={dict.analytics.title}
                  >
                    {(
                      [
                        { id: "lab", label: dict.analytics.labTab },
                        { id: "performance", label: dict.analytics.performanceTab },
                        { id: "time", label: dict.analytics.timeTab },
                      ] as const
                    ).map(({ id, label }) => {
                      const isActive = analyticsTab === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setAnalyticsTab(id)}
                          className={[
                            "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300",
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

                  {analyticsTab === "lab" && <LaboratoryView decks={decks} />}
                  {analyticsTab === "performance" && (
                    <AnalyticsView decks={decks} />
                  )}
                  {analyticsTab === "time" && (
                    <TimeAnalyticsView decks={decks} globalTime={globalTime} />
                  )}
                </div>
              )}
              {activeView === "challenges" && <ChallengesView />}
              {activeView === "profile" && (
                <ProfileView
                  onExit={() => setActiveView("dashboard")}
                  userName={userName}
                  onSaveName={onUserNameChange}
                  userCode={userCode}
                  subscriptionPlan={subscriptionPlan}
                  onUpgradeClick={() =>
                    setSubscriptionPlan((plan) => (plan === "basic" ? "pro" : plan))
                  }
                  profileImage={profileImage}
                  onProfileImageChange={setProfileImage}
                  uiSpeed={uiSpeed}
                  onUiSpeedChange={setUiSpeed}
                  onOpenThemeView={() => setActiveView("theme")}
                />
              )}
              {activeView === "theme" && (
                <ThemeView
                  onExit={() => setActiveView("profile")}
                  accentColor={accentColor}
                  onAccentColorChange={setAccentColor}
                  resolvedMode={resolvedMode}
                  systemPrefersDark={systemPrefersDark}
                />
              )}
              {activeView === "sources" && <SourcesView />}
              {activeView === "simulator" && <SimulatorView />}
              {activeView === "assistant" && (
                <AssistantView mode={assistantMode} />
              )}
            </>
          )}
        </main>
      </div>

      {showPaywallModal && (
        <PaywallModal onDismiss={() => setShowPaywallModal(false)} />
      )}
    </div>
  );
}

/** Modal Silent Luxury del Paywall — sin ruido comercial, solo autoridad. */
function PaywallModal({ onDismiss }: { onDismiss: () => void }) {
  const { dict } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 text-neutral-400">
          <Lock className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2
          id="paywall-title"
          className="mt-5 text-center text-lg font-medium tracking-tight text-neutral-100"
        >
          {dict.paywall.title}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-neutral-400">
          {dict.paywall.navLockedMessage}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-7 w-full rounded-md border border-neutral-700 px-4 py-2.5 text-xs font-medium tracking-[0.14em] text-neutral-200 uppercase transition-colors hover:border-neutral-500 hover:text-neutral-50"
        >
          {dict.paywall.dismissLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Ítem "Asistente" del Sidebar: al hover (y focus-within, para teclado)
 * despliega un flyout a la derecha con los tres modos. Inquisidor y
 * Catedrático son seleccionables; Facilitador permanece bloqueado con
 * badge "Próximamente". Si `isLocked`, el clic abre el Paywall.
 */
function AssistantNavItem({
  label,
  isActive,
  isLocked,
  activeMode,
  onSelectMode,
  onLockedClick,
}: {
  label: string;
  isActive: boolean;
  isLocked: boolean;
  activeMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  onLockedClick: () => void;
}) {
  const { dict } = useLanguage();

  return (
    <div className="group/assistant relative z-10 shrink-0 md:w-full md:hover:z-[100]">
      <button
        type="button"
        onClick={() => {
          if (isLocked) {
            onLockedClick();
            return;
          }
          onSelectMode(
            activeMode === "facilitador" ? "inquisidor" : activeMode,
          );
        }}
        aria-haspopup="menu"
        className={[
          "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap",
          isActive
            ? "rounded-lg border border-primary bg-primary-soft text-primary shadow-glow-sm transition-all duration-300"
            : "glow-card-nav text-secondary-foreground group-hover/assistant:text-foreground",
        ].join(" ")}
      >
        <Bot
          className={[
            "h-5 w-5 shrink-0 transition-colors duration-300",
            isActive
              ? "text-primary"
              : "text-icon-muted group-hover/assistant:text-primary",
          ].join(" ")}
          strokeWidth={2}
        />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {label}
          {isLocked && (
            <Lock
              className="h-3.5 w-3.5 shrink-0 text-icon-muted"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </span>
      </button>

      {/* El padding exterior (`pt-1` / `md:pl-1.5`) es el "puente" invisible
          que evita que el hover se rompa al cruzar el hueco entre el ítem
          y el panel. */}
      <div
        className={[
          "pointer-events-none absolute z-[100] opacity-0 transition-opacity duration-150",
          "top-full left-0 pt-1",
          "md:top-0 md:left-full md:pt-0 md:pl-1.5",
          "group-hover/assistant:pointer-events-auto group-hover/assistant:opacity-100",
          "group-focus-within/assistant:pointer-events-auto group-focus-within/assistant:opacity-100",
        ].join(" ")}
      >
        <div
          role="menu"
          aria-label={dict.assistant.submenuLabel}
          className="w-56 rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelectMode("inquisidor")}
            className={[
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150",
              isActive && activeMode === "inquisidor"
                ? "bg-neutral-800 text-neutral-100"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100",
            ].join(" ")}
          >
            <Crosshair
              className="h-3.5 w-3.5 shrink-0 text-amber-600/90"
              strokeWidth={2}
            />
            <span className="flex-1 font-medium">
              {dict.assistant.modeInquisitor}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => onSelectMode("catedratico")}
            className={[
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150",
              isActive && activeMode === "catedratico"
                ? "bg-neutral-800 text-neutral-100"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100",
            ].join(" ")}
          >
            <GraduationCap
              className="h-3.5 w-3.5 shrink-0 text-stone-400"
              strokeWidth={2}
            />
            <span className="flex-1 font-medium">
              {dict.assistant.modeProfessor}
            </span>
          </button>

          <LockedAssistantMode
            icon={HandHelping}
            label={dict.assistant.modeFacilitator}
            badge={dict.assistant.comingSoonBadge}
          />
        </div>
      </div>
    </div>
  );
}

/** Modo bloqueado del flyout — no es interactivo; solo anuncia "Próximamente". */
function LockedAssistantMode({
  icon: Icon,
  label,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  badge: string;
}) {
  return (
    <div
      role="menuitem"
      aria-disabled="true"
      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-neutral-600"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span className="flex-1 font-medium">{label}</span>
      <span className="rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-neutral-500 uppercase">
        {badge}
      </span>
    </div>
  );
}
