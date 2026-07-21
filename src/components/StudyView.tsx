import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Plus, Sparkles, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { recordRatingStat, type RatingKind } from "../lib/studyStats";
import { useFlashcardStore } from "../store/flashcardStore";
import type { Deck, StudyCardData } from "../types/deck";
import type { Flashcard } from "../types/schema";
import { saveImage } from "../utils/mediaStore";
import { createInitialSrsState } from "../utils/spacedRepetition";
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

/** Adapta `Flashcard` (bóveda) al contrato visual de `StudyCard` sin tocar su markup. */
function toStudyCardData(card: Flashcard): StudyCardData {
  let hash = 0;
  for (let i = 0; i < card.id.length; i += 1) {
    hash = (hash * 31 + card.id.charCodeAt(i)) | 0;
  }
  return {
    id: Math.abs(hash) || 1,
    front: card.front,
    hint: "",
    back: card.back,
    tag: card.tags[0],
    interval: card.interval,
    easeFactor: card.easeFactor,
    nextReviewDate: card.nextReview,
  };
}

function isFlashcardDue(nextReview: string, nowMs: number = Date.now()): boolean {
  const due = Date.parse(nextReview);
  if (Number.isNaN(due)) return true;
  return due <= nowMs;
}

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
 *
 * A diferencia de la sesión "0+0+0" anterior (cola con estados
 * new/learning/review persistida en `localStorage`), aquí cada tarjeta
 * lleva su propio progreso SM-2 (`interval`/`easeFactor`/`nextReviewDate`,
 * ver `src/types/deck.ts`) directamente en `deck.cards` — ese progreso YA
 * se persiste en disco físico, porque `DashboardLayout.tsx` sobrescribe y
 * guarda (`saveDecks()`) el mazo completo en la Bóveda tras cada cambio
 * (Misión 2). Por eso `StudyView` no necesita cola propia persistida: solo
 * recorre — con un índice secuencial que da la vuelta al llegar al final —
 * el subconjunto de `deck.cards` que "El Filtro del Olvido" (Misión 3)
 * considera vencido: `nextReviewDate <= ahora`, o tarjetas completamente
 * nuevas (que nacen con `nextReviewDate` = su fecha de creación, ver
 * `createInitialSrsState()`). El resto del mazo existe, pero no aparece en
 * esta sesión hasta que le toque.
 */
