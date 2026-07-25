import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Plus, Sparkles, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { handleImagePaste } from "../lib/pasteImage";
import { recordRatingStat, type RatingKind } from "../lib/studyStats";
import { useFlashcardStore } from "../store/flashcardStore";
import type { Deck, StudyCardData } from "../types/deck";
import { saveImage } from "../utils/mediaStore";
import {
  createInitialSrsState,
  isCardDue,
} from "../utils/spacedRepetition";
import {
  calculateNextReview,
  type ReviewGrade,
} from "../utils/srsAlgorithm";
import StudyCard from "./StudyCard";

let cardIdSequence = 0;
function createCardId(): number {
  cardIdSequence += 1;
  return Date.now() * 1000 + cardIdSequence;
}

/** Traduce Grade 1–4 del SRS a los baldes de analítica histórica. */
const GRADE_TO_RATING_KIND: Record<ReviewGrade, RatingKind> = {
  1: "again",
  2: "hard",
  3: "good",
  4: "easy",
};

type StudyViewProps = {
  deck: Deck | undefined;
  onExit: () => void;
  onAddCard: (deckId: string, card: StudyCardData) => void;
  /** Persiste el nuevo `interval`/`easeFactor` de una tarjeta tras calificarla — ver Misión 4. */
  onUpdateCard: (deckId: string, cardId: number, patch: Partial<StudyCardData>) => void;
  /** "Reiniciar repetición espaciada del mazo": vuelve todas sus tarjetas a `interval: 1, easeFactor: 2.5`. */
  onResetDeckSrs: (deckId: string) => void;
};

/**
 * "El Quirófano Matemático" — Tarjeta Monolítica 3D + motor SM-2.
 * Estudia desde `deck.cards` (pregunta / pista / respuesta + imágenes).
 */
