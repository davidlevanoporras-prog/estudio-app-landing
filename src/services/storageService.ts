import { isTauri } from "@tauri-apps/api/core";
import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { Deck, Flashcard } from "../types/schema";

/**
 * Archivo maestro de la bóveda secundaria (AppData).
 * TODO(unify-vault): distinto de `app_data.dat` (`lib/appStore.ts` / deckStore).
 * No compartir clave ni path con la UI principal hasta la migración.
 */
export const VAULT_FILE_NAME = "excellence_vault.json";

/**
 * Subcarpeta dentro de `BaseDirectory.AppData` donde vive el archivo maestro.
 * Se crea en el primer `initVault()` si aún no existe.
 */
export const VAULT_DIR_NAME = "excellence";

const VAULT_RELATIVE_PATH = `${VAULT_DIR_NAME}/${VAULT_FILE_NAME}`;

const FS_OPTS = { baseDir: BaseDirectory.AppData } as const;

/**
 * Forma persistida del archivo maestro.
 * `lastModified` (ms) es el reloj de sincronización inteligente entre dispositivos.
 */
export type VaultData = {
  lastModified: number;
  decks: Deck[];
  flashcards: Flashcard[];
};

function emptyVault(): VaultData {
  return { lastModified: 0, decks: [], flashcards: [] };
}

function serializeVault(data: VaultData): string {
  return JSON.stringify(data, null, 2);
}

/** Valida la forma mínima del JSON; descarta filas inválidas sin tumbar la app. */
function parseVaultPayload(raw: string): VaultData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `[storageService] JSON corrupto en ${VAULT_RELATIVE_PATH}: no se pudo parsear.`,
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(
      `[storageService] Contenedor inválido en ${VAULT_RELATIVE_PATH}: se esperaba un objeto.`,
    );
  }

  const root = parsed as Record<string, unknown>;
  const decks = Array.isArray(root.decks)
    ? (root.decks.filter(isDeckLike) as Deck[])
    : [];
  const flashcards = Array.isArray(root.flashcards)
    ? (root.flashcards.filter(isFlashcardLike) as Flashcard[])
    : [];
  const lastModified =
    typeof root.lastModified === "number" && Number.isFinite(root.lastModified)
      ? root.lastModified
      : 0;

  return { lastModified, decks, flashcards };
}

function isDeckLike(value: unknown): value is Deck {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.createdAt === "string" &&
    typeof row.lastModified === "number"
  );
}

function isFlashcardLike(value: unknown): value is Flashcard {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.deckId === "string" &&
    typeof row.front === "string" &&
    typeof row.back === "string" &&
    Array.isArray(row.tags) &&
    typeof row.interval === "number" &&
    typeof row.easeFactor === "number" &&
    typeof row.repetitions === "number" &&
    typeof row.nextReview === "string"
  );
}

/**
 * Asegura directorio + archivo maestro en `BaseDirectory.AppData`.
 * Si faltan, crea la carpeta e inyecta `{ lastModified, decks: [], flashcards: [] }`.
 */
export async function initVault(): Promise<VaultData> {
  if (!isTauri()) {
    console.warn(
      "[storageService] initVault: entorno no-Tauri — bóveda en memoria vacía.",
    );
    return emptyVault();
  }

  try {
    const dirReady = await exists(VAULT_DIR_NAME, FS_OPTS);
    if (!dirReady) {
      await mkdir(VAULT_DIR_NAME, { ...FS_OPTS, recursive: true });
    }

    const fileReady = await exists(VAULT_RELATIVE_PATH, FS_OPTS);
    if (!fileReady) {
      const seed: VaultData = {
        lastModified: Date.now(),
        decks: [],
        flashcards: [],
      };
      await writeTextFile(
        VAULT_RELATIVE_PATH,
        serializeVault(seed),
        FS_OPTS,
      );
      return seed;
    }

    return await loadVaultData();
  } catch (error) {
    console.error(
      "[storageService] initVault falló al preparar la bóveda en AppData:",
      error,
    );
    return emptyVault();
  }
}

/**
 * Sobrescribe el archivo maestro con los arreglos tipados del esquema.
 * Inyecta `lastModified: Date.now()` en la raíz del JSON.
 * @returns el timestamp escrito, o `null` si falló.
 */
export async function saveVaultData(
  decks: Deck[],
  flashcards: Flashcard[],
): Promise<number | null> {
  if (!isTauri()) {
    console.warn(
      "[storageService] saveVaultData: entorno no-Tauri — no se escribió disco.",
    );
    return null;
  }

  try {
    const dirReady = await exists(VAULT_DIR_NAME, FS_OPTS);
    if (!dirReady) {
      await mkdir(VAULT_DIR_NAME, { ...FS_OPTS, recursive: true });
    }

    const lastModified = Date.now();
    const payload: VaultData = { lastModified, decks, flashcards };
    await writeTextFile(
      VAULT_RELATIVE_PATH,
      serializeVault(payload),
      FS_OPTS,
    );
    return lastModified;
  } catch (error) {
    console.error(
      `[storageService] saveVaultData no pudo escribir ${VAULT_RELATIVE_PATH}:`,
      error,
    );
    return null;
  }
}

/**
 * Lee y parsea el archivo maestro (incluye `lastModified` de sincronización).
 * Si falta, llama a `initVault()`. Si está corrupto, registra el error y
 * devuelve una bóveda vacía (el frontend no colapsa).
 */
export async function loadVaultData(): Promise<VaultData> {
  if (!isTauri()) {
    console.warn(
      "[storageService] loadVaultData: entorno no-Tauri — bóveda vacía.",
    );
    return emptyVault();
  }

  try {
    const fileReady = await exists(VAULT_RELATIVE_PATH, FS_OPTS);
    if (!fileReady) {
      return await initVault();
    }

    const raw = await readTextFile(VAULT_RELATIVE_PATH, FS_OPTS);
    return parseVaultPayload(raw);
  } catch (error) {
    console.error(
      `[storageService] loadVaultData falló al leer/parsear ${VAULT_RELATIVE_PATH}:`,
      error,
    );
    return emptyVault();
  }
}
