import { getVaultValue, setAndPersist } from "./appStore";
import { VAULT_KEYS } from "./vaultKeys";

/**
 * Regla de negocio (Misión 3 — Tarjeta "Racha"): la racha NO se incrementa
 * por iniciar sesión ni por abrir la app — solo cuenta la PRIMERA tarjeta de
 * flashcards abierta en el día calendario actual. Abrir una segunda,
 * tercera... N-ésima tarjeta ese mismo día no vuelve a sumar.
 *
 * Migrado de `localStorage` a la "Bóveda de Titanio" (`lib/appStore.ts`):
 * la lectura/escritura ahora es asíncrona porque vive en un archivo en disco
 * gestionado por Rust, no en el navegador — por eso `loadStreakState` y
 * `registrarAperturaTarjeta` devuelven `Promise` (antes eran síncronas).
 */
export interface StreakState {
  /** Días consecutivos con al menos una tarjeta abierta. */
  count: number;
  /** Fecha (`YYYY-MM-DD`, huso horario local) de la última apertura contabilizada — `null` antes de la primera vez. */
  lastOpenedDate: string | null;
}

export const INITIAL_STREAK_STATE: StreakState = { count: 0, lastOpenedDate: null };

/** `YYYY-MM-DD` en huso horario LOCAL (no UTC) — así el "día" de la racha coincide con el reloj del usuario. */
function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isStreakState(value: unknown): value is StreakState {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as StreakState).count === "number" &&
    ((value as StreakState).lastOpenedDate === null ||
      typeof (value as StreakState).lastOpenedDate === "string")
  );
}

/** Lectura asíncrona desde la Bóveda — usada tanto por `useAppStore` (Dashboard) como por `registrarAperturaTarjeta` (StudyCard). */
export async function loadStreakState(): Promise<StreakState> {
  const stored = await getVaultValue<StreakState>(VAULT_KEYS.studyStreak);
  return isStreakState(stored) ? stored : INITIAL_STREAK_STATE;
}

/**
 * `handleCardOpened()` de la Misión 3: se dispara cada vez que el usuario
 * abre una tarjeta de verdad para estudiarla (ver el `useEffect` de montaje
 * en `src/components/StudyCard.tsx` — NUNCA desde `StudyView` al iniciar
 * sesión, ni desde el Dashboard al montar).
 *
 *   - Si `lastOpenedDate` YA es hoy → no hace nada (ya se contabilizó la
 *     racha de hoy con una tarjeta anterior).
 *   - Si es la PRIMERA apertura del día → `count + 1`, `lastOpenedDate = hoy`,
 *     y el nuevo número se persiste físicamente en disco (`setAndPersist`,
 *     no solo en memoria de Rust).
 *
 * Sin parámetros a propósito: lee su propio estado actual de la Bóveda en
 * vez de recibirlo por parámetro, así ningún llamador puede pasarle un
 * snapshot obsoleto por error.
 */
export async function registrarAperturaTarjeta(): Promise<StreakState> {
  const current = await loadStreakState();
  const today = getLocalDateKey();
  if (current.lastOpenedDate === today) return current;

  const next: StreakState = { count: current.count + 1, lastOpenedDate: today };
  await setAndPersist(VAULT_KEYS.studyStreak, next);
  return next;
}