export default function StudyView({
  deck,
  onExit,
  onAddCard,
  onUpdateCard,
  onResetDeckSrs,
}: StudyViewProps) {
  const { dict, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const addVaultCard = useFlashcardStore((state) => state.addCard);

  const allCards = deck?.cards ?? [];
  const cards = useMemo(
    () => allCards.filter((card) => isCardDue(card.nextReviewDate)),
    [allCards],
  );
  const currentCard = cards[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck?.id]);

  useEffect(() => {
    if (currentIndex >= cards.length) setCurrentIndex(0);
  }, [cards.length, currentIndex]);

  const handleFlip = () => setIsFlipped((current) => !current);

  const handleRate = (grade: ReviewGrade) => {
    if (!deck || !currentCard) return;

    const {
      newInterval,
      newEaseFactor,
      nextReviewDate,
    } = calculateNextReview({
      interval: currentCard.interval,
      easeFactor: currentCard.easeFactor,
      repetitions: 0,
      grade,
    });

    onUpdateCard(deck.id, currentCard.id, {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewDate,
    });
    recordRatingStat(deck.id, GRADE_TO_RATING_KIND[grade]);

    setIsFlipped(false);
    setCurrentIndex((index) => index + 1);
  };

  const handleSaveCard = (
    draft: Omit<StudyCardData, "id" | "interval" | "easeFactor" | "nextReviewDate">,
  ) => {
    if (!deck) return;
    const newCard: StudyCardData = {
      id: createCardId(),
      ...createInitialSrsState(),
      ...draft,
    };
    onAddCard(deck.id, newCard);
    addVaultCard(
      draft.front,
      draft.back,
      deck.id,
      draft.tag ? [draft.tag] : [],
    );
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="premium-btn flex w-fit items-center gap-2 self-start rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-secondary-foreground transition-all duration-300 hover:border-primary hover:text-foreground hover:shadow-glow-sm"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {dict.studyCard.backToDecks}
        </button>

        {deck && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {dict.studyView.addCardButton}
          </button>
        )}
      </div>

      <div className="flex flex-1 -translate-y-6 flex-col items-center justify-center gap-6">
        {deck && (
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {deck.name}
          </p>
        )}

        {currentCard ? (
          <StudyCard
            key={currentCard.id}
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        ) : deck && allCards.length === 0 ? (
          <EmptyDeckState onAddCard={() => setIsModalOpen(true)} />
        ) : deck ? (
          <AllCaughtUpState />
        ) : null}

        {currentCard && isFlipped && <TacticalCommandCenter onRate={handleRate} />}

        {deck && cards.length > 0 && (
          <p
            role="status"
            aria-label={dict.studyView.queueCounterLabel}
            className="text-sm font-medium tabular-nums text-muted-foreground"
          >
            {t(dict.studyView.progressLabel, {
              current: currentIndex + 1,
              total: cards.length,
            })}
          </p>
        )}

        {deck && allCards.length > 0 && (
          <button
            type="button"
            onClick={() => onResetDeckSrs(deck.id)}
            className="text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors duration-300 hover:text-primary"
          >
            {dict.studyView.resetDeckButton}
          </button>
        )}
      </div>

      {deck && (
        <AddCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
}

/**
 * "El Centro de Mando Táctico" — 4 botones minimalistas, uno por calidad
 * SM-2. Solo se monta cuando la tarjeta ya está volteada (ver el `&&` en el
 * llamador), así que su entrada suave (`tactical-command-in`, ver
 * `src/index.css`) es lo único que "anima" su aparición — nunca estuvo
 * oculto en el DOM esperando a mostrarse.
 */
function TacticalCommandCenter({
  onRate,
}: {
  onRate: (grade: ReviewGrade) => void;
}) {
  const { dict } = useLanguage();

  return (
    <div className="tactical-command-in flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onRate(1)}
        className="premium-btn rounded-lg border border-rose-400/25 px-4 py-2.5 text-sm font-medium text-rose-300/90 transition-all duration-300 hover:border-rose-400/60 hover:shadow-[0_0_12px_rgba(251,113,133,0.25)]"
      >
        {dict.studyCard.rateAgain}
      </button>
      <button
        type="button"
        onClick={() => onRate(2)}
        className="premium-btn rounded-lg border border-orange-400/25 px-4 py-2.5 text-sm font-medium text-orange-300/90 transition-all duration-300 hover:border-orange-400/60 hover:shadow-[0_0_12px_rgba(251,146,60,0.25)]"
      >
        {dict.studyCard.rateHard}
      </button>
      <button
        type="button"
        onClick={() => onRate(3)}
        className="premium-btn rounded-lg border border-blue-400/25 px-4 py-2.5 text-sm font-medium text-blue-300/90 transition-all duration-300 hover:border-blue-400/60 hover:shadow-[0_0_12px_rgba(96,165,250,0.25)]"
      >
        {dict.studyCard.rateGood}
      </button>
      <button
        type="button"
        onClick={() => onRate(4)}
        className="premium-btn rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:border-primary hover:shadow-glow-card"
      >
        {dict.studyCard.rateEasy}
      </button>
    </div>
  );
}

/**
 * "Al Día" (Misión 3, El Filtro del Olvido): se muestra cuando el mazo
 * tiene tarjetas pero ninguna venció su repaso todavía — a propósito
 * distinto de `EmptyDeckState` (mazo sin tarjetas en absoluto), para que el
 * usuario entienda que su progreso está intacto, no perdido.
 */
function AllCaughtUpState() {
  const { dict } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-card-rest px-10 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
        <Sparkles className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {dict.studyView.allCaughtUpTitle}
        </p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {dict.studyView.allCaughtUpDescription}
        </p>
      </div>
    </div>
  );
}

function EmptyDeckState({ onAddCard }: { onAddCard: () => void }) {
  const { dict } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-card-rest px-10 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
        <Sparkles className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {dict.studyView.emptyDeckTitle}
        </p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {dict.studyView.emptyDeckDescription}
        </p>
      </div>
      <button
        type="button"
        onClick={onAddCard}
        className="premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        {dict.studyView.addCardButton}
      </button>
    </div>
  );
}

/** "La Forja": modal de creación — una imagen independiente por campo. */
type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    draft: Omit<StudyCardData, "id" | "interval" | "easeFactor" | "nextReviewDate">,
  ) => void;
};

