import { create } from "zustand";
import { loadVaultData, saveVaultData } from "../services/storageService";
import {
  INITIAL_SRS_STATE,
  type Deck,
  type Flashcard,
} from "../types/schema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Suelo clínico del factor de facilidad (SM-2). */
const EF_FLOOR = 1.3;

/**
 * Evita que el `subscribe` escriba disco durante hidratación / syncWithDisk
 * (un pull desde la nube no debe reescribir el archivo y pisar el reloj).
 */
let isHydrating = false;

/**
 * Motor clínico SM-2.
 * `grade` ∈ [0, 5]: calidad de la respuesta del usuario.
 */
function applySm2Review(card: Flashcard, grade: number): Flashcard {
  const quality = Math.min(5, Math.max(0, grade));

  const delta = 5 - quality;
  const nuevoEF = Math.max(
    EF_FLOOR,
    card.easeFactor + (0.1 - delta * (0.08 + delta * 0.02)),
  );

  const repetitions = quality < 3 ? 0 : card.repetitions + 1;

  let interval: number;
  if (repetitions === 0 || quality < 3) {
    interval = 1;
  } else if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(card.interval * nuevoEF);
  }

  return {
    ...card,
    easeFactor: nuevoEF,
    repetitions,
    interval,
    nextReview: new Date(Date.now() + interval * MS_PER_DAY).toISOString(),
  };
}

function touchDeck(deck: Deck): Deck {
  return { ...deck, lastModified: Date.now() };
}

interface FlashcardStoreState {
  decks: Deck[];
  flashcards: Flashcard[];
  /**
   * Reloj de la bóveda en memoria — espejo de `lastModified` del JSON en disco.
   * Sirve para detectar cambios traídos por iCloud/Drive desde otro dispositivo.
   */
  vaultLastModified: number;
  /** `true` tras el primer `initStore()` (éxito o fallo). */
  isReady: boolean;

  /**
   * Hidrata `decks` + `flashcards` desde `excellence_vault.json`.
   * Bóveda vacía o error → estado limpio; nunca tumba la UI.
   */
  initStore: () => Promise<void>;

  /**
   * Sincronización inteligente: si el archivo en disco tiene un
   * `lastModified` estrictamente mayor, reemplaza el estado en silencio.
   */
  syncWithDisk: () => Promise<void>;

  addDeck: (name: string, description?: string) => void;
  updateDeck: (
    id: string,
    patch: Partial<Pick<Deck, "name" | "description">>,
  ) => void;
  deleteDeck: (id: string) => void;

  addCard: (front: string, back: string, deckId: string, tags?: string[]) => void;
  updateCard: (
    id: string,
    patch: Partial<Omit<Flashcard, "id">>,
  ) => void;
  deleteCard: (id: string) => void;
  /** Recalcula SRS (SM-2) y actualiza la tarjeta en memoria → el subscribe sella disco. */
  reviewCard: (id: string, grade: number) => void;
}

export const useFlashcardStore = create<FlashcardStoreState>((set, get) => ({
  decks: [],
  flashcards: [],
  vaultLastModified: 0,
  isReady: false,

  initStore: async () => {
    isHydrating = true;
    try {
      const vault = await loadVaultData();
      set({
        decks: vault.decks,
        flashcards: vault.flashcards,
        vaultLastModified: vault.lastModified,
        isReady: true,
      });
    } catch (error) {
      console.error("[flashcardStore] initStore falló — estado limpio:", error);
      set({
        decks: [],
        flashcards: [],
        vaultLastModified: 0,
        isReady: true,
      });
    } finally {
      isHydrating = false;
    }
  },

  syncWithDisk: async () => {
    if (!get().isReady) return;

    try {
      const vault = await loadVaultData();
      if (vault.lastModified <= get().vaultLastModified) return;

      // Otro dispositivo (vía nube) escribió una versión más nueva.
      isHydrating = true;
      set({
        decks: vault.decks,
        flashcards: vault.flashcards,
        vaultLastModified: vault.lastModified,
      });
    } catch (error) {
      console.error("[flashcardStore] syncWithDisk falló:", error);
    } finally {
      isHydrating = false;
    }
  },

  addDeck: (name, description) => {
    const now = Date.now();
    const deck: Deck = {
      id: crypto.randomUUID(),
      name: name.trim() || "Nuevo mazo",
      ...(description !== undefined ? { description } : {}),
      createdAt: new Date(now).toISOString(),
      lastModified: now,
    };
    set({ decks: [...get().decks, deck] });
  },

  updateDeck: (id, patch) => {
    set({
      decks: get().decks.map((deck) =>
        deck.id === id
          ? touchDeck({
              ...deck,
              ...patch,
              name: patch.name !== undefined ? patch.name.trim() || deck.name : deck.name,
            })
          : deck,
      ),
    });
  },

  deleteDeck: (id) => {
    set({
      decks: get().decks.filter((deck) => deck.id !== id),
      flashcards: get().flashcards.filter((card) => card.deckId !== id),
    });
  },

  addCard: (front, back, deckId, tags = []) => {
    const card: Flashcard = {
      id: crypto.randomUUID(),
      deckId,
      front,
      back,
      tags,
      ...INITIAL_SRS_STATE,
      nextReview: new Date().toISOString(),
    };

    set({
      flashcards: [...get().flashcards, card],
      decks: get().decks.map((deck) =>
        deck.id === deckId ? touchDeck(deck) : deck,
      ),
    });
  },

  updateCard: (id, patch) => {
    const previous = get().flashcards.find((card) => card.id === id);
    if (!previous) return;

    const nextDeckId = patch.deckId ?? previous.deckId;
    const touchedDeckIds = new Set([previous.deckId, nextDeckId]);

    set({
      flashcards: get().flashcards.map((card) =>
        card.id === id ? { ...card, ...patch } : card,
      ),
      decks: get().decks.map((deck) =>
        touchedDeckIds.has(deck.id) ? touchDeck(deck) : deck,
      ),
    });
  },

  deleteCard: (id) => {
    const previous = get().flashcards.find((card) => card.id === id);
    if (!previous) return;

    set({
      flashcards: get().flashcards.filter((card) => card.id !== id),
      decks: get().decks.map((deck) =>
        deck.id === previous.deckId ? touchDeck(deck) : deck,
      ),
    });
  },

  reviewCard: (id, grade) => {
    const current = get().flashcards;
    const index = current.findIndex((card) => card.id === id);
    if (index === -1) return;

    const updated = applySm2Review(current[index], grade);
    set({
      flashcards: current.map((card, i) => (i === index ? updated : card)),
      decks: get().decks.map((deck) =>
        deck.id === updated.deckId ? touchDeck(deck) : deck,
      ),
    });
  },
}));

/**
 * Persistencia automática: cualquier mutación de `decks` / `flashcards`
 * tras la hidratación escribe `excellence_vault.json` y actualiza el reloj.
 */
useFlashcardStore.subscribe((state, previous) => {
  if (isHydrating || !state.isReady) return;
  if (
    state.decks === previous.decks &&
    state.flashcards === previous.flashcards
  ) {
    return;
  }

  void saveVaultData(state.decks, state.flashcards).then((writtenAt) => {
    if (writtenAt == null) return;
    // Solo avanza el reloj en memoria; no vuelve a disparar un save.
    useFlashcardStore.setState({ vaultLastModified: writtenAt });
  });
});
