import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarClock,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  Repeat,
  Trash2,
} from "lucide-react";
import type { Dictionary, Language } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import { getSecureJSON, setSecureJSON } from "../lib/secureStorage";
import { PortalMenu } from "./PortalMenu";

/** Cadencia de recurrencia de un desafío — `"none"` es el valor por defecto (sin repetición). */
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

/** Orden fijo del menú izquierdo del popover (Misión 2): también sirve como whitelist de validación. */
const RECURRENCE_VALUES: Recurrence[] = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export type Challenge = {
  id: string;
  title: string;
  completed: boolean;
  /** ISO date, `YYYY-MM-DD` — la próxima ocurrencia "efectiva", usada para agrupar/ordenar la lista. */
  date: string;
  /** `Date.now()` de creación — desempata el orden dentro de un mismo día. */
  createdAt: number;
  /** Cadencia de repetición. `"none"` = tarea única. */
  recurrence: Recurrence;
  /** Días de la semana activos cuando `recurrence === "weekly"` (0=Domingo … 6=Sábado, convención `Date#getDay`). */
  selectedWeekDays: number[];
  /** Días del mes activos (1-31) cuando `recurrence === "monthly"`. */
  selectedMonthDays: number[];
  /** Fecha exacta elegida en el calendario clásico cuando `recurrence` es `"none"` o `"yearly"`. */
  exactDate: string;
};

const CHALLENGES_STORAGE_KEY = "estudio-challenges";

/** Valida solo la forma "legado" mínima — los campos nuevos de recurrencia se rellenan aparte en `normalizeChallenge`, así que datos guardados antes de esta Misión no se pierden. */
function isStoredChallengeShape(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.completed === "boolean" &&
    typeof record.date === "string" &&
    typeof record.createdAt === "number"
  );
}

function isRecurrence(value: unknown): value is Recurrence {
  return RECURRENCE_VALUES.includes(value as Recurrence);
}

/** Completa un registro persistido (potencialmente pre-Misión-1) con los campos de recurrencia que falten. */
function normalizeChallenge(record: Record<string, unknown>): Challenge {
  const date = record.date as string;
  return {
    id: record.id as string,
    title: record.title as string,
    completed: record.completed as boolean,
    date,
    createdAt: record.createdAt as number,
    recurrence: isRecurrence(record.recurrence) ? record.recurrence : "none",
    selectedWeekDays: Array.isArray(record.selectedWeekDays)
      ? (record.selectedWeekDays as unknown[]).filter(
          (day): day is number =>
            typeof day === "number" && day >= 0 && day <= 6,
        )
      : [],
    selectedMonthDays: Array.isArray(record.selectedMonthDays)
      ? (record.selectedMonthDays as unknown[]).filter(
          (day): day is number =>
            typeof day === "number" && day >= 1 && day <= 31,
        )
      : [],
    exactDate: typeof record.exactDate === "string" ? record.exactDate : date,
  };
}

/** Lee el CRUD persistido — vacío si no hay nada guardado o el JSON está corrupto. */
function loadStoredChallenges(): Challenge[] {
  try {
    const parsed = getSecureJSON<unknown>(CHALLENGES_STORAGE_KEY);
    return Array.isArray(parsed)
      ? parsed.filter(isStoredChallengeShape).map(normalizeChallenge)
      : [];
  } catch {
    return [];
  }
}

let challengeIdSequence = 0;
function createChallengeId(): string {
  challengeIdSequence += 1;
  return `challenge-${Date.now()}-${challengeIdSequence}`;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate: string, amount: number): string {
  const next = new Date(`${isoDate}T00:00:00`);
  next.setDate(next.getDate() + amount);
  return toIsoDate(next);
}

function addMonths(isoDate: string, amount: number): string {
  const next = new Date(`${isoDate}T00:00:00`);
  next.setMonth(next.getMonth() + amount);
  return toIsoDate(next);
}

function addYears(isoDate: string, amount: number): string {
  const next = new Date(`${isoDate}T00:00:00`);
  next.setFullYear(next.getFullYear() + amount);
  return toIsoDate(next);
}