function AddCardModal({ isOpen, onClose, onSave }: AddCardModalProps) {
  const { dict } = useLanguage();
  const [front, setFront] = useState("");
  const [hint, setHint] = useState("");
  const [back, setBack] = useState("");
  const [imageQuestion, setImageQuestion] = useState<File | null>(null);
  const [imageHint, setImageHint] = useState<File | null>(null);
  const [imageAnswer, setImageAnswer] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFront("");
      setHint("");
      setBack("");
      setImageQuestion(null);
      setImageHint(null);
      setImageAnswer(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canSave = front.trim().length > 0 && back.trim().length > 0 && !isSaving;

  const handleSubmit = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      // Blobs a IndexedDB solo al confirmar — cancelar no deja huérfanos.
      const [imageQuestionId, imageHintId, imageAnswerId] = await Promise.all([
        imageQuestion ? saveImage(imageQuestion) : Promise.resolve(undefined),
        imageHint ? saveImage(imageHint) : Promise.resolve(undefined),
        imageAnswer ? saveImage(imageAnswer) : Promise.resolve(undefined),
      ]);
      onSave({
        front: front.trim(),
        hint: hint.trim(),
        back: back.trim(),
        ...(imageQuestionId ? { imageQuestion: imageQuestionId } : {}),
        ...(imageHintId ? { imageHint: imageHintId } : {}),
        ...(imageAnswerId ? { imageAnswer: imageAnswerId } : {}),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="ui-floating ui-scrollbar max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2
            id="add-card-modal-title"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {dict.addCardModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.addCardModal.cancelLabel}
            className="premium-btn flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-icon-muted transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-glow-sm"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <ModalTextField
          id="add-card-question"
          label={dict.addCardModal.questionLabel}
          placeholder={dict.addCardModal.questionPlaceholder}
          value={front}
          onChange={setFront}
          autoFocus
          imageFile={imageQuestion}
          onImageChange={setImageQuestion}
          className="mt-6"
        />

        <ModalTextField
          id="add-card-hint"
          label={dict.addCardModal.hintLabel}
          placeholder={dict.addCardModal.hintPlaceholder}
          value={hint}
          onChange={setHint}
          imageFile={imageHint}
          onImageChange={setImageHint}
          className="mt-5"
        />

        <ModalTextField
          id="add-card-answer"
          label={dict.addCardModal.answerLabel}
          placeholder={dict.addCardModal.answerPlaceholder}
          value={back}
          onChange={setBack}
          imageFile={imageAnswer}
          onImageChange={setImageAnswer}
          className="mt-5"
        />

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-card-rest px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-300 hover:border-primary/40 hover:text-foreground"
          >
            {dict.addCardModal.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSave}
            className="premium-btn rounded-lg border border-primary/60 bg-primary px-4 py-2 text-sm font-medium tracking-wide text-primary-foreground transition-all duration-300 hover:border-primary hover:shadow-glow-card disabled:pointer-events-none disabled:opacity-40"
          >
            {dict.addCardModal.saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type ModalTextFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  autoFocus?: boolean;
  className?: string;
};

function ModalTextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  imageFile,
  onImageChange,
  autoFocus,
  className = "",
}: ModalTextFieldProps) {
  const { dict } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={dict.addCardModal.attachImageLabel}
          title={dict.addCardModal.attachImageLabel}
          className="premium-btn inline-flex items-center gap-1.5 rounded-md border border-card-rest px-2 py-1 text-[11px] font-medium tracking-wide text-secondary-foreground uppercase transition-all duration-300 hover:border-primary/50 hover:text-primary"
        >
          <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.addCardModal.attachImageLabel}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            onImageChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>

      <textarea
        id={id}
        autoFocus={autoFocus}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={(event) => {
          const item = Array.from(event.clipboardData?.items ?? []).find(
            (entry) => entry.type.startsWith("image/"),
          );
          const file = item?.getAsFile();
          if (file) {
            event.preventDefault();
            onImageChange(file);
            return;
          }
          void handleImagePaste(event, (markdown) => {
            const el = event.currentTarget;
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            onChange(value.slice(0, start) + markdown + value.slice(end));
          });
        }}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
      />

      {previewUrl && (
        <div className="mt-2 inline-flex items-start gap-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-card-rest bg-background/40">
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              aria-label={dict.addCardModal.removeImageLabel}
              title={dict.addCardModal.removeImageLabel}
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-card-rest bg-card text-muted-foreground shadow-sm transition-colors hover:border-rose-400/50 hover:text-rose-500"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
