import { create } from "zustand";
import type { ClozeCard } from "../types/simulator";

export type SimulatorSession = {
  /** Cola activa de la sesión (crece si hay fallos — bucle de castigo). */
  cards: ClozeCard[];
  /** Tamaño original del mazo al iniciar (para métricas). */
  initialCount: number;
  deckId: string | null;
  deckTitle: string;
};

interface SimulatorStoreState {
  currentSession: SimulatorSession | null;
  currentIndex: number;
  score: number;
  attempts: number;
  isSessionFinished: boolean;

  /** Arranca una sesión a partir de las tarjetas de un mazo. */
  startSession: (
    cards: ClozeCard[],
    meta?: { deckId?: string; deckTitle?: string },
  ) => void;
  /** Sale de la sesión y vuelve a la biblioteca. */
  endSession: () => void;
  /**
   * Game loop + bucle de castigo:
   * - Acierto → score++
   * - Fallo → la tarjeta actual se vuelve a encolar al final de `cards`
   * - Solo termina cuando no quedan tarjetas pendientes por delante
   */
  nextCard: (isCorrect: boolean) => void;
}

export const useSimulatorStore = create<SimulatorStoreState>((set, get) => ({
  currentSession: null,
  currentIndex: 0,
  score: 0,
  attempts: 0,
  isSessionFinished: false,

  startSession: (cards, meta) => {
    if (cards.length === 0) return;
    set({
      currentSession: {
        cards: cards.map((card) => ({ ...card, distractors: [...card.distractors] })),
        initialCount: cards.length,
        deckId: meta?.deckId ?? null,
        deckTitle: meta?.deckTitle ?? "Sesión",
      },
      currentIndex: 0,
      score: 0,
      attempts: 0,
      isSessionFinished: false,
    });
  },

  endSession: () => {
    set({
      currentSession: null,
      currentIndex: 0,
      score: 0,
      attempts: 0,
      isSessionFinished: false,
    });
  },

  nextCard: (isCorrect) => {
    const { currentSession, currentIndex, score, attempts } = get();
    if (!currentSession) return;

    const nextAttempts = attempts + 1;
    const nextScore = isCorrect ? score + 1 : score;

    let cards = currentSession.cards;
    if (!isCorrect) {
      const failed = cards[currentIndex];
      if (failed) {
        // Bucle de castigo: reaparece obligatoriamente más adelante.
        cards = [...cards, { ...failed, distractors: [...failed.distractors] }];
      }
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      set({
        currentSession: { ...currentSession, cards },
        score: nextScore,
        attempts: nextAttempts,
        isSessionFinished: true,
      });
      return;
    }

    set({
      currentSession: { ...currentSession, cards },
      currentIndex: nextIndex,
      score: nextScore,
      attempts: nextAttempts,
    });
  },
}));
