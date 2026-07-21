import { createInitialSrsState } from "../utils/spacedRepetition";
import type { Deck, StudyCardData } from "../types/deck";

/**
 * "El Mazo Simulado" — datos de prueba de nivel universitario para el
 * Quirófano Matemático (`StudyView.tsx`): tres tarjetas, tres materias
 * distintas, cada una arrancando con el intervalo y el Ease Factor de
 * partida del algoritmo SM-2 (ver `src/utils/spacedRepetition.ts`).
 *
 * Se siembra una única vez, solo si el usuario nunca tuvo mazos guardados
 * (`loadStoredDecks()` en `DashboardLayout.tsx`, primer arranque real: la
 * clave de `localStorage` nunca existió) — así cualquiera que abra la app
 * puede probar la repetición espaciada de inmediato, sin bloquear a quien
 * borró sus mazos a propósito (ese caso conserva su mazo vacío).
 */
function demoCard(
  id: number,
  tag: string,
  front: string,
  back: string,
): StudyCardData {
  return {
    id,
    front,
    back,
    hint: "",
    tag,
    // "Completamente nueva" (Misión 3): `nextReviewDate` = ahora, así entra
    // directo en la cola de estudio activa del Filtro del Olvido.
    ...createInitialSrsState(),
  };
}

export function createDemoDeck(): Deck {
  return {
    id: "deck-demo-universitario",
    name: "Demo · Fundamentos Universitarios",
    cards: [
      demoCard(
        1,
        "Anatomía",
        "¿Cuál es el hueso más largo y fuerte del cuerpo humano?",
        "El fémur — el hueso del muslo, que conecta la cadera con la rodilla.",
      ),
      demoCard(
        2,
        "Física",
        "Enuncia la Segunda Ley de Newton.",
        "F = m · a — la fuerza neta sobre un objeto es igual a su masa multiplicada por su aceleración.",
      ),
      demoCard(
        3,
        "Matemáticas",
        "¿Cuál es la derivada de sin(x) respecto a x?",
        "cos(x).",
      ),
    ],
  };
}
