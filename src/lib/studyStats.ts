/**
 * Calificaciones posibles al repasar una tarjeta — las mismas 4 del Centro
 * de Mando Táctico (ver `REVIEW_QUALITY_LABELS` en
 * `src/utils/spacedRepetition.ts`): `again` = Olvidado, `hard` = Difícil,
 * `good` = Bueno, `easy` = Fácil. `good` es nuevo en esta Misión — `again`,
 * `hard` y `easy` conservan sus nombres de campo originales a propósito
 * (aunque el SIGNIFICADO de `hard` cambió de "Bien" a "Difícil") para que
 * el historial ya persistido en `localStorage` de instalaciones previas
 * siga siendo válido; ver `isRatingCounts` más abajo, que rellena `good`
 * con 0 si falta.
 */
export type RatingKind = "again" | "hard" | "good" | "easy";

export type RatingCounts = {
  again: number;
  hard: number;
  good: number;
  easy: number;
};

export type StudyStats = {
  global: RatingCounts;
  byDeck: Record<string, RatingCounts>;
};

const STUDY_STATS_STORAGE_KEY = "estudio-study-stats";

function emptyCounts(): RatingCounts {
  return { again: 0, hard: 0, good: 0, easy: 0 };
}

/** Tolerante a datos persistidos ANTES de esta Misión (sin `good`): lo rellena con 0 en vez de descartar todo el registro. */
function isRatingCounts(value: unknown): value is RatingCounts {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as RatingCounts).again === "number" &&
    typeof (value as RatingCounts).hard === "number" &&
    typeof (value as RatingCounts).easy === "number"
  );
}

function normalizeRatingCounts(value: RatingCounts): RatingCounts {
  return { ...value, good: typeof value.good === "number" ? value.good : 0 };
}

/** Lee las estadísticas acumuladas (global + por mazo), con defaults seguros. */
export function loadStudyStats(): StudyStats {
  try {
    const raw = localStorage.getItem(STUDY_STATS_STORAGE_KEY);
    if (!raw) return { global: emptyCounts(), byDeck: {} };

    const parsed = JSON.parse(raw);
    const global = isRatingCounts(parsed?.global)
      ? normalizeRatingCounts(parsed.global)
      : emptyCounts();

    const byDeck: Record<string, RatingCounts> = {};
    if (parsed?.byDeck && typeof parsed.byDeck === "object") {
      for (const [deckId, counts] of Object.entries(parsed.byDeck)) {
        if (isRatingCounts(counts)) byDeck[deckId] = normalizeRatingCounts(counts);
      }
    }

    return { global, byDeck };
  } catch {
    return { global: emptyCounts(), byDeck: {} };
  }
}

function saveStudyStats(stats: StudyStats): void {
  try {
    localStorage.setItem(STUDY_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* localStorage no disponible o cuota excedida — la analítica no se persiste esta vez */
  }
}

/** Borra toda la analítica persistida (botón "Restablecer Datos") y devuelve el estado en cero. */
export function clearStudyStats(): StudyStats {
  const empty: StudyStats = { global: emptyCounts(), byDeck: {} };
  try {
    localStorage.removeItem(STUDY_STATS_STORAGE_KEY);
  } catch {
    /* localStorage no disponible — no hay nada que borrar de todas formas */
  }
  return empty;
}

/** Devuelve el conteo de un mazo específico, o ceros si aún no tiene historial. */
export function getDeckCounts(stats: StudyStats, deckId: string): RatingCounts {
  return stats.byDeck[deckId] ?? emptyCounts();
}

/** Descarta el historial de un mazo eliminado, sin tocar el total global ya acumulado. */
export function removeDeckStats(deckId: string): StudyStats {
  const stats = loadStudyStats();
  if (!(deckId in stats.byDeck)) return stats;

  const byDeck = { ...stats.byDeck };
  delete byDeck[deckId];

  const next: StudyStats = { global: stats.global, byDeck };
  saveStudyStats(next);
  return next;
}

/**
 * Registra una calificación tanto en el total global como en el del mazo
 * correspondiente, persiste el resultado y lo devuelve.
 */
export function recordRatingStat(deckId: string, rating: RatingKind): StudyStats {
  const stats = loadStudyStats();
  const deckCounts = getDeckCounts(stats, deckId);

  const next: StudyStats = {
    global: { ...stats.global, [rating]: stats.global[rating] + 1 },
    byDeck: {
      ...stats.byDeck,
      [deckId]: { ...deckCounts, [rating]: deckCounts[rating] + 1 },
    },
  };

  saveStudyStats(next);
  return next;
}
