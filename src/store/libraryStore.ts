import { create } from "zustand";
import type {
  ClozeCard,
  Folder,
  SimulationDeck,
} from "../types/simulator";
import { getSecureJSON, setSecureJSON } from "../lib/secureStorage";

const LIBRARY_STORAGE_KEY = "excellence-simulator-library";

type LibrarySnapshot = {
  folders: Folder[];
  decks: SimulationDeck[];
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/** FTUE: biblioteca vacía — sin carpetas ni mazos de demostración. */
function emptyLibrary(): LibrarySnapshot {
  return { folders: [], decks: [] };
}

function loadSnapshot(): LibrarySnapshot {
  try {
    const parsed = getSecureJSON<Partial<LibrarySnapshot>>(LIBRARY_STORAGE_KEY);
    if (!parsed) return emptyLibrary();
    if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.decks)) {
      return emptyLibrary();
    }
    return {
      folders: parsed.folders as Folder[],
      decks: parsed.decks as SimulationDeck[],
    };
  } catch {
    return emptyLibrary();
  }
}

function persistSnapshot(folders: Folder[], decks: SimulationDeck[]): void {
  try {
    const payload: LibrarySnapshot = { folders, decks };
    setSecureJSON(LIBRARY_STORAGE_KEY, payload);
  } catch (error) {
    console.error("[libraryStore] No se pudo persistir la biblioteca:", error);
  }
}

interface LibraryStoreState {
  folders: Folder[];
  decks: SimulationDeck[];

  createFolder: (name: string, parentId?: string | null) => string;
  updateFolder: (id: string, patch: Partial<Pick<Folder, "name" | "parentId">>) => void;
  deleteFolder: (id: string) => void;

  createDeck: (title: string, folderId?: string | null) => string;
  updateDeck: (
    id: string,
    patch: Partial<Pick<SimulationDeck, "title" | "folderId" | "cards">>,
  ) => void;
  deleteDeck: (id: string) => void;
  moveDeck: (deckId: string, folderId: string | null) => void;

  addCard: (deckId: string, card?: Partial<ClozeCard>) => void;
  updateCard: (
    deckId: string,
    cardId: string,
    patch: Partial<Omit<ClozeCard, "id">>,
  ) => void;
  deleteCard: (deckId: string, cardId: string) => void;

  /** Inyecta mazos importados (`.easim.json`) en la raíz de la biblioteca. */
  importDecks: (decks: SimulationDeck[]) => string[];
}

const initial = loadSnapshot();

export const useLibraryStore = create<LibraryStoreState>((set, get) => ({
  folders: initial.folders,
  decks: initial.decks,

  createFolder: (name, parentId = null) => {
    const id = createId("folder");
    const folder: Folder = {
      id,
      name: name.trim() || "New folder",
      parentId,
    };
    const folders = [...get().folders, folder];
    set({ folders });
    persistSnapshot(folders, get().decks);
    return id;
  },

  updateFolder: (id, patch) => {
    const folders = get().folders.map((folder) =>
      folder.id === id
        ? {
            ...folder,
            ...patch,
            name:
              patch.name !== undefined
                ? patch.name.trim() || folder.name
                : folder.name,
          }
        : folder,
    );
    set({ folders });
    persistSnapshot(folders, get().decks);
  },

  deleteFolder: (id) => {
    // Los mazos de la carpeta quedan huérfanos en la raíz.
    const folders = get().folders.filter((folder) => folder.id !== id);
    const decks = get().decks.map((deck) =>
      deck.folderId === id ? { ...deck, folderId: null } : deck,
    );
    set({ folders, decks });
    persistSnapshot(folders, decks);
  },

  createDeck: (title, folderId = null) => {
    const id = createId("deck");
    const deck: SimulationDeck = {
      id,
      title: title.trim() || "New deck",
      folderId,
      cards: [],
    };
    const decks = [...get().decks, deck];
    set({ decks });
    persistSnapshot(get().folders, decks);
    return id;
  },

  updateDeck: (id, patch) => {
    const decks = get().decks.map((deck) =>
      deck.id === id
        ? {
            ...deck,
            ...patch,
            title:
              patch.title !== undefined
                ? patch.title.trim() || deck.title
                : deck.title,
          }
        : deck,
    );
    set({ decks });
    persistSnapshot(get().folders, decks);
  },

  deleteDeck: (id) => {
    const decks = get().decks.filter((deck) => deck.id !== id);
    set({ decks });
    persistSnapshot(get().folders, decks);
  },

  moveDeck: (deckId, folderId) => {
    get().updateDeck(deckId, { folderId });
  },

  addCard: (deckId, card) => {
    const next: ClozeCard = {
      id: createId("card"),
      textBefore: card?.textBefore ?? "",
      textAfter: card?.textAfter ?? "",
      answer: card?.answer ?? "",
      distractors: card?.distractors ?? [],
      ...(card?.segments ? { segments: card.segments } : {}),
      ...(card?.answers ? { answers: card.answers } : {}),
    };
    const decks = get().decks.map((deck) =>
      deck.id === deckId ? { ...deck, cards: [...deck.cards, next] } : deck,
    );
    set({ decks });
    persistSnapshot(get().folders, decks);
  },

  updateCard: (deckId, cardId, patch) => {
    const decks = get().decks.map((deck) => {
      if (deck.id !== deckId) return deck;
      return {
        ...deck,
        cards: deck.cards.map((c) =>
          c.id === cardId ? { ...c, ...patch } : c,
        ),
      };
    });
    set({ decks });
    persistSnapshot(get().folders, decks);
  },

  deleteCard: (deckId, cardId) => {
    const decks = get().decks.map((deck) =>
      deck.id === deckId
        ? { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) }
        : deck,
    );
    set({ decks });
    persistSnapshot(get().folders, decks);
  },

  importDecks: (incoming) => {
    if (incoming.length === 0) return [];
    const stamped = incoming.map((deck) => ({
      ...deck,
      folderId: null as string | null,
      cards: deck.cards.map((card) => ({ ...card })),
    }));
    const decks = [...get().decks, ...stamped];
    set({ decks });
    persistSnapshot(get().folders, decks);
    return stamped.map((d) => d.id);
  },
}));
