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

/**
 * Tarjeta Monolítica 3D — frente y reverso comparten exactamente el mismo
 * tratamiento de color (tokens de tema). El giro solo cambia el contenido.
 * Textos densos viven en un viewport con scroll premium (`.ui-scrollbar`).
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
      className="flip-scene h-[min(560px,75vh)] w-full max-w-3xl cursor-pointer rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <div
        className={[
          "flip-card-inner",
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
        "flip-card-face flashcard-face flex flex-col overflow-hidden rounded-2xl border border-card-rest bg-card text-card-foreground",
        isBack ? "flip-card-face-back" : "",
      ].join(" ")}
    >
      <div className="ui-scrollbar max-h-[60vh] min-h-0 w-full flex-1 overflow-y-auto">
        <div className="flex min-h-full w-full flex-col items-center justify-center gap-5 px-8 py-8 text-center sm:px-12 sm:py-10">
          {card.tag && (
            <span className="shrink-0 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-primary uppercase">
              {card.tag}
            </span>
          )}

          {!isBack && questionImage && <CardImage imageId={questionImage} />}

          <div
            className="w-full max-w-2xl text-2xl leading-relaxed text-foreground"
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

          {!isBack && (
            <span className="shrink-0 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
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
