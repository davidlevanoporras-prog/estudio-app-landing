import { getSecureJSON, setSecureJSON } from "./secureStorage";

const GLOBAL_TIMER_STORAGE_KEY = "estudio-global-timer";

type PersistedTimerState = {
  elapsedSeconds: number;
  isPaused: boolean;
  /** `Date.now()` del último guardado — permite reconstruir el tiempo transcurrido tras un reload. */
  lastTimestamp: number | null;
};

export type GlobalTimerSnapshot = {
  elapsedSeconds: number;
  isPaused: boolean;
};

function isPersistedTimerState(value: unknown): value is PersistedTimerState {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PersistedTimerState).elapsedSeconds === "number" &&
    typeof (value as PersistedTimerState).isPaused === "boolean"
  );
}

/**
 * "Cronómetro Inmortal": el reloj no vive en ningún componente de vista —
 * vive aquí. Al recargar la página, reconstruye el tiempo transcurrido
 * mientras estuvo "corriendo" comparando `lastTimestamp` contra ahora, así
 * que solo Pausar detiene de verdad el conteo; cerrar la pestaña no lo hace.
 */
export function loadGlobalTimer(): GlobalTimerSnapshot {
  try {
    const parsed = getSecureJSON<unknown>(GLOBAL_TIMER_STORAGE_KEY);
    if (!parsed || !isPersistedTimerState(parsed)) {
      return { elapsedSeconds: 0, isPaused: false };
    }

    if (parsed.isPaused || !parsed.lastTimestamp) {
      return { elapsedSeconds: parsed.elapsedSeconds, isPaused: parsed.isPaused };
    }

    const driftSeconds = Math.max(
      0,
      Math.floor((Date.now() - parsed.lastTimestamp) / 1000),
    );
    return { elapsedSeconds: parsed.elapsedSeconds + driftSeconds, isPaused: false };
  } catch {
    return { elapsedSeconds: 0, isPaused: false };
  }
}

export function saveGlobalTimer(elapsedSeconds: number, isPaused: boolean): void {
  try {
    const state: PersistedTimerState = {
      elapsedSeconds,
      isPaused,
      lastTimestamp: Date.now(),
    };
    setSecureJSON(GLOBAL_TIMER_STORAGE_KEY, state);
  } catch {
    /* localStorage no disponible — el cronómetro sigue corriendo en memoria esta sesión */
  }
}

/** `HH:MM:SS` — formato de cronómetro de largo aliento, siempre con horas visibles. */
export function formatGlobalTime(totalSeconds: number): string {
  const safe =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? Math.floor(totalSeconds)
      : 0;
  const pad = (value: number) => String(value).padStart(2, "0");
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

type DurationLabels = {
  hoursMinutes: string;
  minutes: string;
  seconds: string;
};

const DEFAULT_DURATION_LABELS: DurationLabels = {
  hoursMinutes: "{{h}}h {{m}}m",
  minutes: "{{m}}m",
  seconds: "{{s}}s",
};

function fillDuration(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Formato legible corto para tarjetas y barras (`2h 15m`, `15m`, `42s`). */
export function formatDurationHuman(
  totalSeconds: number,
  labels: DurationLabels = DEFAULT_DURATION_LABELS,
): string {
  const safe =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? Math.floor(totalSeconds)
      : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours > 0) {
    return fillDuration(labels.hoursMinutes, { h: hours, m: minutes });
  }
  if (minutes > 0) return fillDuration(labels.minutes, { m: minutes });
  return fillDuration(labels.seconds, { s: safe });
}
