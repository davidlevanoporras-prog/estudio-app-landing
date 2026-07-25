/**
 * Tipos del Simulador (Interactive Cloze + biblioteca de mazos/carpetas).
 */

import type { ClozeSegment } from "../utils/parseClozeSyntax";

/** Tarjeta de hueco interactivo (uno o varios `[[...]]`). */
export interface ClozeCard {
  id: string;
  /** Texto antes del primer hueco (legacy / compat). */
  textBefore: string;
  /** Texto después del primer hueco (legacy; puede re-serializar huecos restantes). */
  textAfter: string;
  /** Primera respuesta correcta (compat con mazos antiguos). */
  answer: string;
  /** Opciones incorrectas. */
  distractors: string[];
  /**
   * Segmentos texto/hueco del enunciado completo.
   * Si falta, se reconstruye desde textBefore/answer/textAfter.
   */
  segments?: ClozeSegment[];
  /** Todas las respuestas en orden (multi-hueco). */
  answers?: string[];
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
