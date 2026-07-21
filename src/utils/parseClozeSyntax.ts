/**
 * Parseador de sintaxis cloze para el Simulador.
 * La respuesta va entre dobles corchetes: `El tejido… es el [[miocardio]].`
 */

export type ParsedCloze = {
  textBefore: string;
  answer: string;
  textAfter: string;
};

/**
 * Extrae `textBefore`, `answer` y `textAfter` desde una frase con `[[respuesta]]`.
 * Usa el primer par de dobles corchetes; si no hay sintaxis válida, devuelve `null`.
 */
export function parseClozeSyntax(input: string): ParsedCloze | null {
  const source = input.trim();
  if (!source) return null;

  // Captura estricta: todo lo interior de [[ ... ]] (sin anidar corchetes).
  const match = /^(.*?)\[\[\s*([^\]]+?)\s*\]\](.*)$/s.exec(source);
  if (!match) return null;

  const answer = match[2].trim();
  if (!answer) return null;

  return {
    textBefore: match[1],
    answer,
    textAfter: match[3],
  };
}
