import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Crosshair,
  Library,
  Trophy,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useSimulatorStore } from "../store/simulatorStore";
import {
  clozeAnswersFromCard,
  clozeSegmentsFromCard,
} from "../utils/parseClozeSyntax";
import SimulatorManager from "./SimulatorManager";

type FeedbackState = "idle" | "correct" | "incorrect" | "partial";

function shuffleOptions(options: string[]): string[] {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/**
 * Simulador — biblioteca CRUD + sesión Interactive Cloze con bucle de castigo.
 */
export default function SimulatorView() {
  const { dict } = useLanguage();
  const currentSession = useSimulatorStore((s) => s.currentSession);
  const currentIndex = useSimulatorStore((s) => s.currentIndex);
  const score = useSimulatorStore((s) => s.score);
  const attempts = useSimulatorStore((s) => s.attempts);
  const isSessionFinished = useSimulatorStore((s) => s.isSessionFinished);
  const nextCard = useSimulatorStore((s) => s.nextCard);
  const endSession = useSimulatorStore((s) => s.endSession);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  /** Índices de hueco ya rellenados correctamente (multi-[[ ]]). */
  const [filledBlankIndexes, setFilledBlankIndexes] = useState<number[]>([]);
  const advanceTimerRef = useRef<number | null>(null);

  const cards = currentSession?.cards ?? [];
  const currentCard = cards[currentIndex];
  const queueLength = cards.length;

  const segments = useMemo(
    () => (currentCard ? clozeSegmentsFromCard(currentCard) : []),
    [currentCard],
  );
  const answers = useMemo(
    () => (currentCard ? clozeAnswersFromCard(currentCard) : []),
    [currentCard],
  );

  const shuffledOptions = useMemo(() => {
    if (!currentCard) return [];
    return shuffleOptions(
      uniquePreserveOrder([...answers, ...currentCard.distractors]),
    );
  }, [currentIndex, currentCard, answers]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedbackState("idle");
    setFilledBlankIndexes([]);
  }, [currentIndex, currentCard?.id]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current != null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current != null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  const handleSelect = (option: string) => {
    if (feedbackState !== "idle") return;
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!currentCard || !selectedOption || feedbackState !== "idle") return;

    const matchIndex = answers.findIndex(
      (answer, index) =>
        !filledBlankIndexes.includes(index) && answer === selectedOption,
    );

    if (matchIndex === -1) {
      setFeedbackState("incorrect");
      advanceTimerRef.current = window.setTimeout(() => {
        nextCard(false);
        setSelectedOption(null);
        setFeedbackState("idle");
        setFilledBlankIndexes([]);
        advanceTimerRef.current = null;
      }, 1500);
      return;
    }

    const nextFilled = [...filledBlankIndexes, matchIndex];
    setFilledBlankIndexes(nextFilled);

    if (nextFilled.length >= answers.length) {
      setFeedbackState("correct");
      advanceTimerRef.current = window.setTimeout(() => {
        nextCard(true);
        setSelectedOption(null);
        setFeedbackState("idle");
        setFilledBlankIndexes([]);
        advanceTimerRef.current = null;
      }, 1500);
      return;
    }

    // Acierto parcial: queda al menos un hueco por rellenar.
    setFeedbackState("partial");
    advanceTimerRef.current = window.setTimeout(() => {
      setSelectedOption(null);
      setFeedbackState("idle");
      advanceTimerRef.current = null;
    }, 700);
  };

  const handleExitToLibrary = () => {
    clearAdvanceTimer();
    setSelectedOption(null);
    setFeedbackState("idle");
    setFilledBlankIndexes([]);
    endSession();
  };

  // Sin sesión activa → gestor de biblioteca.
  if (!currentSession) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary-soft text-primary shadow-glow-sm">
            <Crosshair className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {dict.simulator.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.simulator.subtitle}
            </p>
          </div>
        </header>
        <SimulatorManager />
      </div>
    );
  }

  if (isSessionFinished) {
    const precision =
      attempts > 0 ? Math.round((score / attempts) * 100) : 0;

    return (
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-8">
        <SessionHeader
          title={currentSession.deckTitle}
          score={score}
          attempts={attempts}
        />
        <section className="glow-card relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden border-card-rest bg-card/90 p-10 text-center shadow-glow-card backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(212,165,116,0.16),transparent_60%)]"
          />
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary-soft text-primary shadow-[0_0_28px_rgba(212,165,116,0.35)]">
            <Trophy className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <div className="relative z-10">
            <h2
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {dict.simulator.trainingComplete}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {dict.simulator.precisionLabel}{" "}
              <span className="font-semibold tabular-nums text-primary">
                {precision}%
              </span>
              <span className="text-muted-foreground">
                {" "}
                ({score}/{attempts})
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleExitToLibrary}
            className="premium-btn relative z-10 mt-2 flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-5 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
          >
            <Library className="h-4 w-4" strokeWidth={2} />
            {dict.simulator.backToLibrary}
          </button>
        </section>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center text-sm text-muted-foreground">
        {dict.simulator.preparingSession}
      </div>
    );
  }

  const filledAnswerByIndex = new Map(
    filledBlankIndexes.map((index) => [index, answers[index]]),
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-8">
      <SessionHeader
        title={currentSession.deckTitle}
        score={score}
        attempts={attempts}
        index={currentIndex}
        queueLength={queueLength}
        onBack={handleExitToLibrary}
      />

      <section className="glow-card relative flex max-h-[min(720px,85vh)] flex-1 flex-col overflow-hidden border-card-rest bg-card/90 p-8 shadow-glow-card backdrop-blur-xl md:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,165,116,0.12),transparent_55%)]"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
          <div className="ui-scrollbar max-h-[60vh] w-full max-w-2xl overflow-y-auto px-1">
            <p
              className="text-center text-2xl leading-relaxed text-foreground md:text-3xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {segments.map((segment, segmentIndex) => {
                if (segment.kind === "text") {
                  return (
                    <span key={`seg-t-${segmentIndex}`}>{segment.value}</span>
                  );
                }

                const filledValue = filledAnswerByIndex.get(segment.index);
                const isFilled = filledValue != null;
                // Un solo hueco: mostrar la opción elegida en el blank (UX clásica).
                const showSelected =
                  answers.length === 1 &&
                  !isFilled &&
                  selectedOption != null;

                return (
                  <span
                    key={`seg-b-${segment.index}`}
                    className={[
                      "mx-1 inline-flex max-w-full min-w-[7.5rem] items-center justify-center rounded-lg border px-3 py-1 align-baseline text-xl font-medium tracking-wide break-words transition-all duration-300 md:min-w-[9rem] md:text-2xl",
                      feedbackState === "correct"
                        ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-600"
                        : feedbackState === "incorrect"
                          ? "border-rose-400/60 bg-rose-500/15 text-rose-600"
                          : isFilled || showSelected
                            ? "border-primary/40 bg-primary-soft text-primary"
                            : "border-dashed border-card-rest bg-background/50 text-muted-foreground",
                    ].join(" ")}
                  >
                    {filledValue ?? (showSelected ? selectedOption : "_____")}
                  </span>
                );
              })}
            </p>
          </div>

          <div className="ui-scrollbar max-h-[28vh] w-full overflow-y-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {shuffledOptions.map((option) => {
                const isActive = selectedOption === option;
                const isAnswer = answers.includes(option);
                const alreadyUsed =
                  isAnswer &&
                  filledBlankIndexes.some(
                    (index) => answers[index] === option,
                  );

                let tone =
                  "border-card-rest bg-background/50 text-secondary-foreground hover:border-primary/40 hover:bg-primary-soft hover:text-foreground";

                if (feedbackState === "correct" && isActive) {
                  tone =
                    "border-emerald-400/70 bg-emerald-500/20 text-emerald-700";
                } else if (feedbackState === "incorrect") {
                  if (isActive) {
                    tone = "border-rose-400/70 bg-rose-500/20 text-rose-700";
                  } else if (isAnswer && !alreadyUsed) {
                    tone =
                      "border-emerald-400/50 bg-emerald-500/10 text-emerald-700";
                  } else {
                    tone =
                      "border-card-rest bg-background/30 text-muted-foreground";
                  }
                } else if (feedbackState === "partial" && isActive) {
                  tone =
                    "border-emerald-400/60 bg-emerald-500/15 text-emerald-700";
                } else if (alreadyUsed) {
                  tone =
                    "border-card-rest bg-background/30 text-muted-foreground opacity-50";
                } else if (isActive) {
                  tone =
                    "border-primary/70 bg-primary/15 text-primary shadow-glow-sm";
                }

                return (
                  <button
                    key={`${currentIndex}-${option}`}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={feedbackState !== "idle" || alreadyUsed}
                    aria-pressed={isActive}
                    className={[
                      "rounded-full border px-5 py-2.5 text-sm font-medium tracking-wide break-words transition-all duration-300 disabled:cursor-default",
                      tone,
                    ].join(" ")}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex shrink-0 justify-center border-t border-card-rest pt-6">
          <button
            type="button"
            disabled={!selectedOption || feedbackState !== "idle"}
            onClick={handleCheck}
            className="premium-btn flex min-w-[12rem] items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card disabled:pointer-events-none disabled:opacity-35"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            {dict.simulator.checkAnswer}
          </button>
        </div>
      </section>
    </div>
  );
}

function SessionHeader({
  title,
  score,
  attempts,
  index,
  queueLength,
  onBack,
}: {
  title: string;
  score: number;
  attempts: number;
  index?: number;
  queueLength?: number;
  onBack?: () => void;
}) {
  const { dict, t } = useLanguage();
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="premium-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-card-rest text-icon-muted transition-colors hover:border-primary hover:text-primary"
            aria-label={dict.simulator.backToLibrary}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary-soft text-primary shadow-glow-sm">
            <Crosshair className="h-5 w-5" strokeWidth={1.75} />
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.simulator.sessionHint}
          </p>
        </div>
      </div>
      <div className="text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {typeof index === "number" && typeof queueLength === "number" ? (
          <p className="tabular-nums">
            {index + 1} / {queueLength}
          </p>
        ) : null}
        <p className="mt-0.5 tabular-nums text-primary">
          {t(dict.simulator.scoreLabel, { score })}
          {attempts > 0
            ? t(dict.simulator.attemptsSuffix, { count: attempts })
            : ""}
        </p>
      </div>
    </header>
  );
}