/** Primer día, desde `fromIso` (inclusive), cuyo día-de-semana esté en `weekDays` — busca en una ventana de 7 días. */
function findNextMatchingWeekday(fromIso: string, weekDays: number[]): string {
  const start = new Date(`${fromIso}T00:00:00`);
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + offset);
    if (weekDays.includes(candidate.getDay())) {
      return toIsoDate(candidate);
    }
  }
  return fromIso;
}

/** Primer día, desde `fromIso` (inclusive), cuyo día-del-mes esté en `monthDays` — ventana de ~2 meses para cubrir días que no existen en el mes en curso (ej. 31 en febrero). */
function findNextMatchingMonthDay(fromIso: string, monthDays: number[]): string {
  const start = new Date(`${fromIso}T00:00:00`);
  for (let offset = 0; offset < 62; offset++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + offset);
    if (monthDays.includes(candidate.getDate())) {
      return toIsoDate(candidate);
    }
  }
  return fromIso;
}

/** La fecha de creación de un desafío nuevo: para cadencias basadas en conjuntos de días, busca la próxima ocurrencia a partir de hoy (inclusive); para `"none"`/`"yearly"` usa la fecha exacta elegida en el calendario. */
function computeInitialDate(
  recurrence: Recurrence,
  exactDate: string,
  selectedWeekDays: number[],
  selectedMonthDays: number[],
): string {
  const today = toIsoDate(new Date());

  switch (recurrence) {
    case "daily":
      return today;
    case "weekly":
      return selectedWeekDays.length > 0
        ? findNextMatchingWeekday(today, selectedWeekDays)
        : today;
    case "monthly":
      return selectedMonthDays.length > 0
        ? findNextMatchingMonthDay(today, selectedMonthDays)
        : today;
    case "yearly":
    case "none":
    default:
      return exactDate || today;
  }
}

/**
 * Próxima ocurrencia de un desafío recurrente tras completarlo (Misión 1 de
 * la sesión anterior, ahora consciente de `selectedWeekDays`/`selectedMonthDays`):
 * respeta los días exactos elegidos en el popover en vez de un simple +7/+1 mes
 * cuando el usuario los definió; cae de vuelta a esa aritmética simple si la
 * tarea recurrente no tiene días específicos seleccionados.
 */
function getNextOccurrenceDate(challenge: Challenge): string {
  const { date, recurrence, selectedWeekDays, selectedMonthDays } = challenge;

  switch (recurrence) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return selectedWeekDays.length > 0
        ? findNextMatchingWeekday(addDays(date, 1), selectedWeekDays)
        : addDays(date, 7);
    case "monthly":
      return selectedMonthDays.length > 0
        ? findNextMatchingMonthDay(addDays(date, 1), selectedMonthDays)
        : addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
    case "none":
    default:
      return date;
  }
}

function toggleArrayValue(values: number[], value: number): number[] {
  return values.includes(value)
    ? values.filter((existing) => existing !== value)
    : [...values, value].sort((a, b) => a - b);
}

const localeByLanguage: Record<Language, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
};

/** Abreviaturas fijas L-M-X-J-V-S-D pedidas explícitamente en la Misión 3 — se mantienen iguales sin importar el idioma de la app, igual que un selector de calendario compacto típico. */
const WEEKDAY_OPTIONS: { day: number; label: string }[] = [
  { day: 1, label: "L" },
  { day: 2, label: "M" },
  { day: 3, label: "X" },
  { day: 4, label: "J" },
  { day: 5, label: "V" },
  { day: 6, label: "S" },
  { day: 0, label: "D" },
];

const WEEKDAY_SHORT_LABEL_BY_DAY: Record<number, string> = WEEKDAY_OPTIONS.reduce(
  (acc, { day, label }) => ({ ...acc, [day]: label }),
  {} as Record<number, string>,
);

/** Textos del popover — viven locales a este archivo (no forman parte del `Dictionary` global) para mantener el cambio autocontenido. */
const datePopoverTextByLanguage: Record<
  Language,
  {
    trigger: string;
    weeklyPanelLabel: string;
    monthlyPanelLabel: string;
    dailyMessage: string;
    prevMonthLabel: string;
    nextMonthLabel: string;
  }
