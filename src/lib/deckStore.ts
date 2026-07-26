import { ensureSrsDefaults } from "../utils/spacedRepetition";
import type { Deck, StudyCardData } from "../types/deck";
import { resolveQuestionImage } from "../types/deck";
import { getVaultValue, isVaultAvailable, setAndPersist } from "./appStore";
import { getSecureJSON, setSecureJSON } from "./secureStorage";
import { VAULT_KEYS } from "./vaultKeys";

/**
 * Persistencia de mazos — FTUE zero-data: primer arranque = `[]`, sin mazo demo.
 *
 * FUENTE DE VERDAD de la UI (Flashcards / Study / Dashboard):
 * Tauri Store cifrado `app_data.dat` vía `appStore` (`VAULT_KEYS.decks`).
 *
 * TODO(unify-vault): Unificar con `src/store/flashcardStore.ts` +
 * `excellence_vault.json` (`storageService`). Hoy son canales distintos
 * (sin colisión de archivo). NO fusionar en pre-launch sin migración
 * y un único schema — riesgo alto de pérdida de mazos.
 */

const LEGACY_DECKS_STORAGE_KEY = "estudio-decks";

function isStudyCard(value: unknown): value is StudyCardData {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as StudyCardData).id === "number" &&
    typeof (value as StudyCardData).front === "string" &&
    typeof (value as StudyCardData).back === "string"
  );
}

function isDeck(value: unknown): value is Deck {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Deck).id === "string" &&
    typeof (value as Deck).name === "string"
  );
}

function normalizeCard(card: StudyCardData): StudyCardData {
  const imageQuestion = resolveQuestionImage(card);
  const { imageId: _legacy, ...rest } = card;
  return {
    ...rest,
    ...ensureSrsDefaults(card),
    ...(imageQuestion ? { imageQuestion } : {}),
  };
}

function normalizeDeck(deck: Deck): Deck {
  return {
    ...deck,
    cards: Array.isArray(deck.cards)
      ? deck.cards.filter(isStudyCard).map(normalizeCard)
      : [],
  };
}

function readLegacyLocalDecks(): Deck[] | null {
  try {
    const parsed = getSecureJSON<unknown>(LEGACY_DECKS_STORAGE_KEY);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isDeck).map(normalizeDeck);
  } catch {
    return null;
  }
}

/**
 * Lee mazos desde la bóveda. Primer arranque (sin clave ni legado) → `[]`.
 * Si hay rastro `localStorage` pre-bóveda, se migra una sola vez.
 */
export async function loadDecks(): Promise<Deck[]> {
  if (!isVaultAvailable()) {
    return readLegacyLocalDecks() ?? [];
  }

  const stored = await getVaultValue<Deck[]>(VAULT_KEYS.decks);
  if (Array.isArray(stored)) {
    return stored.filter(isDeck).map(normalizeDeck);
  }

  const legacy = readLegacyLocalDecks();
  const initial = legacy ?? [];
  await saveDecks(initial);
  if (legacy) localStorage.removeItem(LEGACY_DECKS_STORAGE_KEY);
  return initial;
}

export async function saveDecks(decks: Deck[]): Promise<void> {
  if (!isVaultAvailable()) {
    try {
      setSecureJSON(LEGACY_DECKS_STORAGE_KEY, decks);
    } catch {
      /* ignore */
    }
    return;
  }

  await setAndPersist(VAULT_KEYS.decks, decks);
}
