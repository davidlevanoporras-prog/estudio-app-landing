import { isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Deck } from "../types/deck";

/** Extensión principal del mazo de flashcards. */
export const EADECK_EXTENSION = "eadeck";
/** Alias corto aceptado en el diálogo de guardado. */
export const EA_EXTENSION = "ea";

export const EADECK_FORMAT = "eadeck" as const;
export const EADECK_VERSION = 1;

export type EadeckPackage = {
  format: typeof EADECK_FORMAT;
  version: typeof EADECK_VERSION;
  exportedAt: string;
  deck: Deck;
};

export type EadeckExportResult =
  | { ok: true; path: string }
  | { ok: false; reason: "cancelled" | "error"; message?: string };

function toBase64Utf8(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Serializa un mazo de flashcards a Base64 (JSON ofuscado).
 */
export function encodeEadeckPackage(deck: Deck): string {
  const payload: EadeckPackage = {
    format: EADECK_FORMAT,
    version: EADECK_VERSION,
    exportedAt: new Date().toISOString(),
    deck: {
      id: deck.id,
      name: deck.name,
      cards: deck.cards.map((card) => ({ ...card })),
    },
  };
  return toBase64Utf8(JSON.stringify(payload));
}

function ensureEadeckExtension(path: string): string {
  const trimmed = path.trim();
  const lower = trimmed.toLowerCase();
  if (lower.endsWith(`.${EADECK_EXTENSION}`) || lower.endsWith(`.${EA_EXTENSION}`)) {
    return trimmed;
  }
  return `${trimmed}.${EADECK_EXTENSION}`;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-_. ]+/g, "").trim() || "mazo-excellence";
}

function downloadInBrowser(base64: string, fileName: string): void {
  const blob = new Blob([base64], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta un mazo de flashcards a `.eadeck` / `.ea` (Base64).
 * Tauri: diálogo nativo `save` + `writeTextFile`.
 */
export async function exportDeckToEadeck(
  deck: Deck,
): Promise<EadeckExportResult> {
  const base64 = encodeEadeckPackage(deck);
  const suggested = `${sanitizeFileName(deck.name)}.${EADECK_EXTENSION}`;

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
      title: "Compartir mazo",
      defaultPath: suggested,
      filters: [
        {
          name: "Excellence Absolue Deck",
          extensions: [EADECK_EXTENSION, EA_EXTENSION],
        },
      ],
    });

    if (!selected) {
      return { ok: false, reason: "cancelled" };
    }

    const path = ensureEadeckExtension(selected);
    await writeTextFile(path, base64);
    return { ok: true, path };
  } catch (error) {
    console.error("[eadeckExport] Falló la exportación:", error);
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
