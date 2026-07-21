import { ensureSrsDefaults } from "../utils/spacedRepetition";
import type { Deck, StudyCardData } from "../types/deck";
import { getVaultValue, isVaultAvailable, setAndPersist } from "./appStore";
import { createDemoDeck } from "./demoDeck";
import { VAULT_KEYS } from "./vaultKeys";

/**
 * "Sellado de la Memoria" (Misión 1) — la capa de dominio que sabe qué es un
 * `Deck` y qué campos SM-2 son obligatorios en cada `StudyCardData`, montada
 * sobre los tres verbos genéricos de `lib/appStore.ts` (la Bóveda de
 * Titanio en sí no sabe qué es un mazo, exactamente el mismo patrón que ya
 * usa `lib/streak.ts` para la racha). `DashboardLayout.tsx` es el único
 * consumidor: lee con `loadDecks()` al montar y escribe con `saveDecks()`
 * tras cada mutación — nunca con `localStorage` directo.
 */

/** Clave heredada de la versión pre-Bóveda (antes de este Sellado) — solo se lee una vez, para no perder el progreso de quien actualiza la app. */
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

/** Rellena los defaults SM-2 de una tarjeta — cubre tanto mazos legados (`localStorage`) como cualquier fisura futura en el esquema persistido. */
function normalizeCard(card: StudyCardData): StudyCardData {
  return { ...card, ...ensureSrsDefaults(card) };
}

/** Backfills `cards` (y el estado SM-2 de cada una) para mazos persistidos antes de que existiera este contrato. */
function normalizeDeck(deck: Deck): Deck {
  return {
    ...deck,
    cards: Array.isArray(deck.cards)
      ? deck.cards.filter(isStudyCard).map(normalizeCard)
      : [],
  };
}

/** Único punto de lectura del rastro pre-Bóveda — nunca se vuelve a tocar tras la migración en `loadDecks()`. */
function readLegacyLocalDecks(): Deck[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_DECKS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isDeck).map(normalizeDeck);
  } catch {
    return null;
  }
}

/**
 * Lee TODOS los mazos desde disco físico (`app_data.dat` vía
 * `tauri-plugin-store`). Primer arranque real (la clave nunca existió en la
 * Bóveda):
 *   1. Si hay un rastro de la era `localStorage` (versión anterior a este
 *      Sellado), se migra una única vez y se borra ese rastro.
 *   2. Si no hay nada en absoluto, se siembra "El Mazo Simulado" para que
 *      el Quirófano Matemático tenga contenido de inmediato.
 * Fuera del shell de Tauri (navegador de desarrollo, sin puente IPC) se
 * degrada con elegancia al viejo comportamiento 100% `localStorage`, para
 * no romper `npm run dev`.
 */
export async function loadDecks(): Promise<Deck[]> {
  if (!isVaultAvailable()) {
    return readLegacyLocalDecks() ?? [createDemoDeck()];
  }

  const stored = await getVaultValue<Deck[]>(VAULT_KEYS.decks);
  if (Array.isArray(stored)) {
    return stored.filter(isDeck).map(normalizeDeck);
  }

  const legacy = readLegacyLocalDecks();
  const initial = legacy ?? [createDemoDeck()];
  await saveDecks(initial);
  if (legacy) localStorage.removeItem(LEGACY_DECKS_STORAGE_KEY);
  return initial;
}

/**
 * Sobrescribe y persiste TODOS los mazos en disco físico de inmediato
 * (`set` + `save` en un solo paso, ver `setAndPersist` en `appStore.ts`) —
 * el verbo que `DashboardLayout.tsx` dispara tras CADA mutación de `decks`
 * (crear/renombrar/añadir tarjeta/calificar/reiniciar SRS/borrar), nunca
 * solo al cerrar la app (Misión 2).
 */
export async function saveDecks(decks: Deck[]): Promise<void> {
  if (!isVaultAvailable()) {
    try {
      localStorage.setItem(LEGACY_DECKS_STORAGE_KEY, JSON.stringify(decks));
    } catch {
      /* localStorage no disponible — el progreso queda solo en memoria esta sesión (modo navegador sin Tauri) */
    }
    return;
  }

  await setAndPersist(VAULT_KEYS.decks, decks);
}
