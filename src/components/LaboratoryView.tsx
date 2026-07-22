import { useMemo, useState } from "react";
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
import type { Deck } from "../types/deck";
import { DEFAULT_EASE_FACTOR, isCardDue } from "../utils/spacedRepetition";

type LaboratoryViewProps = {
  decks: Deck[];
};

/**
 * "El Santuario de Datos": paleta fija de basalto oscuro + ámbar, INDEPENDIENTE
 * del tema activo de la app (Cuervo/Zen/Pop) — a propósito
 * son valores literales, no `var(--...)`, porque este panel debe leer siempre
 * como el mismo instrumento quirúrgico sin importar qué tema haya elegido el
 * usuario en `ThemeView`. Misma intuición cromática que "Santuario de
 * Basalto" en `index.css` (`#0b0d0f` + `#f3b36b`), pero aislada aquí.
 */
const BASALT_BG = "#0b0d0f";
const CARD_BG = "#12161c";
const AMBER = "#f3b36b";

/** Sin fallbacks inventados — vault vacío = métricas nulas / cero. */
type LabMetrics = {
  cognitiveLoad: number;
  retentionIndex: number | null;
  synapticStability: number | null;
  hasHistory: boolean;
};

function computeLabMetrics(decks: Deck[], stats: StudyStats): LabMetrics {
  const allCards = decks.flatMap((deck) => deck.cards);

  const cognitiveLoad =
    allCards.length > 0
      ? allCards.filter((card) => isCardDue(card.nextReviewDate)).length
      : 0;

  const { again, hard, good, easy } = stats.global;
  const totalReviews = again + hard + good + easy;
  const retentionIndex =
    totalReviews > 0
      ? Math.round(((good + easy) / totalReviews) * 100)
      : null;

  const synapticStability =
    allCards.length > 0
      ? Math.round(
          (allCards.reduce(
            (sum, card) => sum + (card.easeFactor ?? DEFAULT_EASE_FACTOR),
            0,
          ) /
            allCards.length) *
            100,
        ) / 100
      : null;

  return {
    cognitiveLoad,
    retentionIndex,
    synapticStability,
    hasHistory: totalReviews > 0 || allCards.length > 0,
  };
}

type CurvePoint = { day: number; retention: number };

/**
 * Puntos donde el motor SM-2 dispararía un repaso exitoso ("Bueno") sobre una
 * tarjeta recién aprendida — la progresión clásica 1/3/7/14/30 días de la
 * Repetición Espaciada.
 */
const REVIEW_CHECKPOINTS = [0, 1, 3, 7, 14, 30] as const;
const CURVE_SEGMENT_COUNT = REVIEW_CHECKPOINTS.length - 1;

/**
 * "El Monitor de la Curva del Olvido": simula visualmente la Curva de
 * Ebbinghaus — caída drástica tras la primera exposición, cada repaso
 * posterior la recupera pero la deja decaer un poco menos que la vez
 * anterior — usando el Índice de Retención y la Estabilidad Sináptica reales
 * (o de calibración) como parámetros. No es un registro histórico real (la
 * app no guarda series de tiempo por tarjeta); es la misma clase de
 * ilustración pedagógica que cualquier libro de neurociencia usa para
 * explicar por qué el repaso espaciado funciona.
 *
 * Cada tramo entre dos checkpoints de repaso decae exponencialmente desde su
 * `peak` (justo después del repaso, nunca un 100% perfecto salvo el primero)
 * hacia su propio "piso" — el primer piso es deliberadamente bajo (caída
 * dramática, como la curva original de Ebbinghaus sin refuerzo alguno) y
 * cada piso siguiente se acerca linealmente al Índice de Retención real, así
 * el último tramo ya estabiliza justo en ese valor. `tau` (la vida media del
 * decaimiento) crece multiplicado por la Estabilidad Sináptica en cada
 * tramo — el mismo principio que hace crecer el intervalo en `calculateSM2`
 * cuando una tarjeta se califica como "Bueno": cada repaso exitoso hace que
 * el olvido avance más despacio la próxima vez.
 *
 * Cada checkpoint incluye DOS puntos con el mismo día: el final del
 * decaimiento del tramo anterior (el mínimo, justo antes del repaso) y el
 * arranque del tramo siguiente (el nuevo pico, justo después) — la línea los
 * conecta con un salto casi vertical, la misma lectura instantánea que
 * cualquier gráfico real de repetición espaciada usa para marcar "aquí hubo
 * un repaso exitoso".
 */
