/**
 * Importación Beta de tarjetas en texto plano / CSV.
 * Sin WASM, sin SQLite, sin .apkg — solo parsing determinista.
 */

import type { Deck, StudyCardData } from "../types/deck";
import { createInitialSrsState } from "../utils/spacedRepetition";

export type PlainTextImportResult =
  | { ok: true; deck: Deck; cardCount: number }
  | { ok: false; reason: "empty" | "error"; message: string };

/** Limpia HTML residual ligero (exports Anki texto). */
export function cleanCardText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function splitRow(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((p) => p.trim());
  }
  if (line.includes("|")) {
    return line.split("|").map((p) => p.trim());
  }
  if (line.includes(";")) {
    return line.split(";").map((p) => p.trim());
  }
  return splitCsvLine(line);
}

function isHeaderRow(parts: string[]): boolean {
  if (parts.length < 2) return false;
  const a = parts[0]!.toLowerCase();
  const b = parts[1]!.toLowerCase();
  const headers = /^(front|anverso|pregunta|question|texto|text)$/;
  const backs = /^(back|reverso|respuesta|answer|verso)$/;
  return headers.test(a) && backs.test(b);
}

function createDeckId(): string {
  return `deck-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Interpreta texto: Columna 1 = Frente, Columna 2 = Reverso.
 * Separadores: tab, coma, barra `|`, punto y coma.
 */
export function parsePlainTextCards(text: string): StudyCardData[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const cards: StudyCardData[] = [];
  let cardId = 1;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;
    if (line.trimStart().startsWith("#")) continue;

    const parts = splitRow(line);
    if (parts.length < 2) continue;
    if (isHeaderRow(parts)) continue;

    const front = cleanCardText(parts[0] ?? "");
    const back = cleanCardText(parts[1] ?? "");
    if (!front && !back) continue;

    const tagRaw = parts[2]?.trim();
    const srs = createInitialSrsState();
    cards.push({
      id: cardId,
      front: front || "—",
      hint: "",
      back: back || front || "—",
      tag: tagRaw ? tagRaw.split(/\s+/)[0]!.slice(0, 48) : undefined,
      interval: srs.interval,
      easeFactor: srs.easeFactor,
      nextReviewDate: srs.nextReviewDate,
    });
    cardId += 1;
  }

  return cards;
}

/** Construye un mazo nativo listo para inyectar en el estado / bóveda. */
export function buildDeckFromPlainText(
  text: string,
  deckName: string,
): PlainTextImportResult {
  try {
    const cards = parsePlainTextCards(text);
    if (cards.length === 0) {
      return {
        ok: false,
        reason: "empty",
        message:
          "No se encontraron filas válidas. Usa Frente y Reverso separados por tab, coma o |.",
      };
    }

    const name = deckName.trim() || "Mazo importado";
    return {
      ok: true,
      cardCount: cards.length,
      deck: {
        id: createDeckId(),
        name,
        cards,
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo interpretar el texto.",
    };
  }
}

export async function buildDeckFromTextFile(
  file: File,
  deckName?: string,
): Promise<PlainTextImportResult> {
  try {
    const text = await file.text();
    const fallback =
      file.name.replace(/\.(txt|csv|tsv)$/i, "").trim() || "Mazo importado";
    return buildDeckFromPlainText(text, deckName?.trim() || fallback);
  } catch (error) {
    return {
      ok: false,
      reason: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo leer el archivo.",
    };
  }
}