export default function StudyView({
  deck,
  onExit,
  onAddCard,
  onUpdateCard: _onUpdateCard,
  onResetDeckSrs,
}: StudyViewProps) {
  const { dict, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const vaultFlashcards = useFlashcardStore((state) => state.flashcards);
  const updateCard = useFlashcardStore((state) => state.updateCard);
  const addVaultCard = useFlashcardStore((state) => state.addCard);

  // Filtro cognitivo: solo tarjetas del mazo activo con `nextReview` <= ahora.
  const allCards = vaultFlashcards.filter((card) => card.deckId === deck?.id);
  const cards = allCards.filter((card) => isFlashcardDue(card.nextReview));
  const currentVaultCard = cards[currentIndex];
  const currentCard = currentVaultCard
    ? toStudyCardData(currentVaultCard)
    : undefined;

  // Cambiar de mazo (o que el mazo actual pierda/gane tarjetas por fuera de
  // esta vista) reinicia el puntero — nunca queremos apuntar a un índice que
  // ya no existe, ni arrastrar el giro de la tarjeta anterior a la nueva.
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck?.id]);

  useEffect(() => {
    if (currentIndex >= cards.length) setCurrentIndex(0);
  }, [cards.length, currentIndex]);

  const handleFlip = () => setIsFlipped((current) => !current);

  /**
   * Veredicto SRS: `calculateNextReview` → `updateCard` (bóveda) →
   * avanza índice → vuelve la tarjeta al frente.
   */
  const handleRate = (grade: ReviewGrade) => {
    if (!deck || !currentVaultCard) return;

    const {
      newInterval,
      newEaseFactor,
      newRepetitions,
      nextReviewDate,
    } = calculateNextReview({
      interval: currentVaultCard.interval,
      easeFactor: currentVaultCard.easeFactor,
      repetitions: currentVaultCard.repetitions,
      grade,
    });

    updateCard(currentVaultCard.id, {
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
      nextReview: nextReviewDate,
    });
    recordRatingStat(deck.id, GRADE_TO_RATING_KIND[grade]);

    setIsFlipped(false);
    setCurrentIndex((index) => index + 1);
  };

  const handleSaveCard = (
    draft: Omit<StudyCardData, "id" | "interval" | "easeFactor" | "nextReviewDate">,
  ) => {
    if (!deck) return;
    // Tarjeta "completamente nueva" (Misión 3): nace con `nextReviewDate` =
    // ahora, así entra directo en la cola de estudio activa sin esperar.
    const newCard: StudyCardData = {
      id: createCardId(),
      ...createInitialSrsState(),
      ...draft,
    };
    onAddCard(deck.id, newCard);
    // Misma tarjeta en la bóveda Zustand/FS (cola que alimenta el Filtro Cognitivo).
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

      {/* -translate-y-6: centro óptico, no matemático — el bloque
          tarjeta+comando+progreso lee más "pesado" abajo. */}
      <div className="flex flex-1 -translate-y-6 flex-col items-center justify-center gap-6">
        {deck && (
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {deck.name}
          </p>
        )}

        {currentCard && currentVaultCard ? (
          <StudyCard key={currentVaultCard.id} card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
        ) : deck && allCards.length === 0 ? (
          <EmptyDeckState onAddCard={() => setIsModalOpen(true)} />
        ) : deck ? (
          // Misión 3: el mazo SÍ tiene tarjetas, pero ninguna está vencida
          // hoy — un estado distinto de "mazo vacío", con su propio copy.
          <AllCaughtUpState />
        ) : null}

        {/* Misión 4, condición estricta: este bloque entero solo existe en
            el DOM cuando `isFlipped` es verdadero — no es un `hidden`/opacidad. */}
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

/** "La Forja": modal de creación de tarjetas, mismo lenguaje visual "Premium Dark" del resto de la app. */
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFront("");
      setHint("");
      setBack("");
      setImageFile(null);
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      // La imagen se sube a IndexedDB recién al confirmar — así un modal
      // cerrado/cancelado nunca deja blobs huérfanos en el almacén.
      const imageId = imageFile ? await saveImage(imageFile) : undefined;
      onSave({ front: front.trim(), hint: hint.trim(), back: back.trim(), imageId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-card-rest bg-card p-6 shadow-glow-card"
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

        <div className="mt-6">
          <label
            htmlFor="add-card-question"
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {dict.addCardModal.questionLabel}
          </label>
          <textarea
            id="add-card-question"
            autoFocus
            rows={2}
            value={front}
            onChange={(event) => setFront(event.target.value)}
            placeholder={dict.addCardModal.questionPlaceholder}
            className="mt-2 w-full resize-none rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="add-card-image"
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {dict.addCardModal.imageLabel}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="premium-btn flex items-center gap-2 rounded-lg border border-card-rest px-3 py-2 text-sm font-medium text-secondary-foreground transition-all duration-300 hover:border-primary hover:text-foreground hover:shadow-glow-sm"
            >
              <ImagePlus className="h-4 w-4" strokeWidth={2} />
              {dict.addCardModal.imageLabel}
            </button>
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {imageFile ? imageFile.name : dict.addCardModal.noImageLabel}
            </span>
          </div>
          <input
            id="add-card-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="add-card-hint"
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {dict.addCardModal.hintLabel}
          </label>
          <textarea
            id="add-card-hint"
            rows={2}
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder={dict.addCardModal.hintPlaceholder}
            className="mt-2 w-full resize-none rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="add-card-answer"
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {dict.addCardModal.answerLabel}
          </label>
          <textarea
            id="add-card-answer"
            rows={2}
            value={back}
            onChange={(event) => setBack(event.target.value)}
            placeholder={dict.addCardModal.answerPlaceholder}
            className="mt-2 w-full resize-none rounded-lg border border-card-rest bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-sm"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-300 hover:text-foreground"
          >
            {dict.addCardModal.cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
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
