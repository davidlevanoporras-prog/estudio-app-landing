import { useEffect, useState, type KeyboardEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { registrarAperturaTarjeta } from "../lib/streak";
import { getImage } from "../utils/mediaStore";
import type { StudyCardData } from "../types/deck";
import RichTextRenderer from "./RichTextRenderer";

export type { StudyCardData };

type StudyCardProps = {
  card: StudyCardData;
  isFlipped: boolean;
  onFlip: () => void;
};

/**
 * "La Tarjeta Monolítica 3D" — el corazón visual del Quirófano Matemático.
 * Un único bloque de 600×400 (con topes responsivos para no desbordar en
 * pantallas pequeñas), controlado por el padre (`isFlipped`/`onFlip` —
 * `StudyView.tsx` es quien decide cuándo mostrar el Centro de Mando
 * Táctico, ver Misión 4: "los botones SOLO existen en el DOM tras el giro").
 *
 * El giro es un flip 3D real (`perspective` + `rotateY` + `backface-visibility`,
 * ver las utilidades `flip-*` en `src/index.css`) — no una animación de
 * opacidad disfrazada de flip.
 */
export default function StudyCard({ card, isFlipped, onFlip }: StudyCardProps) {
  const { dict } = useLanguage();

  // Mismo disparador de racha que la versión anterior de esta tarjeta: se
  // dispara al abrir una tarjeta nueva para estudiar, nunca al voltearla de
  // vuelta (por eso depende solo de `card.id`, no de `isFlipped`).
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
      className="flip-scene h-[400px] w-[600px] max-h-[70vh] max-w-[92vw] cursor-pointer rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/60"
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

/**
 * Fondo basalto (`bg-neutral-900`) + bordes sutiles grises + texto Serif
 * inmaculado (Playfair Display, vía `style` inline) — el "Silent Luxury" de
 * esta Misión. La cara trasera lleva un borde ámbar apenas perceptible
 * (`border-primary/25`) para que el giro se sienta como una revelación, no
 * como un duplicado plano.
 */
function CardFace({ card, side }: CardFaceProps) {
  const { dict } = useLanguage();
  const isBack = side === "back";

  return (
    <div
      className={[
        "flip-card-face flex flex-col items-center justify-center gap-6 rounded-2xl border bg-neutral-900 px-10 py-10 text-center shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)]",
        isBack ? "flip-card-face-back border-primary/25" : "border-neutral-700/60",
      ].join(" ")}
    >
      {card.tag && (
        <span className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-primary uppercase">
          {card.tag}
        </span>
      )}

      {!isBack && card.imageId && <CardImage imageId={card.imageId} />}

      <div
        className={[
          "max-w-md text-2xl leading-relaxed",
          isBack ? "text-primary" : "text-neutral-100",
        ].join(" ")}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        <RichTextRenderer content={isBack ? card.back : card.front} />
      </div>

      {!isBack && (
        <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">
          {dict.studyCard.tapToFlip}
        </span>
      )}
    </div>
  );
}

/**
 * Recupera de forma asíncrona la imagen desde IndexedDB (ver
 * `src/utils/mediaStore.ts`) como Object URL. Revoca la URL al desmontar o
 * cambiar de tarjeta para no acumular memoria.
 */
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
        /* imagen no encontrada o IndexedDB no disponible — se omite en silencio */
      });

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt=""
      className="max-h-28 w-full rounded-md object-contain"
    />
  );
}
