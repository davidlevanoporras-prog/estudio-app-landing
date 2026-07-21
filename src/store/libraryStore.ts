import { create } from "zustand";
import type {
  ClozeCard,
  Folder,
  SimulationDeck,
} from "../types/simulator";

const LIBRARY_STORAGE_KEY = "excellence-simulator-library";

type LibrarySnapshot = {
  folders: Folder[];
  decks: SimulationDeck[];
};

const SEED_CARDS: ClozeCard[] = [
  {
    id: "cloze-facial",
    textBefore: "El nervio",
    textAfter:
      "es el principal responsable de la inervación motora de la cara.",
    answer: "Facial",
    distractors: ["Trigémino", "Vago", "Hipogloso"],
  },
  {
    id: "cloze-iliopsoas",
    textBefore: "El músculo",
    textAfter: "es el principal flexor de la cadera.",
    answer: "Iliopsoas",
    distractors: ["Glúteo mayor", "Cuádriceps", "Sartorio"],
  },
  {
    id: "cloze-metafase",
    textBefore: "En la fase de",
    textAfter: "los cromosomas se alinean en el ecuador de la célula.",
    answer: "Metafase",
    distractors: ["Profase", "Anafase", "Telofase"],
  },
  {
    id: "cloze-ohm",
    textBefore: "Según la ley de Ohm, V =",
    textAfter: ".",
    answer: "I × R",
    distractors: ["I / R", "I + R", "R / I"],
  },
];

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function seedLibrary(): LibrarySnapshot {
  const folderId = createId("folder");
  return {
    folders: [{ id: folderId, name: "Anatomía", parentId: null }],
    decks: [
      {
        id: createId("deck"),
        title: "Nervios craneales",
        folderId,
        cards: SEED_CARDS,
      },
    ],
  };
}

function loadSnapshot(): LibrarySnapshot {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return seedLibrary();
    const parsed = JSON.parse(raw) as Partial<LibrarySnapshot>;
    if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.decks)) {
      return seedLibrary();
    }
    return {
      folders: parsed.folders as Folder[],
      decks: parsed.decks as SimulationDeck[],
    };
  } catch {
    return seedLibrary();
  }
}

function persistSnapshot(folders: Folder[], decks: SimulationDeck[]): void {
  try {
    const payload: LibrarySnapshot = { folders, decks };
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(payload));
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
}

const initial = loadSnapshot();

export const useLibraryStore = create<LibraryStoreState>((set, get) => ({
  folders: initial.folders,
  decks: initial.decks,

  createFolder: (name, parentId = null) => {
    const id = createId("folder");
    const folder: Folder = {
      id,
      name: name.trim() || "Nueva carpeta",
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
      title: title.trim() || "Nuevo mazo",
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
      textBefore: card?.textBefore ?? "Texto antes del hueco",
      textAfter: card?.textAfter ?? "texto después.",
      answer: card?.answer ?? "Respuesta",
      distractors: card?.distractors ?? ["Opción A", "Opción B", "Opción C"],
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
}));
