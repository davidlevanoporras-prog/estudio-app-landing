import { useEffect, useMemo, useState } from "react";
import { Activity, Brain, Target } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useLanguage } from "../i18n/LanguageContext";
import { loadStudyStats, type StudyStats } from "../lib/studyStats";
import {
  getSystemPrefersDark,
  resolveThemeMode,
  useThemeStore,
} from "../store/themeStore";
import type { Deck } from "../types/deck";
import { DEFAULT_EASE_FACTOR, isCardDue } from "../utils/spacedRepetition";
import GlassPanel from "./GlassPanel";
import InfoTooltip from "./InfoTooltip";

type LaboratoryViewProps = {
  decks: Deck[];
};

/** Acento de marca — invariante en claro/oscuro. */
const AMBER = "#f3b36b";

/**
 * Cold start seguro: sin historial → 0 / DEFAULT_EASE_FACTOR (nunca NaN ni null en UI).
 * La curva de olvido solo se dibuja con al menos una revisión real.
 */
type LabMetrics = {
  cognitiveLoad: number;
  retentionIndex: number;
  synapticStability: number;
  totalReviews: number;
  hasReviewHistory: boolean;
};

function safeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function computeLabMetrics(decks: Deck[], stats: StudyStats): LabMetrics {
  const allCards = decks.flatMap((deck) => deck.cards);

  const cognitiveLoad =
    allCards.length > 0
      ? allCards.filter((card) => isCardDue(card.nextReviewDate)).length
      : 0;

  const { again, hard, good, easy } = stats.global;
  const totalReviews = safeNumber(again + hard + good + easy);
  const retentionIndex =
    totalReviews > 0
      ? Math.round(((good + easy) / totalReviews) * 100)
      : 0;

  const synapticStability =
    allCards.length > 0
      ? Math.round(
          (allCards.reduce(
            (sum, card) =>
              sum + safeNumber(card.easeFactor ?? DEFAULT_EASE_FACTOR, DEFAULT_EASE_FACTOR),
            0,
          ) /
            allCards.length) *
            100,
        ) / 100
      : DEFAULT_EASE_FACTOR;

  return {
    cognitiveLoad: safeNumber(cognitiveLoad),
    retentionIndex: safeNumber(retentionIndex),
    synapticStability: safeNumber(synapticStability, DEFAULT_EASE_FACTOR),
    totalReviews,
    hasReviewHistory: totalReviews > 0,
  };
}

type CurvePoint = { day: number; retention: number };

const REVIEW_CHECKPOINTS = [0, 1, 3, 7, 14, 30] as const;
const CURVE_SEGMENT_COUNT = REVIEW_CHECKPOINTS.length - 1;

function buildForgettingCurve(
  retentionIndex: number,
  easeFactor: number,
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const initialFloor = Math.min(35, Math.max(10, retentionIndex - 55));
  let tau = 1.1;

  for (let segment = 0; segment < CURVE_SEGMENT_COUNT; segment++) {
    const start = REVIEW_CHECKPOINTS[segment];
    const end = REVIEW_CHECKPOINTS[segment + 1];
    const progress = segment / (CURVE_SEGMENT_COUNT - 1);
    const segmentFloor = initialFloor + (retentionIndex - initialFloor) * progress;
    const segmentPeak = segment === 0 ? 100 : 97 - segment * 1.5;

    for (let day = start; day <= end; day++) {
      const elapsed = day - start;
      const value =
        segmentFloor + (segmentPeak - segmentFloor) * Math.exp(-elapsed / tau);
      points.push({ day, retention: Math.round(Math.max(value, 0) * 10) / 10 });
    }

    tau *= easeFactor;
  }

  return points;
}

