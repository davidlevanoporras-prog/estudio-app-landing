import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";

/**
 * "Bóveda de Titanio" — el ÚNICO módulo de la app que sabe que
 * `@tauri-apps/plugin-store` existe. Todo lo demás (hooks, vistas, lógica de
 * dominio como `lib/streak.ts`) habla exclusivamente con los tres verbos de
 * abajo — así el motor de persistencia real queda intercambiable sin tocar
 * un solo consumidor si el día de mañana cambia de backend.
 *
 * Un único archivo en disco para toda la app (en vez de un archivo por
 * clave) — el mismo patrón que ya usa `localStorage` en el resto del
 * proyecto, pero ahora respaldado por Rust en vez del navegador.
 *
 * "Sellado de la Memoria" (Misión 1): el estado completo de los mazos
 * (`Deck[]`, con el progreso SM-2 de cada `StudyCardData` — `interval`,
 * `easeFactor`, `nextReviewDate`) vive bajo `VAULT_KEYS.decks` en este mismo
 * archivo, gestionado por la capa de dominio `src/lib/deckStore.ts`
 * (`loadDecks()`/`saveDecks()`) — igual que `lib/streak.ts` hace para la
 * racha y `lib/assistantMemory.ts` para el nodo oculto `assistant_memory`.
 * Este módulo sigue sin saber qué es un mazo a propósito: solo mueve
 * bytes tipados genéricos entre memoria/disco.
 */
const VAULT_FILE_NAME = "app_data.dat";

let storeConnection: Promise<Store> | null = null;

/** Conexión perezosa y única: el archivo se abre la primera vez que alguien lo necesita, nunca dos veces en paralelo. */
function connect(): Promise<Store> {
  if (!storeConnection) {
    storeConnection = Store.load(VAULT_FILE_NAME);
  }
  return storeConnection;
}

/**
 * `false` cuando la app corre fuera del shell nativo de Tauri (p. ej. si
 * alguien abre la URL de Vite directo en un navegador de escritorio sin
 * pasar por `npm run tauri dev`) — no existe puente IPC en ese contexto, así
 * que la Bóveda se degrada con elegancia (lecturas `null`, escrituras
 * no-op) en vez de reventar la app con una excepción de `invoke`.
 */
export function isVaultAvailable(): boolean {
  return isTauri();
}

/** Lectura asíncrona y robusta: nunca lanza — cualquier fallo de IPC/disco se registra y resuelve en `null`. */
export async function getVaultValue<T>(key: string): Promise<T | null> {
  if (!isVaultAvailable()) return null;

  try {
    const store = await connect();
    const value = await store.get<T>(key);
    return value ?? null;
  } catch (error) {
    console.error(`[Bóveda de Titanio] No se pudo leer "${key}":`, error);
    return null;
  }
}

/** Escritura en memoria del store de Rust — NO garantiza disco por sí sola, ver `saveVault()`/`setAndPersist()`. */
export async function setVaultValue<T>(key: string, value: T): Promise<void> {
  if (!isVaultAvailable()) return;

  try {
    const store = await connect();
    await store.set(key, value);
  } catch (error) {
    console.error(`[Bóveda de Titanio] No se pudo escribir "${key}":`, error);
  }
}

/** Fuerza el volcado a disco físico (`app_data.dat`) de todo lo que esté en memoria en el store. */
export async function saveVault(): Promise<void> {
  if (!isVaultAvailable()) return;

  try {
    const store = await connect();
    await store.save();
  } catch (error) {
    console.error("[Bóveda de Titanio] No se pudo persistir en disco:", error);
  }
}

/**
 * El método "robusto" que Misión 2 pide: `set` + `save` en un solo paso, sin
 * confiar en el autoguardado implícito del plugin — un dato vital (nombre,
 * racha) nunca debe quedar solo en memoria de Rust sin bajar a disco.
 */
export async function setAndPersist<T>(key: string, value: T): Promise<void> {
  await setVaultValue(key, value);
  await saveVault();
}
