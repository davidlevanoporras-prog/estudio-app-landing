import { isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { ClozeCard, SimulationDeck } from "../types/simulator";

/** Identificador táctico del paquete viral del Simulador. */
export const SIMULATOR_DECK_TYPE = "simulator_deck" as const;

/**
 * Extensión camuflada: parece JSON genérico, es paquete Excellence.
 * Ejemplo: `Anatomia.easim.json`
 */
export const EASIM_JSON_SUFFIX = ".easim.json";

export type SimulatorDeckEnvelope = {
  type: typeof SIMULATOR_DECK_TYPE;
  data: SimulationDeck | SimulationDeck[];
};

export type EasimExportResult =
  | { ok: true; path: string }
  | { ok: false; reason: "cancelled" | "empty" | "error"; message?: string };

export type EasimImportResult =
  | { ok: true; decks: SimulationDeck[] }
  | { ok: false; reason: "cancelled" | "invalid" | "error"; message?: string };

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function toBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function fromBase64Utf8(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function cloneDeckPayload(deck: SimulationDeck): SimulationDeck {
  return {
    id: deck.id,
    title: deck.title,
    folderId: deck.folderId,
    cards: deck.cards.map((card) => ({
      id: card.id,
      textBefore: card.textBefore,
      textAfter: card.textAfter,
      answer: card.answer,
      distractors: [...card.distractors],
      ...(card.segments ? { segments: card.segments } : {}),
      ...(card.answers ? { answers: [...card.answers] } : {}),
    })),
  };
}

function isClozeCard(value: unknown): value is ClozeCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<ClozeCard>;
  return (
    typeof card.id === "string" &&
    typeof card.textBefore === "string" &&
    typeof card.textAfter === "string" &&
    typeof card.answer === "string" &&
    Array.isArray(card.distractors)
  );
}

function isSimulationDeck(value: unknown): value is SimulationDeck {
  if (!value || typeof value !== "object") return false;
  const deck = value as Partial<SimulationDeck>;
  return (
    typeof deck.id === "string" &&
    typeof deck.title === "string" &&
    Array.isArray(deck.cards) &&
    deck.cards.every(isClozeCard)
  );
}

/**
 * Empaqueta mazos en `{ type: 'simulator_deck', data }` y ofusca con Base64.
 */
export function encodeSimulatorDeckPackage(
  decks: SimulationDeck[],
): string {
  if (decks.length === 0) {
    throw new Error("empty");
  }
  const data =
    decks.length === 1
      ? cloneDeckPayload(decks[0]!)
      : decks.map(cloneDeckPayload);
  const envelope: SimulatorDeckEnvelope = {
    type: SIMULATOR_DECK_TYPE,
    data,
  };
  return toBase64Utf8(JSON.stringify(envelope));
}

/**
 * Decodifica Base64 → JSON y valida `type: 'simulator_deck'`.
 */
export function decodeSimulatorDeckPackage(
  base64OrText: string,
): SimulationDeck[] {
  let parsed: unknown;
  try {
    const json = fromBase64Utf8(base64OrText);
    parsed = JSON.parse(json);
  } catch {
    // Compat: algunos archivos podrían haberse guardado como JSON plano por error.
    try {
      parsed = JSON.parse(base64OrText.trim());
    } catch {
      throw new Error("invalid");
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("invalid");
  }

  const envelope = parsed as Partial<SimulatorDeckEnvelope>;
  if (envelope.type !== SIMULATOR_DECK_TYPE) {
    throw new Error("invalid");
  }

  const { data } = envelope;
  if (Array.isArray(data)) {
    if (!data.every(isSimulationDeck)) throw new Error("invalid");
    return data.map(cloneDeckPayload);
  }
  if (!isSimulationDeck(data)) throw new Error("invalid");
  return [cloneDeckPayload(data)];
}

/** Asigna IDs nuevos para inyectar sin colisionar con la biblioteca local. */
export function remintDeckIds(decks: SimulationDeck[]): SimulationDeck[] {
  return decks.map((deck) => ({
    ...deck,
    id: createId("deck"),
    folderId: null,
    cards: deck.cards.map((card) => ({
      ...card,
      id: createId("card"),
      distractors: [...card.distractors],
      ...(card.answers ? { answers: [...card.answers] } : {}),
      ...(card.segments ? { segments: card.segments } : {}),
    })),
  }));
}

function sanitizeBaseName(name: string): string {
  return name.replace(/[^\w\-_. ]+/g, "").trim() || "mazo-excellence";
}

function ensureEasimJsonExtension(path: string): string {
  const trimmed = path.trim();
  if (trimmed.toLowerCase().endsWith(EASIM_JSON_SUFFIX)) return trimmed;
  // Si el SO añadió solo `.json`, lo convertimos a `.easim.json`.
  if (trimmed.toLowerCase().endsWith(".json")) {
    return `${trimmed.slice(0, -".json".length)}${EASIM_JSON_SUFFIX}`;
  }
  return `${trimmed}${EASIM_JSON_SUFFIX}`;
}

function suggestedFileName(decks: SimulationDeck[], fallback?: string): string {
  const base =
    decks.length === 1
      ? sanitizeBaseName(decks[0]!.title)
      : sanitizeBaseName(fallback ?? `mazos-excellence-${decks.length}`);
  return `${base}${EASIM_JSON_SUFFIX}`;
}

function downloadInBrowser(content: string, fileName: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta mazos a `.easim.json` (JSON tipado + Base64) vía diálogo nativo.
 */
export async function exportDecksToEasim(
  decks: SimulationDeck[],
  options?: { defaultFileName?: string },
): Promise<EasimExportResult> {
  if (decks.length === 0) {
    return { ok: false, reason: "empty" };
  }

  let base64: string;
  try {
    base64 = encodeSimulatorDeckPackage(decks);
  } catch {
    return { ok: false, reason: "empty" };
  }

  const suggested = suggestedFileName(decks, options?.defaultFileName);

  if (!isTauri()) {
    try {
      downloadInBrowser(base64, suggested);
      return { ok: true, path: suggested };
    } catch (error) {
      return {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  try {
    const selected = await save({
      title: "Guardar como…",
      defaultPath: suggested,
      filters: [
        {
          name: "Excellence Simulator (.easim.json)",
          extensions: ["easim.json"],
        },
      ],
    });

    if (!selected) {
      return { ok: false, reason: "cancelled" };
    }

    const path = ensureEasimJsonExtension(selected);
    await writeTextFile(path, base64);
    return { ok: true, path };
  } catch (error) {
    console.error("[easimExport] Falló la exportación:", error);
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Atajo: exportar un único mazo seleccionado. */
export async function exportSelectedSimulatorDeck(
  deck: SimulationDeck,
): Promise<EasimExportResult> {
  return exportDecksToEasim([deck], { defaultFileName: deck.title });
}

async function readEasimTextFromPath(path: string): Promise<string> {
  return readTextFile(path);
}

async function pickEasimFileInBrowser(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.easim.json,application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      void file.text().then(resolve).catch(() => resolve(null));
    };
    input.click();
  });
}

/**
 * Abre diálogo nativo (o file picker web), lee `.easim.json` y valida el sobre.
 */
export async function importSimulatorDecksFromDialog(): Promise<EasimImportResult> {
  try {
    let raw: string | null = null;

    if (isTauri()) {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Excellence Simulator (.easim.json)",
            extensions: ["easim.json", "json"],
          },
        ],
      });
      if (typeof selected !== "string" || selected.length === 0) {
        return { ok: false, reason: "cancelled" };
      }
      raw = await readEasimTextFromPath(selected);
    } else {
      raw = await pickEasimFileInBrowser();
      if (raw == null) return { ok: false, reason: "cancelled" };
    }

    const decks = decodeSimulatorDeckPackage(raw);
    return { ok: true, decks: remintDeckIds(decks) };
  } catch (error) {
    if (error instanceof Error && error.message === "invalid") {
      return { ok: false, reason: "invalid" };
    }
    console.error("[easimExport] Falló la importación:", error);
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Importa desde un `File` (drag-and-drop o `<input type="file">`).
 */
export async function importSimulatorDecksFromFile(
  file: File,
): Promise<EasimImportResult> {
  try {
    const raw = await file.text();
    const decks = decodeSimulatorDeckPackage(raw);
    return { ok: true, decks: remintDeckIds(decks) };
  } catch (error) {
    if (error instanceof Error && error.message === "invalid") {
      return { ok: false, reason: "invalid" };
    }
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
