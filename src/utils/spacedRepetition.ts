/**
 * "El Motor Matemático" — implementación pura (sin estado, sin I/O) del
 * algoritmo SM-2 (SuperMemo, Wozniak 1990), en su variante de 4 grados de
 * calidad — la misma que describe `ArgumentsView.tsx` ("Fundamentos
 * Científicos" → "Repetición Espaciada y el Algoritmo SM-2").
 *
 * Consumido por `StudyView.tsx` (el "Quirófano Matemático"): cada vez que el
 * Centro de Mando Táctico califica una tarjeta ya volteada, `calculateSM2`
 * traduce esa calificación en el próximo intervalo (días), el nuevo Ease
 * Factor y la próxima fecha de repaso (`nextReviewDate`) — las tres se
 * persisten de vuelta en la tarjeta (`StudyCardData`, ver `src/types/deck.ts`)
 * y viajan directo a disco a través de `src/lib/deckStore.ts` (Sellado de la
 * Memoria, Misión 2).
 */

/** 0 = Olvidado, 1 = Difícil, 2 = Bueno, 3 = Fácil — las 4 calificaciones del Centro de Mando Táctico. */
export type ReviewQuality = 0 | 1 | 2 | 3;

/** Etiquetas canónicas de cada calidad — única fuente de verdad para la UI y para el log de auditoría. */
export const REVIEW_QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: "Olvidado",
  1: "Difícil",
  2: "Bueno",
  3: "Fácil",
};

/** Ease Factor de partida para cualquier tarjeta nueva — nunca se inventa un valor distinto fuera de aquí. */
export const DEFAULT_EASE_FACTOR = 2.5;

/** Piso duro del EF: por debajo de 1.3 el algoritmo original de Wozniak se desestabiliza (intervalos que colapsan a cero). */
const MIN_EASE_FACTOR = 1.3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type SM2Params = {
  quality: ReviewQuality;
  /** Intervalo actual, en días. Se sanea a 1 si llega en 0/negativo (tarjeta nunca repasada). */
  currentInterval: number;
  /** Ease Factor actual. Por defecto `DEFAULT_EASE_FACTOR` (2.5) para tarjetas sin historial. */
  easeFactor?: number;
  /** Instante desde el que se cuenta el próximo intervalo — por defecto "ahora". Parametrizable solo para pruebas deterministas. */
  now?: Date;
};

export type SM2Result = {
  /** Próximo intervalo, en días (redondeado a 1 decimal). */
  nextInterval: number;
  /** Nuevo Ease Factor (redondeado a 2 decimales, nunca por debajo de `MIN_EASE_FACTOR`). */
  newEaseFactor: number;
  /** ISO 8601 — el instante exacto (`now + nextInterval` días) en que la tarjeta vuelve a estar "due" (Misión 3). */
  nextReviewDate: string;
};

/**
 * Calcula el próximo intervalo, el nuevo Ease Factor y la próxima fecha de
 * repaso según la calidad de la respuesta:
 *
 * - 0 (Olvidado): el olvido reinicia el intervalo a 1 día y penaliza el EF.
 * - 1 (Difícil): el intervalo avanza poco (×1.2) y el EF baja levemente.
 * - 2 (Bueno): el intervalo avanza según el EF vigente, que no cambia.
 * - 3 (Fácil): el intervalo avanza con un bono extra (×1.3) y el EF sube.
 */
export function calculateSM2({
  quality,
  currentInterval,
  easeFactor = DEFAULT_EASE_FACTOR,
  now = new Date(),
}: SM2Params): SM2Result {
  const interval = currentInterval > 0 ? currentInterval : 1;

  let nextInterval: number;
  let newEaseFactor: number;

  switch (quality) {
    case 0:
      nextInterval = 1;
      newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      break;
    case 1:
      nextInterval = interval * 1.2;
      newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      break;
    case 2:
      nextInterval = interval * easeFactor;
      newEaseFactor = easeFactor;
      break;
    case 3:
      nextInterval = interval * easeFactor * 1.3;
      newEaseFactor = easeFactor + 0.15;
      break;
    default: {
      const exhaustive: never = quality;
      throw new Error(`Calidad de respuesta SM-2 desconocida: ${exhaustive}`);
    }
  }

  const roundedInterval = roundTo(nextInterval, 1);

  return {
    nextInterval: roundedInterval,
    newEaseFactor: roundTo(newEaseFactor, 2),
    nextReviewDate: addDays(now, roundedInterval).toISOString(),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * MS_PER_DAY);
}

/** Rellena `interval`/`easeFactor`/`nextReviewDate` con sus defaults para tarjetas que aún no tienen historial SM-2 (p. ej. persistidas antes del Sellado de la Memoria). */
export function ensureSrsDefaults(card: {
  interval?: number;
  easeFactor?: number;
  nextReviewDate?: string;
}): { interval: number; easeFactor: number; nextReviewDate: string } {
  return {
    interval: card.interval ?? 1,
    easeFactor: card.easeFactor ?? DEFAULT_EASE_FACTOR,
    // Sin fecha registrada = nunca se sabe cuándo revisarla → se trata como
    // "due ahora mismo", exactamente el mismo trato que una tarjeta nueva.
    nextReviewDate: card.nextReviewDate ?? new Date().toISOString(),
  };
}

/**
 * Estado SM-2 de partida para una tarjeta recién creada: intervalo 1,
 * Ease Factor por defecto y `nextReviewDate` = ahora mismo — así entra de
 * inmediato en la cola de estudio activa (Misión 3, "tarjetas completamente
 * nuevas") sin necesitar una bandera `isNew` aparte.
 */
export function createInitialSrsState(now: Date = new Date()): {
  interval: number;
  easeFactor: number;
  nextReviewDate: string;
} {
  return {
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReviewDate: now.toISOString(),
  };
}

/**
 * "El Filtro del Olvido" (Misión 3): una tarjeta entra en la cola de
 * estudio activa si y solo si ya venció su repaso (`nextReviewDate <= now`).
 * Una fecha ilegible/ausente se trata como vencida — más seguro fallar
 * mostrando la tarjeta que ocultándola por un dato corrupto.
 */
export function isCardDue(
  nextReviewDate: string | undefined,
  now: Date = new Date(),
): boolean {
  if (!nextReviewDate) return true;
  const due = Date.parse(nextReviewDate);
  if (Number.isNaN(due)) return true;
  return due <= now.getTime();
}
