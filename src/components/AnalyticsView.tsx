import { useState } from "react";
import { BarChart3, Layers, Trash2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  clearStudyStats,
  getDeckCounts,
  loadStudyStats,
  type RatingCounts,
} from "../lib/studyStats";
import type { Deck } from "../types/deck";

type AnalyticsViewProps = {
  decks: Deck[];
};

/**
 * "Rendimiento y Memoria": lee `estudio-study-stats` de localStorage (ver
 * `src/lib/studyStats.ts`) y renderiza barras nativas (divs + Tailwind, sin
 * librerías de charts) para el consolidado global y por mazo.
 */
export default function AnalyticsView({ decks }: AnalyticsViewProps) {
  const { dict } = useLanguage();

  // Snapshot al montar: esta vista se desmonta/remonta con cada cambio de
  // pestaña del sidebar, así que siempre refleja el estado más reciente.
  // Se mantiene en estado (con setter) para poder reflejar el reset al instante.
  const [stats, setStats] = useState(loadStudyStats);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    decks[0]?.id ?? null,
  );

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
  const selectedCounts = selectedDeckId
    ? getDeckCounts(stats, selectedDeckId)
    : null;

  const handleReset = () => {
    const confirmed = window.confirm(dict.analytics.resetConfirm);
    if (!confirmed) return;
    setStats(clearStudyStats());
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
            <BarChart3 className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {dict.analytics.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="premium-btn flex items-center gap-2 rounded-lg border border-rose-500/25 px-4 py-2.5 text-sm font-medium text-rose-400/90 transition-all duration-300 hover:border-rose-500/70 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-[0_0_12px_rgba(244,63,94,0.25)]"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          {dict.analytics.resetButton}
        </button>
      </div>

      {/* Zona superior — consolidado global */}
      <section>
        <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.analytics.global}
        </h3>
        <RatingBarChart counts={stats.global} />
      </section>

      {/* Zona inferior — selector de mazos + gráfico individual */}
      <section>
        <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.analytics.deckAnalysis}
        </h3>

        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-card-rest py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
              <Layers className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {dict.analytics.noDecksState}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.analytics.deckAnalysis}>
              {decks.map((deck) => {
                const isActive = deck.id === selectedDeckId;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedDeckId(deck.id)}
                    className={[
                      "premium-btn rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "border-primary bg-primary-soft text-primary shadow-glow-sm"
                        : "border-card-rest text-secondary-foreground hover:border-primary hover:text-foreground",
                    ].join(" ")}
                  >
                    {deck.name}
                  </button>
                );
              })}
            </div>

            {selectedDeck && selectedCounts ? (
              <RatingBarChart counts={selectedCounts} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {dict.analytics.selectDeck}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

type RatingRow = {
  label: string;
  value: number;
  barClass: string;
  valueClass: string;
};

function RatingBarChart({ counts }: { counts: RatingCounts }) {
  const { dict } = useLanguage();
  const total = counts.again + counts.hard + counts.good + counts.easy;
  const max = Math.max(counts.again, counts.hard, counts.good, counts.easy, 1);

  const rows: RatingRow[] = [
    {
      label: dict.studyCard.rateAgain,
      value: counts.again,
      barClass: "bg-rose-500",
      valueClass: "text-rose-400",
    },
    {
      label: dict.studyCard.rateHard,
      value: counts.hard,
      barClass: "bg-amber-500",
      valueClass: "text-amber-400",
    },
    {
      label: dict.studyCard.rateGood,
      value: counts.good,
      barClass: "bg-blue-500",
      valueClass: "text-blue-400",
    },
    {
      label: dict.studyCard.rateEasy,
      value: counts.easy,
      barClass: "bg-emerald-500",
      valueClass: "text-emerald-400",
    },
  ];

  return (
    <div className="glow-card p-6">
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-secondary-foreground">
                {row.label}
              </span>
              <span className={`font-semibold tabular-nums ${row.valueClass}`}>
                {row.value}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-background/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${row.barClass}`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-card-rest pt-4">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.analytics.totalReviewsLabel}
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {total}
        </span>
      </div>
    </div>
  );
}
