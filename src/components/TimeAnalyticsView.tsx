import { Clock, Layers } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { formatDurationHuman, formatGlobalTime } from "../lib/time";
import type { Language } from "../i18n/dictionary";
import type { Deck } from "../types/deck";

type TimeAnalyticsViewProps = {
  decks: Deck[];
  /** Segundos acumulados por el Cronómetro Inmortal (ver `DashboardLayout.tsx`). */
  globalTime: number;
};

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
};

/**
 * Distribución determinista (no aleatoria) de `totalSeconds` a lo largo de
 * los últimos 7 días. Son pesos fijos con forma de curva creciente hacia
 * "hoy" — una simulación estable, sin depender de un historial diario real
 * que la app todavía no persiste, y sin ninguna librería de gráficos.
 */
const WEEKLY_WEIGHTS = [0.08, 0.1, 0.13, 0.11, 0.15, 0.2, 0.23];

function buildWeeklySeries(
  totalSeconds: number,
  language: Language,
): { label: string; seconds: number }[] {
  const today = new Date();
  const locale = LOCALE_BY_LANGUAGE[language];

  return WEEKLY_WEIGHTS.map((weight, index) => {
    const dayOffset = WEEKLY_WEIGHTS.length - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);

    return {
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      seconds: Math.round(totalSeconds * weight),
    };
  });
}

/** Hash simple y estable (mismo mazo → mismo tiempo simulado siempre, sin `Math.random`). */
function hashDeckId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Reparte entre 5% y 40% del tiempo total por mazo — una estimación estable, no un tracking real por sesión. */
function estimateDeckSeconds(deckId: string, totalSeconds: number): number {
  const normalized = (hashDeckId(deckId) % 1000) / 1000; // [0, 1), estable por mazo
  const ratio = 0.05 + normalized * 0.35; // entre 5% y 40% del total
  return Math.round(totalSeconds * ratio);
}

/**
 * "Interfaz de Estadísticas": el Tiempo Total es real (viene del Cronómetro
 * Inmortal), mientras que el desglose de los últimos 7 días y por mazo es
 * una simulación derivada y determinista sobre ese total — hasta que la app
 * persista un historial diario real. Cero librerías de gráficos: todas las
 * barras son `<div>` con `width`/`height` en línea sobre Tailwind puro.
 */
export default function TimeAnalyticsView({ decks, globalTime }: TimeAnalyticsViewProps) {
  const { dict, language } = useLanguage();
  const weeklySeries = buildWeeklySeries(globalTime, language);
  const maxWeeklySeconds = Math.max(...weeklySeries.map((day) => day.seconds), 1);

  const deckTimes = decks.map((deck) => ({
    deck,
    seconds: estimateDeckSeconds(deck.id, globalTime),
  }));
  const maxDeckSeconds = Math.max(...deckTimes.map((entry) => entry.seconds), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Tiempo Total ── */}
      <section className="glow-card p-6">
        <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.timeAnalytics.totalTimeLabel}
        </h3>

        <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums text-foreground md:text-5xl">
          {formatGlobalTime(globalTime)}
        </p>
        <p className="mt-2 text-sm text-secondary-foreground">
          {dict.timeAnalytics.totalTimeCaption}
        </p>

        <div className="mt-6 border-t border-card-rest pt-5">
          <p className="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {dict.timeAnalytics.last7DaysLabel}
          </p>

          {/* Mini-gráfica de barras verticales — puro Tailwind + estilos en línea, sin librerías */}
          <div className="flex h-32 items-end justify-between gap-3">
            {weeklySeries.map((day, index) => {
              const heightPercent = Math.max(
                4,
                (day.seconds / maxWeeklySeconds) * 100,
              );
              const isToday = index === weeklySeries.length - 1;

              return (
                <div
                  key={`${day.label}-${index}`}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-24 w-full items-end">
                    <div
                      title={formatDurationHuman(day.seconds, dict.time)}
                      style={{ height: `${heightPercent}%` }}
                      className={[
                        "w-full rounded-t-md transition-all duration-500",
                        isToday ? "bg-primary shadow-glow-sm" : "bg-primary/30",
                      ].join(" ")}
                    />
                  </div>
                  <span
                    className={[
                      "text-[11px] font-medium tracking-wide capitalize",
                      isToday ? "text-primary" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tiempo por Mazo ── */}
      <section>
        <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {dict.timeAnalytics.perDeckTitle}
        </h3>

        {deckTimes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-card-rest py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
              <Layers className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {dict.timeAnalytics.perDeckEmptyState}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {deckTimes.map(({ deck, seconds }) => {
              const widthPercent = Math.max(3, (seconds / maxDeckSeconds) * 100);

              return (
                <article key={deck.id} className="glow-card p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
                        <Clock className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {deck.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                      {formatDurationHuman(seconds, dict.time)}
                    </span>
                  </div>

                  {/* Barra de progreso horizontal — `<div>` con `width` en línea, sin librerías */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