> = {
  es: {
    trigger: "Fecha y repetición",
    weeklyPanelLabel: "Elige los días de la semana",
    monthlyPanelLabel: "Elige los días del mes",
    dailyMessage: "El desafío se repetirá todos los días.",
    prevMonthLabel: "Mes anterior",
    nextMonthLabel: "Mes siguiente",
  },
  en: {
    trigger: "Date and repeat",
    weeklyPanelLabel: "Choose the days of the week",
    monthlyPanelLabel: "Choose the days of the month",
    dailyMessage: "The challenge will repeat every day.",
    prevMonthLabel: "Previous month",
    nextMonthLabel: "Next month",
  },
  de: {
    trigger: "Datum und Wiederholung",
    weeklyPanelLabel: "Wähle die Wochentage",
    monthlyPanelLabel: "Wähle die Tage des Monats",
    dailyMessage: "Die Herausforderung wird jeden Tag wiederholt.",
    prevMonthLabel: "Vorheriger Monat",
    nextMonthLabel: "Nächster Monat",
  },
  ja: {
    trigger: "日付と繰り返し",
    weeklyPanelLabel: "曜日を選択",
    monthlyPanelLabel: "日を選択",
    dailyMessage: "このチャレンジは毎日繰り返されます。",
    prevMonthLabel: "前の月",
    nextMonthLabel: "次の月",
  },
  ko: {
    trigger: "날짜 및 반복",
    weeklyPanelLabel: "요일을 선택하세요",
    monthlyPanelLabel: "날짜를 선택하세요",
    dailyMessage: "이 챌린지는 매일 반복됩니다.",
    prevMonthLabel: "이전 달",
    nextMonthLabel: "다음 달",
  },
};

const recurrenceLabelsByLanguage: Record<Language, Record<Recurrence, string>> = {
  es: {
    none: "No repetir",
    daily: "Diaria",
    weekly: "Semanal",
    monthly: "Mensual",
    yearly: "Anual",
  },
  en: {
    none: "Don't repeat",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  },
  de: {
    none: "Nicht wiederholen",
    daily: "Täglich",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    yearly: "Jährlich",
  },
  ja: {
    none: "繰り返さない",
    daily: "毎日",
    weekly: "毎週",
    monthly: "毎月",
    yearly: "毎年",
  },
  ko: {
    none: "반복 안 함",
    daily: "매일",
    weekly: "매주",
    monthly: "매월",
    yearly: "매년",
  },
};

/** "16 jul" — fecha corta para fechas que no son ni hoy ni mañana. */
function formatShortDate(isoDate: string, language: Language): string {
  const target = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "numeric",
    month: "short",
  }).format(target);
}

/** "Hoy" / "Mañana" / fecha corta — usado para la cadencia `"none"`/`"yearly"`, que se rigen por una fecha exacta. */
function formatDateLabel(
  isoDate: string,
  dict: Dictionary,
  language: Language,
): string {
  const today = toIsoDate(new Date());
  const tomorrow = addDays(today, 1);

  if (isoDate === today) return dict.challenges.today;
  if (isoDate === tomorrow) return dict.challenges.tomorrow;
  return formatShortDate(isoDate, language);
}

/**
 * Etiqueta del botón disparador del popover — resume el modo activo:
 * fecha exacta para `none`/`yearly`, los días elegidos para `weekly`/`monthly`,
 * o el nombre de la cadencia como genérico de respaldo.
 */
function formatTriggerLabel(
  recurrence: Recurrence,
  exactDate: string,
  selectedWeekDays: number[],
  selectedMonthDays: number[],
  dict: Dictionary,
  language: Language,
): string {
  const recurrenceLabels = recurrenceLabelsByLanguage[language];

  switch (recurrence) {
    case "daily":
      return recurrenceLabels.daily;
    case "weekly": {
      if (selectedWeekDays.length === 0) return recurrenceLabels.weekly;
      return [...selectedWeekDays]
        .sort((a, b) => a - b)
        .map((day) => WEEKDAY_SHORT_LABEL_BY_DAY[day])
        .join(", ");
    }
    case "monthly": {
      if (selectedMonthDays.length === 0) return recurrenceLabels.monthly;
      return [...selectedMonthDays].sort((a, b) => a - b).join(", ");
    }
    case "yearly":
    case "none":
    default:
      return formatDateLabel(exactDate, dict, language);
  }
}

