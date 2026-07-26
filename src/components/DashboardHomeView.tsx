import { BookOpen, Flame, Layers } from "lucide-react";
import { useMemo } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { useLanguage } from "../i18n/LanguageContext";
import { INITIAL_STREAK_STATE, type StreakState } from "../lib/streak";
import { getSecureJSON } from "../lib/secureStorage";
import { VAULT_KEYS } from "../lib/vaultKeys";
import type { Deck } from "../types/deck";
import { isCardDue } from "../utils/spacedRepetition";
import ViewHeaderCard from "./ViewHeaderCard";
import ViewShell from "./ViewShell";

const CHALLENGES_STORAGE_KEY = "estudio-challenges";

type DashboardHomeViewProps = {
  decks: Deck[];
  onNavigateToFlashcards: () => void;
  onNavigateToChallenges?: () => void;
};

/** Títulos de desafíos pendientes del día calendario local — sin mock. */
function readTodayPendingChallengeTitles(): string[] {
  try {
    const parsed = getSecureJSON<unknown>(CHALLENGES_STORAGE_KEY);
    if (!Array.isArray(parsed)) return [];

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    return parsed
      .filter(
        (item): item is { title: string; completed?: boolean; date?: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { title?: unknown }).title === "string",
      )
      .filter((item) => !item.completed && item.date === today)
      .map((item) => item.title);
  } catch {
    return [];
  }
}

export default function DashboardHomeView({
  decks,
  onNavigateToFlashcards,
  onNavigateToChallenges,
}: DashboardHomeViewProps) {
  const { dict } = useLanguage();

  const totalCards = useMemo(
    () => decks.reduce((sum, deck) => sum + deck.cards.length, 0),
    [decks],
  );
  const pendingCards = useMemo(
    () =>
      decks.reduce(
        (sum, deck) =>
          sum +
          deck.cards.filter((card) => isCardDue(card.nextReviewDate)).length,
        0,
      ),
    [decks],
  );

  return (
    <ViewShell
      header={
        <ViewHeaderCard className="w-fit max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {dict.summary.heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.summary.subheading}
          </p>
        </ViewHeaderCard>
      }
      bodyClassName="pb-4"
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChallengesCard onNavigate={onNavigateToChallenges} />
        <FlashcardsSummaryCard
          totalCount={totalCards}
          pendingCount={pendingCards}
          onNavigate={onNavigateToFlashcards}
        />
        <StreakCard />
      </section>

      <section className="glow-card mt-8 p-6">
        <h3 className="text-base font-semibold text-foreground">
          {dict.continueCard.title}
        </h3>
        <p className="assistant-serif mt-4 text-2xl font-medium italic tracking-tight text-foreground">
          {dict.continueCard.maxim}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary-foreground">
          {dict.continueCard.description}
        </p>
      </section>
    </ViewShell>
  );
}

function ChallengesCard({ onNavigate }: { onNavigate?: () => void }) {
  const { dict, t } = useLanguage();
  const titles = useMemo(() => readTodayPendingChallengeTitles(), []);
  const isEmpty = titles.length === 0;

  const body = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-h-[120px] min-w-0 flex-1 flex-col justify-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {dict.cards.challenges.title}
        </p>
        {isEmpty ? (
          <p className="mt-4 text-sm leading-relaxed text-secondary-foreground/80">
            {dict.emptyStates.noChallenges}
          </p>
        ) : (
          <>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {titles[0]}
            </p>
            <p className="mt-2 text-sm text-secondary-foreground">
              {t(dict.cards.challenges.detail, {
                current: 1,
                total: titles.length,
              })}
            </p>
          </>
        )}
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
        <BookOpen className="h-5 w-5" strokeWidth={2} />
      </div>
    </div>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        className="glow-card group w-full cursor-pointer p-6 text-left"
      >
        {body}
      </button>
    );
  }

  return <article className="glow-card group p-6">{body}</article>;
}

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
  const isEmpty = totalCount === 0;

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={`${dict.cards.cardsToday.title} — ${dict.nav.flashcards}`}
      className="glow-card group w-full cursor-pointer p-6 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-h-[120px] min-w-0 flex-1 flex-col justify-center">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {dict.cards.cardsToday.title}
          </p>
          {isEmpty ? (
            <p className="mt-4 text-sm leading-relaxed text-secondary-foreground/80">
              {dict.emptyStates.noDecks}
            </p>
          ) : (
            <>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {totalCount}
              </p>
              <p className="mt-2 text-sm text-secondary-foreground">
                {t(dict.cards.cardsToday.detail, { count: pendingCount })}
              </p>
            </>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
          <Layers className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

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
