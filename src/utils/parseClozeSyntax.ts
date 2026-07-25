/**
 * Parseador de sintaxis cloze para el Simulador.
 * Soporta uno o muchos huecos: `texto [[uno]] texto [[dos palabras]]`.
 */

export type ClozeTextSegment = {
  kind: "text";
  value: string;
};

export type ClozeBlankSegment = {
  kind: "blank";
  /** Contenido completo del corchete (espacios internos preservados). */
  answer: string;
  /** Índice 0-based del hueco en el texto. */
  index: number;
};

export type ClozeSegment = ClozeTextSegment | ClozeBlankSegment;

export type ParsedCloze = {
  segments: ClozeSegment[];
  /** Todas las respuestas válidas, en orden de aparición. */
  answers: string[];
  /**
   * Compatibilidad con el modelo de un solo hueco:
   * texto antes del primer `[[...]]`, primera respuesta, y resto del texto
   * (los huecos posteriores se re-serializan como `[[respuesta]]`).
   */
  textBefore: string;
  answer: string;
  textAfter: string;
};

/** Global: captura cada `[[ ... ]]`; el interior puede incluir espacios y varias palabras. */
const CLOZE_GLOBAL_RE = /\[\[([^\]]*)\]\]/g;

/**
 * Extrae todos los huecos `[[respuesta]]` del texto.
 * Devuelve `null` si no hay ningún corchete válido (o hay alguno vacío).
 */
export function parseClozeSyntax(input: string): ParsedCloze | null {
  const source = input.trim();
  if (!source) return null;

  const segments: ClozeSegment[] = [];
  const answers: string[] = [];
  let lastIndex = 0;
  let blankIndex = 0;
  let sawMatch = false;

  for (const match of source.matchAll(CLOZE_GLOBAL_RE)) {
    sawMatch = true;
    const full = match[0];
    const start = match.index ?? 0;
    // Trim solo bordes; espacios internos (multi-palabra) se respetan.
    const answer = (match[1] ?? "").replace(/^\s+|\s+$/g, "");
    if (!answer) return null;

    if (start > lastIndex) {
      segments.push({
        kind: "text",
        value: source.slice(lastIndex, start),
      });
    }

    segments.push({ kind: "blank", answer, index: blankIndex });
    answers.push(answer);
    blankIndex += 1;
    lastIndex = start + full.length;
  }

  if (!sawMatch || answers.length === 0) return null;

  if (lastIndex < source.length) {
    segments.push({ kind: "text", value: source.slice(lastIndex) });
  }

  const firstBlankAt = segments.findIndex((segment) => segment.kind === "blank");
  const textBefore = segments
    .slice(0, firstBlankAt)
    .map((segment) => (segment.kind === "text" ? segment.value : ""))
    .join("");

  const textAfter = segments
    .slice(firstBlankAt + 1)
    .map((segment) =>
      segment.kind === "text"
        ? segment.value
        : `[[${segment.answer}]]`,
    )
    .join("");

  return {
    segments,
    answers,
    textBefore,
    answer: answers[0],
    textAfter,
  };
}

/** Forma mínima de tarjeta cloze (segments/answers nuevos o legacy textBefore/After). */
export type ClozeCardLike = {
  answer?: string;
  textBefore?: string;
  textAfter?: string;
  segments?: ClozeSegment[];
  answers?: string[];
};

/** Reconstruye segmentos desde una tarjeta (legacy de un hueco o multi-hueco). */
export function clozeSegmentsFromCard(card: ClozeCardLike): ClozeSegment[] {
  if (card.segments && card.segments.length > 0) {
    return card.segments;
  }

  return [
    { kind: "text", value: card.textBefore ?? "" },
    { kind: "blank", answer: card.answer ?? "", index: 0 },
    { kind: "text", value: card.textAfter ?? "" },
  ];
}

/** Lista de respuestas válidas de una tarjeta. */
export function clozeAnswersFromCard(card: ClozeCardLike): string[] {
  if (card.answers && card.answers.length > 0) return card.answers;
  return clozeSegmentsFromCard(card)
    .filter((segment): segment is ClozeBlankSegment => segment.kind === "blank")
    .map((segment) => segment.answer);
}
