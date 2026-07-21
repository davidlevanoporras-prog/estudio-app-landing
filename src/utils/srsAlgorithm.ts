/**
 * Motor de Repetición Espaciada (SRS) — SM-2 modificado.
 * Función pura: sin I/O, sin estado global, sin dependencias de UI.
 */

/** 1 = Otra vez/Fallo, 2 = Difícil, 3 = Bien, 4 = Fácil. */
export type ReviewGrade = 1 | 2 | 3 | 4;

/** Estado SRS de entrada (subconjunto de `Flashcard`). */
export type SrsCardState = {
  interval: number;
  easeFactor: number;
  repetitions: number;
};

export type NextReviewResult = {
  newInterval: number;
  newEaseFactor: number;
  newRepetitions: number;
  /** ISO 8601: ahora + `newInterval` días. */
  nextReviewDate: string;
};

/** Ease Factor por defecto (SM-2 clínico). */
export const SRS_DEFAULT_EASE_FACTOR = 2.5;

/** Piso del EF — por debajo el algoritmo se desestabiliza. */
export const SRS_MIN_EASE_FACTOR = 1.3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CalculateNextReviewInput = SrsCardState & {
  grade: ReviewGrade;
  /** Reloj inyectable para pruebas deterministas. Por defecto: ahora. */
  now?: Date;
};

/**
 * Calcula el próximo estado SRS tras una calificación del usuario.
 *
 * - Grade 1 (Fallo): reinicia racha, intervalo = 1 día, EF baja (mín. 1.3).
 * - Grade 2 (Difícil): EF baja un poco, intervalo crece poco (×1.2).
 * - Grade 3 (Bien): EF se mantiene, intervalo × easeFactor.
 * - Grade 4 (Fácil): EF sube, intervalo crece de forma exponencial (× EF × 1.3).
 */
export function calculateNextReview({
  interval,
  easeFactor,
  repetitions,
  grade,
  now = new Date(),
}: CalculateNextReviewInput): NextReviewResult {
  const currentInterval = interval > 0 ? interval : 1;
  const currentEF =
    Number.isFinite(easeFactor) && easeFactor > 0
      ? easeFactor
      : SRS_DEFAULT_EASE_FACTOR;

  let newInterval: number;
  let newEaseFactor: number;
  let newRepetitions: number;

  switch (grade) {
    case 1:
      newRepetitions = 0;
      newInterval = 1;
      newEaseFactor = Math.max(SRS_MIN_EASE_FACTOR, currentEF - 0.2);
      break;
    case 2:
      newRepetitions = repetitions + 1;
      newInterval = currentInterval * 1.2;
      newEaseFactor = Math.max(SRS_MIN_EASE_FACTOR, currentEF - 0.15);
      break;
    case 3:
      newRepetitions = repetitions + 1;
      newInterval = currentInterval * currentEF;
      newEaseFactor = currentEF;
      break;
    case 4:
      newRepetitions = repetitions + 1;
      newInterval = currentInterval * currentEF * 1.3;
      newEaseFactor = currentEF + 0.15;
      break;
    default: {
      const exhaustive: never = grade;
      throw new Error(`Calificación SRS desconocida: ${exhaustive}`);
    }
  }

  const roundedInterval = roundTo(newInterval, 1);
  const roundedEF = roundTo(newEaseFactor, 2);

  return {
    newInterval: roundedInterval,
    newEaseFactor: roundedEF,
    newRepetitions,
    nextReviewDate: new Date(
      now.getTime() + roundedInterval * MS_PER_DAY,
    ).toISOString(),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
