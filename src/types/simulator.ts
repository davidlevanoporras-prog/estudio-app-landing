/**
 * Tipos del Simulador (Interactive Cloze + biblioteca de mazos/carpetas).
 */

/** Tarjeta de hueco interactivo. */
export interface ClozeCard {
  id: string;
  /** Texto antes del hueco. */
  textBefore: string;
  /** Texto después del hueco. */
  textAfter: string;
  /** Respuesta correcta. */
  answer: string;
  /** Opciones incorrectas. */
  distractors: string[];
}

/** Mazo de simulación. */
export interface SimulationDeck {
  id: string;
  title: string;
  cards: ClozeCard[];
  /** `null` = mazo en la raíz (huérfano / sin carpeta). */
  folderId: string | null;
}

/** Carpeta de la biblioteca del simulador. */
export interface Folder {
  id: string;
  name: string;
  /** `null` = carpeta raíz. Preparado para subcarpetas. */
  parentId: string | null;
}
