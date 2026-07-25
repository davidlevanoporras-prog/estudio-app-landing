/** Una tarjeta de estudio individual (Método Inductivo: pregunta → pista → respuesta). */
export type StudyCardData = {
  id: number;
  front: string;
  hint: string;
  back: string;
  /**
   * @deprecated Usar `imageQuestion`. Se conserva solo para mazos legacy;
   * `normalizeCard` / `resolveQuestionImage` lo migran en lectura.
   */
  imageId?: string;
  /** Imagen adjunta al campo Pregunta (IndexedDB — ver `mediaStore`). */
  imageQuestion?: string;
  /** Imagen adjunta al campo Pista. */
  imageHint?: string;
  /** Imagen adjunta al campo Respuesta. */
  imageAnswer?: string;
  /** Etiqueta corta de materia/tema (ej. "Anatomía") — se muestra en la Tarjeta Monolítica 3D. */
  tag?: string;
  /**
   * Estado del motor de Repetición Espaciada (ver `src/utils/spacedRepetition.ts`,
   * algoritmo SM-2) — "Sellado de la Memoria": estas tres variables son
   * OBLIGATORIAS para toda tarjeta que exista dentro de un `Deck`, porque
   * son exactamente lo que se persiste en disco físico a través de la
   * Bóveda de Titanio (`src/lib/deckStore.ts`) y lo que decide, en cada
   * arranque de `StudyView.tsx`, qué tarjetas entran en la cola de estudio
   * activa (Misión 3 — el Filtro del Olvido). Toda tarjeta creada
   * (`spacedRepetition.createInitialSrsState()`) o leída desde disco
   * (`deckStore.normalizeDeck()`) pasa por defaults antes de llegar aquí,
   * así que en tiempo de ejecución nunca falta ninguna.
   */
  interval: number;
  easeFactor: number;
  /** ISO 8601 (`Date.prototype.toISOString()`) — fecha/hora exacta en que la tarjeta vuelve a estar "due". */
  nextReviewDate: string;
};

export type Deck = {
  id: string;
  name: string;
  cards: StudyCardData[];
};

/** Imagen de pregunta: campo nuevo o legado `imageId`. */
export function resolveQuestionImage(card: StudyCardData): string | undefined {
  return card.imageQuestion ?? card.imageId;
}

/** Todos los IDs de blob asociados a una tarjeta (para limpieza IndexedDB). */
export function collectCardImageIds(card: StudyCardData): string[] {
  const ids = [
    resolveQuestionImage(card),
    card.imageHint,
    card.imageAnswer,
  ].filter((id): id is string => typeof id === "string" && id.length > 0);
  return [...new Set(ids)];
}
