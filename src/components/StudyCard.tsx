import { useEffect, useState, type KeyboardEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { registrarAperturaTarjeta } from "../lib/streak";
import {
  resolveQuestionImage,
  type StudyCardData,
} from "../types/deck";
import { getImage } from "../utils/mediaStore";
import RichTextRenderer from "./RichTextRenderer";

export type { StudyCardData };

type StudyCardProps = {
  card: StudyCardData;
  isFlipped: boolean;
  onFlip: () => void;
};

/** Altura fija = caja del reverso desplegado; cero layout shift al voltear. */
const STUDY_CARD_HEIGHT =
  "h-[min(520px,65vh)] min-h-[min(520px,65vh)] max-h-[min(520px,65vh)]";

/**
 * Tarjeta Monolítica 3D — altura rígida en frente/reverso/pistas.
 * Pregunta en tercio superior; "TAP TO REVEAL" anclado abajo.
 */
export default function StudyCard({ card, isFlipped, onFlip }: StudyCardProps) {
  const { dict } = useLanguage();

  useEffect(() => {
    void registrarAperturaTarjeta();
  }, [card.id]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      aria-pressed={isFlipped}
      aria-label={
        isFlipped ? dict.studyCard.flipToQuestion : dict.studyCard.flipToAnswer
      }
      className={[
        "flip-scene w-full max-w-[calc(56rem-0.75rem)] shrink-0 -translate-y-[1.65rem]",
        "mx-auto px-0 sm:px-0",
        "cursor-pointer rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/60",
        STUDY_CARD_HEIGHT,
      ].join(" ")}
    >
      <div
        className={[
          "flip-card-inner h-full w-full",
          isFlipped ? "flip-card-inner-flipped" : "",
        ].join(" ")}
      >
        <CardFace card={card} side="front" />
        <CardFace card={card} side="back" />
      </div>
    </div>
  );
}

type CardFaceProps = {
  card: StudyCardData;
  side: "front" | "back";
};

function CardFace({ card, side }: CardFaceProps) {
  const { dict } = useLanguage();
  const isBack = side === "back";
  const questionImage = resolveQuestionImage(card);

  return (
    <div
      className={[
        "flip-card-face flashcard-face flex h-full w-full flex-col overflow-hidden rounded-2xl border border-card-rest bg-card text-card-foreground",
        isBack ? "flip-card-face-back" : "",
      ].join(" ")}
    >
      <div className="ui-scrollbar min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
        <div className="flex min-h-full w-full flex-col items-center px-10 pb-8 pt-10 text-center sm:px-14 sm:pb-10 sm:pt-12 md:px-16">
          {/* Bloque de lectura: tercio superior (justify-start). */}
          <div className="flex w-full flex-col items-center gap-5">
            {card.tag && (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-primary uppercase">
                {card.tag}
              </span>
            )}

            {!isBack && questionImage && <CardImage imageId={questionImage} />}

            <div
              className="w-full max-w-3xl text-2xl leading-relaxed text-foreground sm:text-[1.65rem] sm:leading-[1.65]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <RichTextRenderer content={isBack ? card.back : card.front} />
            </div>

            {isBack && card.imageAnswer && (
              <CardImage imageId={card.imageAnswer} />
            )}

            {!isBack && card.hint.trim().length > 0 && (
              <div className="flex w-full max-w-xl flex-col items-center gap-3">
                {card.imageHint && <CardImage imageId={card.imageHint} />}
                <div className="w-full text-sm leading-relaxed text-muted-foreground">
                  <RichTextRenderer content={card.hint} />
                </div>
              </div>
            )}

            {!isBack && card.hint.trim().length === 0 && card.imageHint && (
              <CardImage imageId={card.imageHint} />
            )}
          </div>

          {/* Indicación anclada en la zona inferior, separada de la pregunta. */}
          {!isBack && (
            <span className="mt-auto shrink-0 pt-10 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {dict.studyCard.tapToFlip}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CardImage({ imageId }: { imageId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    setImageUrl(null);

    getImage(imageId)
      .then((url) => {
        if (isCancelled || !url) return;
        objectUrl = url;
        setImageUrl(url);
      })
      .catch(() => {
        /* imagen no encontrada — se omite en silencio */
      });

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  if (!imageUrl) return null;

  return <img src={imageUrl} alt="" className="flashcard-media shrink-0" />;
}
