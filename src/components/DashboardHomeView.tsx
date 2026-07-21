import { BookOpen, Flame, Layers } from "lucide-react";
import { useAppStore } from "../hooks/useAppStore";
import { useLanguage } from "../i18n/LanguageContext";
import { INITIAL_STREAK_STATE, type StreakState } from "../lib/streak";
import { VAULT_KEYS } from "../lib/vaultKeys";

/** Misión 2 — Tarjeta "Flashcards": total real de tarjetas y cuántas siguen mock, aisladas del resto de la vista. */
const FLASHCARDS_TOTAL_COUNT = 24;
const FLASHCARDS_PENDING_REVIEW_COUNT = 8;

/**
 * Misión 1 — Tarjeta "Desafíos": array local simulado con las tareas del
 * día. En una integración real vendría de `ChallengesView`/`localStorage`.
 * Por ahora se muestra solo el primer ítem de forma estática (sin rotación)
 * para evitar layout shifts por longitudes distintas de texto.
 */
const DAILY_CHALLENGES: readonly string[] = [
  "Anatomía — Sistema nervioso",
  "Física — Dinámica",
  "Matemática Avanzada — Integrales",
];

type DashboardHomeViewProps = {
  /**
   * Misión 2: este SPA no usa React Router (la navegación entre vistas vive
   * en `activeView`/`setActiveView` de `DashboardLayout.tsx`), así que este
   * callback es el equivalente directo de un `useNavigate()` apuntando a
   * `/flashcards`.
   */
  onNavigateToFlashcards: () => void;
};

export default function DashboardHomeView({
  onNavigateToFlashcards,
}: DashboardHomeViewProps) {
  const { dict } = useLanguage();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {dict.summary.heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.summary.subheading}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChallengesCard />
        <FlashcardsSummaryCard
          totalCount={FLASHCARDS_TOTAL_COUNT}
          pendingCount={FLASHCARDS_PENDING_REVIEW_COUNT}
          onNavigate={onNavigateToFlashcards}
        />
        <StreakCard />
      </section>

      <section className="glow-card mt-8 p-6">
        <h3 className="text-base font-semibold text-foreground">
          {dict.continueCard.title}
        </h3>
        <p
          className="assistant-serif mt-4 text-2xl font-medium italic tracking-tight text-foreground"
        >
          {dict.continueCard.maxim}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary-foreground">
          {dict.continueCard.description}
        </p>
      </section>
    </>
  );
}

/**
 * Misión 1 — Widget "Desafíos" estático: muestra únicamente el primer
 * desafío del array. La rotación automática está desactivada a propósito
 * para congelar el layout; `min-h-[120px]` reserva altura aunque el copy
 * cambie en el futuro.
 */
function ChallengesCard() {
  const { dict, t } = useLanguage();
  const challenge = DAILY_CHALLENGES[0];

  return (
    <article className="glow-card group p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-h-[120px] min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {dict.cards.challenges.title}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {challenge}
          </p>
          <p className="mt-2 text-sm text-secondary-foreground">
            {t(dict.cards.challenges.detail, {
              current: 1,
              total: DAILY_CHALLENGES.length,
            })}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
          <BookOpen className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}

/** Misión 2 — "Navegación de Flashcards": todo el bloque es un único `<button>` (accesible por teclado sin código extra), no solo un `onClick` sobre un `<div>`. */
interface FlashcardsSummaryCardProps {
  totalCount: number;
  pendingCount: number;
  onNavigate: () => void;
}

function FlashcardsSummaryCard({
  totalCount,
  pendingCount,
  onNavigate,
}: FlashcardsSummaryCardProps) {
  const { dict, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={`${dict.cards.cardsToday.title} — ${dict.nav.flashcards}`}
      // `glow-card` (ver `@utility glow-card` en `index.css`) YA trae el
      // brillo sutil de borde en `:hover` — solo faltaba `cursor-pointer` y
      // convertir el contenedor en un elemento realmente interactivo.
      className="glow-card group w-full cursor-pointer p-6 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {dict.cards.cardsToday.title}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {totalCount}
          </p>
          <p className="mt-2 text-sm text-secondary-foreground">
            {t(dict.cards.cardsToday.detail, { count: pendingCount })}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
          <Layers className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

/**
 * Misión 3 — "Lógica de Racha": lee la "Bóveda de Titanio" (Tauri Store, ver
 * `hooks/useAppStore.ts`) al montar, en vez del `localStorage` de antes. Este
 * componente jamás llama a `registrarAperturaTarjeta()` por su cuenta —
 * iniciar sesión o simplemente visitar el Dashboard NO debe sumar racha.
 * El único disparador real (`handleCardOpened()`) vive en el `useEffect` de
 * montaje de `src/components/StudyCard.tsx`, que se activa cada vez que el
 * usuario abre de verdad una tarjeta para estudiarla. Como `DashboardHomeView`
 * se desmonta/remonta al cambiar de `activeView` (ver `DashboardLayout.tsx`),
 * volver aquí después de estudiar siempre relee el número ya actualizado
 * desde disco.
 *
 * `isLoading` cubre la ventana (milisegundos) entre el montaje y la
 * respuesta de Rust: mientras dura, se muestra un placeholder sutil en vez
 * del número — nunca un `0` simulado que luego "salte" al valor real.
 */
function StreakCard() {
  const { dict, t } = useLanguage();
  const { value: streak, isLoading } = useAppStore<StreakState>(
    VAULT_KEYS.studyStreak,
    INITIAL_STREAK_STATE,
  );

  return (
    <article className="glow-card group p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {dict.cards.streak.title}
          </p>
          {isLoading ? (
            <span
              className="mt-3 inline-block h-8 w-16 animate-pulse rounded-md bg-card-rest"
              aria-hidden="true"
            />
          ) : (
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {t(dict.cards.streak.value, { count: streak.count })}
            </p>
          )}
          <p className="mt-2 text-sm text-secondary-foreground">
            {dict.cards.streak.detail}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
          <Flame className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}