export default function LaboratoryView({ decks }: LaboratoryViewProps) {
  const { dict } = useLanguage();
  const [stats] = useState(loadStudyStats);
  const themeMode = useThemeStore((state) => state.themeMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);
  const resolvedMode = resolveThemeMode(themeMode, systemPrefersDark);
  const isDark = resolvedMode === "dark";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemPrefersDark(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const metrics = useMemo(() => computeLabMetrics(decks, stats), [decks, stats]);
  const curveData = useMemo(() => {
    if (!metrics.hasReviewHistory) return [];
    return buildForgettingCurve(
      metrics.retentionIndex,
      metrics.synapticStability,
    );
  }, [
    metrics.hasReviewHistory,
    metrics.retentionIndex,
    metrics.synapticStability,
  ]);

  // Evita Recharts con `data=[]` (cold start / mazos sin reviews → gráfica rota).
  const showEmptyCurve = !metrics.hasReviewHistory || curveData.length === 0;

  const axisMute = isDark ? "rgba(229,231,235,0.4)" : "rgba(24,24,27,0.45)";
  const axisLine = isDark ? "rgba(229,231,235,0.1)" : "rgba(24,24,27,0.12)";
  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <GlassPanel className="flex flex-col gap-6 p-6 sm:p-8">
      <header>
        <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          {dict.laboratory.subtitle}
        </p>
        <h2 className="lab-serif mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {dict.laboratory.title}
        </h2>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={Brain}
          label={dict.laboratory.cognitiveLoadLabel}
          value={String(metrics.cognitiveLoad)}
          detail={dict.laboratory.cognitiveLoadDetail}
        />
        <MetricCard
          icon={Target}
          label={dict.laboratory.retentionIndexLabel}
          value={`${metrics.retentionIndex}%`}
          detail={
            metrics.hasReviewHistory
              ? dict.laboratory.retentionIndexDetail
              : dict.emptyStates.noMetrics
          }
        />
        <MetricCard
          icon={Activity}
          label={dict.laboratory.synapticStabilityLabel}
          value={metrics.synapticStability.toFixed(2)}
          detail={
            metrics.hasReviewHistory || decks.some((d) => d.cards.length > 0)
              ? dict.laboratory.synapticStabilityDetail
              : dict.emptyStates.noMetrics
          }
        />
      </section>

      <section className="rounded-lg border border-card-rest bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="lab-serif flex items-center gap-2 text-lg font-medium tracking-tight text-foreground sm:text-xl">
              <span>{dict.laboratory.curveTitle}</span>
              <InfoTooltip
                label={dict.laboratory.curveTooltipLabel}
                content={dict.laboratory.curveTooltip}
              />
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {dict.laboratory.curveSubtitle}
            </p>
          </div>
          {!showEmptyCurve && (
            <div className="flex items-center gap-2 text-[11px] tracking-wide text-muted-foreground uppercase">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: AMBER }}
                aria-hidden="true"
              />
              {dict.laboratory.curveRetentionLabel}
            </div>
          )}
        </div>

        {showEmptyCurve ? (
          <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-center sm:h-72">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {dict.emptyStates.startSessionForMetrics}
            </p>
          </div>
        ) : (
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={curveData}
                margin={{ top: 4, right: 8, bottom: 0, left: -18 }}
              >
                <CartesianGrid
                  stroke={gridStroke}
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={[0, REVIEW_CHECKPOINTS[REVIEW_CHECKPOINTS.length - 1]]}
                  ticks={REVIEW_CHECKPOINTS as unknown as number[]}
                  tickFormatter={(day: number) => `${day}`}
                  tick={{ fill: axisMute, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLine }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  tick={{ fill: axisMute, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(243,179,107,0.3)", strokeWidth: 1 }}
                  content={(tooltipProps) => (
                    <LabTooltip
                      {...tooltipProps}
                      dayLabel={dict.laboratory.curveDayLabel}
                      retentionLabel={dict.laboratory.curveRetentionLabel}
                    />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke={AMBER}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4, fill: AMBER, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </GlassPanel>
  );
}

type MetricCardProps = {
  icon: typeof Brain;
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-card-rest bg-card p-5 shadow-sm transition-colors duration-300 hover:border-[#f3b36b]/35">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-[#f3b36b]" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </article>
  );
}

type LabTooltipProps = TooltipContentProps & {
  dayLabel: string;
  retentionLabel: string;
};

function LabTooltip({ active, payload, dayLabel, retentionLabel }: LabTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as CurvePoint;

  return (
    <div className="ui-floating rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">
        {dayLabel} {point.day}
      </p>
      <p className="mt-0.5 font-semibold tabular-nums text-[#f3b36b]">
        {retentionLabel} {point.retention}%
      </p>
    </div>
  );
}