function buildForgettingCurve(
  retentionIndex: number,
  easeFactor: number,
): CurvePoint[] {
  const points: CurvePoint[] = [];
  // Piso del primer tramo, SIN repaso todavía: siempre notablemente bajo
  // (la caída dramática de Ebbinghaus), pero escalado un poco por el propio
  // Índice de Retención para que un mazo ya muy estable no finja un colapso
  // total en su primerísima exposición.
  const initialFloor = Math.min(35, Math.max(10, retentionIndex - 55));
  let tau = 1.1;

  for (let segment = 0; segment < CURVE_SEGMENT_COUNT; segment++) {
    const start = REVIEW_CHECKPOINTS[segment];
    const end = REVIEW_CHECKPOINTS[segment + 1];
    // Interpolación lineal: el piso avanza de `initialFloor` (tramo 0) hasta
    // `retentionIndex` (último tramo) — cada repaso superado "gana terreno".
    const progress = segment / (CURVE_SEGMENT_COUNT - 1);
    const segmentFloor = initialFloor + (retentionIndex - initialFloor) * progress;
    // El recuerdo justo después de un repaso nunca vuelve a ser un 100%
    // perfecto salvo la primera vez que se ve la tarjeta.
    const segmentPeak = segment === 0 ? 100 : 97 - segment * 1.5;

    // Ambos extremos INCLUSIVE (a propósito): el `start` de este tramo
    // vuelve a dibujar el mismo día que el `end` del tramo anterior, con un
    // valor mucho más alto — de ahí el salto vertical del repaso.
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

  const metrics = useMemo(() => computeLabMetrics(decks, stats), [decks, stats]);
  const curveData = useMemo(() => {
    if (
      metrics.retentionIndex === null ||
      metrics.synapticStability === null
    ) {
      return [];
    }
    return buildForgettingCurve(
      metrics.retentionIndex,
      metrics.synapticStability,
    );
  }, [metrics.retentionIndex, metrics.synapticStability]);

  const showEmptyCurve = !metrics.hasHistory;

  return (
    <div
      className="flex flex-col gap-6 rounded-xl border border-white/5 p-6 sm:p-8"
      style={{ backgroundColor: BASALT_BG }}
    >
      <header>
        <p className="text-[11px] font-medium tracking-[0.22em] text-[#e5e7eb]/50 uppercase">
          {dict.laboratory.subtitle}
        </p>
        <h2 className="lab-serif mt-2 text-3xl font-medium tracking-tight text-[#e5e7eb] sm:text-4xl">
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
          value={
            metrics.retentionIndex === null
              ? "—"
              : `${metrics.retentionIndex}%`
          }
          detail={
            metrics.retentionIndex === null
              ? dict.emptyStates.noMetrics
              : dict.laboratory.retentionIndexDetail
          }
        />
        <MetricCard
          icon={Activity}
          label={dict.laboratory.synapticStabilityLabel}
          value={
            metrics.synapticStability === null
              ? "—"
              : metrics.synapticStability.toFixed(2)
          }
          detail={
            metrics.synapticStability === null
              ? dict.emptyStates.noMetrics
              : dict.laboratory.synapticStabilityDetail
          }
        />
      </section>

      <section
        className="rounded-lg border border-white/5 p-5 sm:p-6"
        style={{ backgroundColor: CARD_BG }}
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="lab-serif text-lg font-medium tracking-tight text-[#e5e7eb] sm:text-xl">
              {dict.laboratory.curveTitle}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#e5e7eb]/50">
              {dict.laboratory.curveSubtitle}
            </p>
          </div>
          {!showEmptyCurve && (
            <div className="flex items-center gap-2 text-[11px] tracking-wide text-[#e5e7eb]/50 uppercase">
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
            <p className="max-w-sm text-sm leading-relaxed text-[#e5e7eb]/45">
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
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                type="number"
                domain={[0, REVIEW_CHECKPOINTS[REVIEW_CHECKPOINTS.length - 1]]}
                ticks={REVIEW_CHECKPOINTS as unknown as number[]}
                tickFormatter={(day: number) => `${day}`}
                tick={{ fill: "rgba(229,231,235,0.4)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(229,231,235,0.1)" }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value}%`}
                tick={{ fill: "rgba(229,231,235,0.4)", fontSize: 11 }}
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
    </div>
  );
}

type MetricCardProps = {
  icon: typeof Brain;
  label: string;
  value: string;
  detail: string;
};

/** Una Señal Vital: minimalista, bordes sutiles, fondo apenas más claro que el basalto de fondo — sin el resplandor `glow-card` del resto de la app (Misión: "sobriedad absoluta"). */
function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <article
      className="rounded-lg border border-white/5 p-5 transition-colors duration-300 hover:border-[#f3b36b]/25"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.16em] text-[#e5e7eb]/50 uppercase">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-[#f3b36b]" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-[#e5e7eb]">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-[#e5e7eb]/45">
        {detail}
      </p>
    </article>
  );
}

type LabTooltipProps = TooltipContentProps & {
  dayLabel: string;
  retentionLabel: string;
};

/** Tooltip a medida — la caja blanca por defecto de Recharts rompería de inmediato la "sobriedad absoluta" del panel. */
function LabTooltip({ active, payload, dayLabel, retentionLabel }: LabTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as CurvePoint;

  return (
    <div
      className="rounded-md border border-white/10 px-3 py-2 text-xs shadow-none"
      style={{ backgroundColor: "#0b0d0fe6" }}
    >
      <p className="text-[#e5e7eb]/50">
        {dayLabel} {point.day}
      </p>
      <p className="mt-0.5 font-semibold tabular-nums text-[#f3b36b]">
        {retentionLabel} {point.retention}%
      </p>
    </div>
  );
}
