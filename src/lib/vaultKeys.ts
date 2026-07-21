/**
 * Namespacing central de claves de la Bóveda de Titanio. Un solo lugar que
 * documenta qué "datos vitales" persisten en disco — evita strings mágicas
 * repetidas (y colisiones accidentales) entre `DashboardLayout.tsx`,
 * `lib/streak.ts` y cualquier futuro dato que se conecte a `useAppStore`.
 */
export const VAULT_KEYS = {
  userName: "identity.userName",
  studyStreak: "progress.studyStreak",
  /** "Sellado de la Memoria": TODOS los mazos y sus tarjetas (con su estado SM-2) en un único árbol serializado. */
  decks: "study.decks",
  /**
   * BYOK — "Credenciales de Inteligencia Cognitiva" (`ProfileView.tsx`).
   * Llave de API (OpenAI / Anthropic) almacenada localmente; jamás se
   * comparte ni se muestra en claro tras guardarla (input `password`).
   */
  cognitiveApiKey: "cognitive.apiKey",
  /**
   * Nodo oculto de historial del Asistente — ver `lib/assistantMemory.ts`.
   * Estructura por sesión y por modo (Inquisidor / Catedrático). Invisible
   * en la UI a propósito.
   */
  assistantMemory: "assistant_memory",
  /**
   * Paywall / God Mode — `true` tras canjear `EXCELLENCE-VIP`
   * (ver `lib/license.ts` y `LicenseContext`).
   */
  isPremium: "license.isPremium",
} as const;
