/** Una tarjeta de estudio individual (Método Inductivo: pregunta → pista → respuesta). */
export type StudyCardData = {
  id: number;
  front: string;
  hint: string;
  back: string;
  /** Referencia a un blob guardado en IndexedDB (ver `src/utils/mediaStore.ts`) — nunca Base64. */
  imageId?: string;
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