type ChallengeGroup = {
  date: string;
  pending: Challenge[];
  completed: Challenge[];
};

/**
 * Agrupa por fecha y separa pendientes de completadas dentro de cada grupo
 * — las completadas nunca se mezclan con las pendientes, viven aparte en su
 * propia sub-sección colapsable (ver `DayGroup` / Misión 4).
 */
function groupByDate(challenges: Challenge[]): ChallengeGroup[] {
  const byDate = new Map<string, Challenge[]>();

  for (const challenge of challenges) {
    const existing = byDate.get(challenge.date) ?? [];
    existing.push(challenge);
    byDate.set(challenge.date, existing);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => {
      const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
      return {
        date,
        pending: sorted.filter((item) => !item.completed),
        completed: sorted.filter((item) => item.completed),
      };
    });
}

/** "Hoy - Jueves 16" / "Mañana - Viernes 17" / "Sábado 18" — solo compara strings de fecha, sin librerías extra. */
function formatDayLabel(
  isoDate: string,
  dict: Dictionary,
  language: Language,
): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const target = new Date(`${isoDate}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "long",
  }).format(target);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dayNumber = target.getDate();
  const weekdayAndDay = `${capitalizedWeekday} ${dayNumber}`;

  if (isoDate === toIsoDate(today)) {
    return `${dict.challenges.today} - ${weekdayAndDay}`;
  }
  if (isoDate === toIsoDate(tomorrow)) {
    return `${dict.challenges.tomorrow} - ${weekdayAndDay}`;
  }
  return weekdayAndDay;
}

/**
 * "Fase 2": CRUD completo de Desafíos al estilo Todoist — captura rápida por
 * Enter, agrupación por fecha, checkbox circular, edición inline (sin
 * modales) y borrado, todo persistido en `localStorage`. Vive aislado por
 * ahora (estado 100% local); cuando se suba al Contexto Global, solo hay
 * que mover `challenges`/`setChallenges` hacia arriba — el resto de esta
 * vista no debería necesitar cambios.
 */
export default function ChallengesView() {
  const { dict, language, t } = useLanguage();
  const [challenges, setChallenges] = useState<Challenge[]>(loadStoredChallenges);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftRecurrence, setDraftRecurrence] = useState<Recurrence>("none");
  const [draftExactDate, setDraftExactDate] = useState(() => toIsoDate(new Date()));
  const [draftSelectedWeekDays, setDraftSelectedWeekDays] = useState<number[]>([]);
  const [draftSelectedMonthDays, setDraftSelectedMonthDays] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setSecureJSON(CHALLENGES_STORAGE_KEY, challenges);
  }, [challenges]);

  const groups = useMemo(() => groupByDate(challenges), [challenges]);

  const handleCreate = () => {
    const title = draftTitle.trim();
    if (!title) return;

    const date = computeInitialDate(
      draftRecurrence,
      draftExactDate,
      draftSelectedWeekDays,
      draftSelectedMonthDays,
    );

    const newChallenge: Challenge = {
      id: createChallengeId(),
      title,
      completed: false,
      date,
      createdAt: Date.now(),
      recurrence: draftRecurrence,
      selectedWeekDays: draftSelectedWeekDays,
      selectedMonthDays: draftSelectedMonthDays,
      exactDate: draftExactDate,
    };
    setChallenges((current) => [...current, newChallenge]);
    setDraftTitle("");
  };

  /**
   * Lógica de completado: un desafío recurrente jamás se tacha "para
   * siempre" — al marcarlo, saltamos directo a su próxima ocurrencia (ahora
   * consciente de `selectedWeekDays`/`selectedMonthDays`, ver
   * `getNextOccurrenceDate`) y lo devolvemos a `completed: false`. Nada de
   * clones ni historial: la tarea simplemente "rebota" hacia adelante en el
   * calendario. Las tareas sin recurrencia se comportan exactamente como
   * antes.
   */
  const handleToggle = (id: string) => {
    setChallenges((current) =>
      current.map((challenge) => {
        if (challenge.id !== id) return challenge;

        const isCompleting = !challenge.completed;

        if (isCompleting && challenge.recurrence !== "none") {
          return {
            ...challenge,
            completed: false,
            date: getNextOccurrenceDate(challenge),
          };
        }

        return { ...challenge, completed: isCompleting };
      }),
    );
  };

  const handleRename = (id: string, title: string) => {
    setChallenges((current) =>
      current.map((challenge) =>
        challenge.id === id ? { ...challenge, title } : challenge,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setChallenges((current) => current.filter((challenge) => challenge.id !== id));
    setOpenMenuId((current) => (current === id ? null : current));
    setEditingId((current) => (current === id ? null : current));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
          <CalendarCheck className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {dict.challenges.title}
        </h2>
      </div>

      {/* ── Barra de captura rápida (Misión 2): Enter en el título crea la tarea ── */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleCreate();
        }}
        className="glow-card flex items-center gap-2 p-2.5 transition-all duration-300"
      >
        <input
          type="text"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          placeholder={dict.challenges.capturePlaceholder}
          className="min-w-0 flex-1 rounded-md bg-transparent px-2.5 py-2 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground"
        />

        <DatePopover
          recurrence={draftRecurrence}
          exactDate={draftExactDate}
          selectedWeekDays={draftSelectedWeekDays}
          selectedMonthDays={draftSelectedMonthDays}
          onRecurrenceChange={setDraftRecurrence}
          onExactDateChange={setDraftExactDate}
          onToggleWeekDay={(day) =>
            setDraftSelectedWeekDays((current) => toggleArrayValue(current, day))
          }
          onToggleMonthDay={(day) =>
            setDraftSelectedMonthDays((current) => toggleArrayValue(current, day))
          }
        />

        <button
          type="submit"
          disabled={!draftTitle.trim()}
          aria-label={dict.challenges.addTask}
          title={dict.challenges.addTask}
          className="premium-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/60 bg-primary text-primary-foreground transition-all duration-300 hover:shadow-glow-card disabled:cursor-not-allowed disabled:border-card-rest disabled:bg-transparent disabled:text-icon-muted disabled:opacity-50 disabled:hover:shadow-none"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </form>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-card-rest py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
            <CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {dict.challenges.emptyState}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <DayGroup
              key={group.date}
              label={formatDayLabel(group.date, dict, language)}
              pending={group.pending}
              completed={group.completed}
              editingId={editingId}
              onStartEdit={setEditingId}
              onFinishEdit={() => setEditingId(null)}
              onRename={handleRename}
              openMenuId={openMenuId}
              onToggleMenu={(id) =>
                setOpenMenuId((current) => (current === id ? null : id))
              }
              onCloseMenu={() => setOpenMenuId(null)}
              onToggle={handleToggle}
              onDelete={handleDelete}
              completedShowLabel={t(dict.challenges.completedShowLabel, {
                count: group.completed.length,
              })}
              completedHideLabel={dict.challenges.completedHideLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DatePopoverProps = {
  recurrence: Recurrence;
  exactDate: string;
  selectedWeekDays: number[];
  selectedMonthDays: number[];
  onRecurrenceChange: (recurrence: Recurrence) => void;
  onExactDateChange: (date: string) => void;
  onToggleWeekDay: (day: number) => void;
  onToggleMonthDay: (day: number) => void;
};

/**
 * "Interfaz Reactiva al Contexto": el botón sutil "Fecha y Repetición" abre
 * un popover de dos columnas — a la izquierda, el menú estricto de
 * cadencias (Misión 2); a la derecha, un panel que MUTA según la cadencia
 * activa (Misión 3): botones de día de semana, cuadrícula de días del mes,
 * un calendario clásico de fecha única, o un simple mensaje para "Diaria".
 * El panel derecho es deliberadamente un "zócalo oscuro" (`bg-gray-900`)
 * fijo — no se tiñe con el tema activo — para separar visualmente "la
 * regla que se está editando" del resto de la UI temática; lo seleccionado
 * dentro de él SÍ se ilumina con el color global de la app (`bg-primary`/
 * `text-primary`, que resuelven a `var(--color-primary)`).
 */
function DatePopover({
  recurrence,
  exactDate,
  selectedWeekDays,
  selectedMonthDays,
  onRecurrenceChange,
  onExactDateChange,
  onToggleWeekDay,
  onToggleMonthDay,
}: DatePopoverProps) {
  const { dict, language } = useLanguage();
  const texts = datePopoverTextByLanguage[language];
  const recurrenceLabels = recurrenceLabelsByLanguage[language];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const hasRecurrence = recurrence !== "none";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={texts.trigger}
        title={texts.trigger}
        className={[
          "premium-btn flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all duration-300",
          isOpen || hasRecurrence
            ? "border-primary text-primary shadow-glow-sm"
            : "border-card-rest bg-background/60 text-secondary-foreground hover:border-primary hover:text-primary",
        ].join(" ")}
      >
        <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} />
        {formatTriggerLabel(
          recurrence,
          exactDate,
          selectedWeekDays,
          selectedMonthDays,
          dict,
          language,
        )}
        {hasRecurrence && <Repeat className="h-3 w-3" strokeWidth={2.25} />}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={texts.trigger}
          className="absolute right-0 top-full z-10 mt-2 flex overflow-hidden rounded-lg border border-wenge-border-subtle bg-cuervo shadow-glow-card"
        >
          {/* Columna izquierda (Misión 2): lista estricta, siempre la misma sin importar el modo activo. */}
          <div className="flex w-32 shrink-0 flex-col gap-0.5 p-2">
            {RECURRENCE_VALUES.map((value) => {
              const isSelected = recurrence === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRecurrenceChange(value)}
                  aria-pressed={isSelected}
                  className={[
                    "rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors duration-200",
                    isSelected
                      ? "bg-primary-soft text-primary"
                      : "text-secondary-foreground hover:bg-primary-soft hover:text-primary",
                  ].join(" ")}
                >
                  {recurrenceLabels[value]}
                </button>
              );
            })}
          </div>

          {/* Columna derecha (Misión 3): "el panel mutante" — fondo oscuro fijo, sin inputs nativos. */}
          <div className="w-60 shrink-0 border-l border-white/5 bg-gray-900 p-3">
            <MutantPanel
              recurrence={recurrence}
              exactDate={exactDate}
              selectedWeekDays={selectedWeekDays}
              selectedMonthDays={selectedMonthDays}
              onExactDateChange={onExactDateChange}
              onToggleWeekDay={onToggleWeekDay}
              onToggleMonthDay={onToggleMonthDay}
              texts={texts}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type MutantPanelProps = {
  recurrence: Recurrence;
  exactDate: string;
  selectedWeekDays: number[];
  selectedMonthDays: number[];
  onExactDateChange: (date: string) => void;
  onToggleWeekDay: (day: number) => void;
  onToggleMonthDay: (day: number) => void;
  texts: (typeof datePopoverTextByLanguage)[Language];
  language: Language;
};

/**
 * El panel a la derecha del popover (Misión 3): decide qué renderizar según
 * `recurrence` y anima la transición entre modos con un fundido + leve
 * desplazamiento (mismo patrón "Lujo Percibido" que el fundido de vistas en
 * `DashboardLayout.tsx` — apagar antes de pintar, subir en el siguiente frame).
 */
function MutantPanel({
  recurrence,
  exactDate,
  selectedWeekDays,
  selectedMonthDays,
  onExactDateChange,
  onToggleWeekDay,
  onToggleMonthDay,
  texts,
  language,
}: MutantPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  useLayoutEffect(() => {
    setIsVisible(false);
    const rafId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, [recurrence]);

  return (
    <div
      className={[
        "min-h-[13rem] transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      ].join(" ")}
    >
      {recurrence === "daily" && (
        <p className="text-sm leading-relaxed text-gray-400">
          {texts.dailyMessage}
        </p>
      )}

      {recurrence === "weekly" && (
        <WeeklyPanel
          label={texts.weeklyPanelLabel}
          selectedWeekDays={selectedWeekDays}
          onToggleWeekDay={onToggleWeekDay}
        />
      )}

      {recurrence === "monthly" && (
        <MonthlyPanel
          label={texts.monthlyPanelLabel}
          selectedMonthDays={selectedMonthDays}
          onToggleMonthDay={onToggleMonthDay}
        />
      )}

      {(recurrence === "none" || recurrence === "yearly") && (
        <CalendarPanel
          selectedDate={exactDate}
          onSelectDate={onExactDateChange}
          language={language}
          prevMonthLabel={texts.prevMonthLabel}
          nextMonthLabel={texts.nextMonthLabel}
        />
      )}
    </div>
  );
}

type WeeklyPanelProps = {
  label: string;
  selectedWeekDays: number[];
  onToggleWeekDay: (day: number) => void;
};

/** 7 botones circulares L-M-X-J-V-S-D (Misión 3): toggle libre, sin límite de días activos. */
function WeeklyPanel({ label, selectedWeekDays, onToggleWeekDay }: WeeklyPanelProps) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {WEEKDAY_OPTIONS.map(({ day, label: dayLabel }) => {
          const isSelected = selectedWeekDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggleWeekDay(day)}
              aria-pressed={isSelected}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-glow-sm"
                  : "border-white/10 text-gray-400 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {dayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type MonthlyPanelProps = {
  label: string;
  selectedMonthDays: number[];
  onToggleMonthDay: (day: number) => void;
};

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

/** Cuadrícula minimalista 1-31 (Misión 3): toggle libre de días del mes activos. */
function MonthlyPanel({ label, selectedMonthDays, onToggleMonthDay }: MonthlyPanelProps) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
        {label}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {MONTH_DAYS.map((day) => {
          const isSelected = selectedMonthDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggleMonthDay(day)}
              aria-pressed={isSelected}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-medium transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "text-gray-400 hover:bg-white/5 hover:text-primary",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type CalendarPanelProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  language: Language;
  prevMonthLabel: string;
  nextMonthLabel: string;
};

type CalendarCell = { iso: string; day: number } | null;

/** Mes clásico de 7 columnas (Misión 3, para `none`/`yearly`): navegación mes a mes, semana arrancando en lunes, selección de UNA sola fecha. */
function CalendarPanel({
  selectedDate,
  onSelectDate,
  language,
  prevMonthLabel,
  nextMonthLabel,
}: CalendarPanelProps) {
  const [viewDate, setViewDate] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = toIsoDate(new Date());

  const monthLabel = useMemo(() => {
    const formatted = new Intl.DateTimeFormat(localeByLanguage[language], {
      month: "long",
      year: "numeric",
    }).format(viewDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [viewDate, language]);

  const cells = useMemo<CalendarCell[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const mondayOffset = (firstWeekday + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: CalendarCell[] = [];
    for (let i = 0; i < mondayOffset; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ iso: toIsoDate(new Date(year, month, day)), day });
    }
    return result;
  }, [viewDate]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
          }
          aria-label={prevMonthLabel}
          title={prevMonthLabel}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors duration-200 hover:bg-white/5 hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <p className="text-xs font-semibold tracking-wide text-gray-200">{monthLabel}</p>
        <button
          type="button"
          onClick={() =>
            setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
          }
          aria-label={nextMonthLabel}
          title={nextMonthLabel}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors duration-200 hover:bg-white/5 hover:text-primary"
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_OPTIONS.map(({ day, label }) => (
          <span
            key={day}
            className="text-center text-[10px] font-medium text-gray-500"
          >
            {label}
          </span>
        ))}

        {cells.map((cell, index) => {
          if (!cell) return <span key={`empty-${index}`} />;
          const isSelected = cell.iso === selectedDate;
          const isToday = cell.iso === today;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              aria-pressed={isSelected}
              className={[
                "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : isToday
                    ? "text-primary ring-1 ring-inset ring-primary/50 hover:bg-white/10"
                    : "text-gray-300 hover:bg-white/10 hover:text-primary",
              ].join(" ")}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DayGroupProps = {
  label: string;
  pending: Challenge[];
  completed: Challenge[];
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onFinishEdit: () => void;
  onRename: (id: string, title: string) => void;
  openMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  completedShowLabel: string;
  completedHideLabel: string;
};

/** Un grupo por fecha (Misión 3): pendientes arriba, completadas colapsadas debajo — nunca se mezclan. */
function DayGroup({
  label,
  pending,
  completed,
  completedShowLabel,
  completedHideLabel,
  ...taskRowProps
}: DayGroupProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <section>
      <div className="mb-2 flex items-center gap-3">
        <h3 className="shrink-0 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </h3>
        <div className="h-px flex-1 bg-wenge-border-subtle" />
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col divide-y divide-wenge-border-subtle">
          {pending.map((item) => (
            <TaskRow key={item.id} challenge={item} {...taskRowProps} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setShowCompleted((current) => !current)}
            aria-expanded={showCompleted}
            className="flex items-center gap-1.5 px-1 py-2 text-xs font-medium tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            <ChevronDown
              className={[
                "h-3.5 w-3.5 transition-transform duration-300",
                showCompleted ? "rotate-0" : "-rotate-90",
              ].join(" ")}
              strokeWidth={2}
            />
            {showCompleted ? completedHideLabel : completedShowLabel}
          </button>

          {showCompleted && (
            <div className="flex flex-col divide-y divide-wenge-border-subtle border-t border-wenge-border-subtle">
              {completed.map((item) => (
                <TaskRow key={item.id} challenge={item} {...taskRowProps} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type TaskRowProps = {
  challenge: Challenge;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onFinishEdit: () => void;
  onRename: (id: string, title: string) => void;
  openMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TaskRow({
  challenge,
  editingId,
  onStartEdit,
  onFinishEdit,
  onRename,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
  onToggle,
  onDelete,
}: TaskRowProps) {
  const isEditing = editingId === challenge.id;
  const [draftTitle, setDraftTitle] = useState(challenge.title);
  const isRecurring = challenge.recurrence !== "none";

  useEffect(() => {
    setDraftTitle(challenge.title);
  }, [challenge.title]);

  const commitRename = () => {
    const trimmed = draftTitle.trim();
    onRename(challenge.id, trimmed || challenge.title);
    onFinishEdit();
  };

  return (
    <div
      className={[
        "group flex items-center gap-3 py-2.5 transition-opacity duration-300",
        challenge.completed ? "opacity-60" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(challenge.id)}
        aria-pressed={challenge.completed}
        aria-label={challenge.title}
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
          challenge.completed
            ? "border-primary bg-primary shadow-glow-sm"
            : "border-wenge-border-subtle group-hover:border-primary group-hover:shadow-glow-sm",
        ].join(" ")}
      >
        {challenge.completed && (
          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
        )}
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitRename();
            if (event.key === "Escape") {
              setDraftTitle(challenge.title);
              onFinishEdit();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-primary bg-background/60 px-2 py-1 text-sm text-foreground outline-none transition-all duration-300 focus:shadow-glow-sm"
        />
      ) : (
        <span
          className={[
            "flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm transition-colors duration-300",
            challenge.completed
              ? "text-muted-foreground line-through"
              : "text-secondary-foreground group-hover:text-foreground",
          ].join(" ")}
        >
          <span className="truncate">{challenge.title}</span>
          {isRecurring && (
            <Repeat
              className="h-3 w-3 shrink-0 text-primary/70"
              strokeWidth={2}
            />
          )}
        </span>
      )}

      {!isEditing && (
        <TaskMenu
          isOpen={openMenuId === challenge.id}
          onToggle={() => onToggleMenu(challenge.id)}
          onClose={onCloseMenu}
          onEdit={() => {
            onCloseMenu();
            onStartEdit(challenge.id);
          }}
          onDelete={() => {
            onCloseMenu();
            onDelete(challenge.id);
          }}
        />
      )}
    </div>
  );
}

type TaskMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** Menú kebab "Premium Dark" — portal flotante para no quedar bajo filas adyacentes. */
function TaskMenu({ isOpen, onToggle, onClose, onEdit, onDelete }: TaskMenuProps) {
  const { dict } = useLanguage();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={dict.challenges.menuLabel}
        className="premium-btn flex h-7 w-7 items-center justify-center rounded-md text-icon-muted transition-all duration-300 hover:text-primary hover:shadow-glow-sm"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>

      <PortalMenu
        open={isOpen}
        anchorRef={buttonRef}
        onClose={onClose}
        className="w-40 rounded-lg border border-wenge-border-subtle bg-cuervo p-1.5 shadow-glow-card"
      >
        <button
          type="button"
          role="menuitem"
          onClick={onEdit}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-secondary-foreground transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.challenges.editAction}
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={onDelete}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-rose-400/90 transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.challenges.deleteAction}
        </button>
      </PortalMenu>
    </div>
  );
}
