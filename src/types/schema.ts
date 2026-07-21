/**
 * Esquema canónico del sistema de flashcards locales (sync + SRS).
 * Contrato estricto de persistencia — sin dependencias de UI.
 *
 * Nota: el runtime actual de estudio (`src/types/deck.ts` → `StudyCardData`)
 * sigue alimentando StudyView; este esquema es la forma objetivo para
 * bóveda local, iCloud/Drive y resolución de conflictos.
 */

/** Factor de facilidad clínico SM-2 para una tarjeta nueva. */
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Contenido de cara de tarjeta.
 * Debe poder alojar Markdown, LaTeX e HTML sin transformación en el tipo.
 */
export type RichCardContent = string;

/**
 * Tarjeta de estudio con estado SuperMemo/Anki-like (SM-2).
 * `id` es UUID; `nextReview` es ISO 8601.
 */
export interface Flashcard {
  /** UUID de la tarjeta. */
  id: string;
  /** UUID del mazo al que pertenece. */
  deckId: string;
  /** Cara frontal — Markdown / LaTeX / HTML. */
  front: RichCardContent;
  /** Cara trasera — Markdown / LaTeX / HTML. */
  back: RichCardContent;
  tags: string[];
  /** Días hasta el próximo repaso. */
  interval: number;
  /** Multiplicador de dificultad. Por defecto `DEFAULT_EASE_FACTOR` (2.5). */
  easeFactor: number;
  /** Racha de aciertos seguidos. */
  repetitions: number;
  /** Fecha ISO del próximo repaso programado. */
  nextReview: string;
}

/**
 * Mazo local.
 * `lastModified` (ms) es la clave de resolución de conflictos entre dispositivos.
 */
export interface Deck {
  /** UUID del mazo. */
  id: string;
  name: string;
  description?: string;
  /** Fecha ISO de creación. */
  createdAt: string;
  /**
   * Timestamp en milisegundos de la última mutación.
   * Crítico para sync en la nube (last-write-wins / merge).
   */
  lastModified: number;
}

/** Estado SRS inicial para una `Flashcard` recién creada. */
export const INITIAL_SRS_STATE = {
  interval: 0,
  easeFactor: DEFAULT_EASE_FACTOR,
  repetitions: 0,
} as const satisfies Pick<
  Flashcard,
  "interval" | "easeFactor" | "repetitions"
>;
