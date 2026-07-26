import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Layers,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  isNativeFilePickerAvailable,
  pickImageFile,
} from "../lib/nativeFiles";
import { handleImagePaste } from "../lib/pasteImage";
import { deleteImage, getImage, saveImage } from "../utils/mediaStore";
import { createInitialSrsState } from "../utils/spacedRepetition";
import {
  collectCardImageIds,
  resolveQuestionImage,
  type Deck,
  type StudyCardData,
} from "../types/deck";
import ConfirmDialog from "./ConfirmDialog";
import { useConfirm } from "./ConfirmProvider";
import EmptyStatePanel from "./EmptyStatePanel";
import GlassPanel from "./GlassPanel";
import ViewHeaderCard from "./ViewHeaderCard";
import ViewShell from "./ViewShell";

let cardIdSequence = 0;
function createCardId(): number {
  cardIdSequence += 1;
  return Date.now() * 1000 + cardIdSequence;
}

type DeckEditorViewProps = {
  deck: Deck | undefined;
  onExit: () => void;
  onSave: (deckId: string, cards: StudyCardData[]) => void;
  /** Elimina el mazo entero del store y vuelve a la lista (Misión 2). */
  onDeleteDeck: (deckId: string) => void;
};

/**
 * Centro de Mando WYSIWYG: edición inductiva en línea (sin modales) de todas
 * las tarjetas de un mazo, con miniaturas de imagen respaldadas por
 * IndexedDB (`src/utils/mediaStore.ts`). Las imágenes se eligen con el
 * diálogo nativo de Tauri (`plugin-dialog`) cuando hay shell; en navegador
 * cae al `<input type="file">` de respaldo.
 */
export default function DeckEditorView({
  deck,
  onExit,
  onSave,
  onDeleteDeck,
}: DeckEditorViewProps) {
  const { dict, t } = useLanguage();
  const confirm = useConfirm();
  const [draftCards, setDraftCards] = useState<StudyCardData[]>(
    () => deck?.cards ?? [],
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteDeckConfirm, setShowDeleteDeckConfirm] = useState(false);

  useEffect(() => {
    setDraftCards(deck?.cards ?? []);
    setIsDirty(false);
  }, [deck?.id]);

  const handleExit = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: dict.common.confirmTitle,
        message: dict.deckEditor.exitUnsavedConfirm,
        confirmLabel: dict.common.confirmAction,
        destructive: false,
      });
      if (!ok) return;
    }
    onExit();
  };

  const handleSaveChanges = () => {
    if (!deck) return;
    onSave(deck.id, draftCards);
    setIsDirty(false);
  };

  const updateCard = (id: number, patch: Partial<StudyCardData>) => {
    setDraftCards((current) =>
      current.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    );
    setIsDirty(true);
  };

  const handleAddCard = () => {
    const newCard: StudyCardData = {
      id: createCardId(),
      front: "",
      hint: "",
      back: "",
      ...createInitialSrsState(),
    };
    setDraftCards((current) => [...current, newCard]);
    setIsDirty(true);
  };

  const handleDeleteCard = async (card: StudyCardData) => {
    const ok = await confirm();
    if (!ok) return;
    for (const id of collectCardImageIds(card)) {
      deleteImage(id).catch(() => {});
    }
    setDraftCards((current) => current.filter((c) => c.id !== card.id));
    setIsDirty(true);
  };

  const handleImageUpload = async (
    card: StudyCardData,
    slot: "imageQuestion" | "imageHint" | "imageAnswer",
    file: File,
  ) => {
    try {
      const newImageId = await saveImage(file);
      const previousImageId =
        slot === "imageQuestion"
          ? resolveQuestionImage(card)
          : card[slot];
      updateCard(card.id, {
        [slot]: newImageId,
        ...(slot === "imageQuestion" ? { imageId: undefined } : {}),
      });
      if (previousImageId && previousImageId !== newImageId) {
        deleteImage(previousImageId).catch(() => {});
      }
    } catch (error) {
      console.error("No se pudo guardar la imagen en la bóveda offline:", error);
    }
  };

  const handleImageRemove = (
    card: StudyCardData,
    slot: "imageQuestion" | "imageHint" | "imageAnswer",
  ) => {
    const previousImageId =
      slot === "imageQuestion" ? resolveQuestionImage(card) : card[slot];
    if (previousImageId) deleteImage(previousImageId).catch(() => {});
    updateCard(card.id, {
      [slot]: undefined,
      ...(slot === "imageQuestion" ? { imageId: undefined } : {}),
    });
  };

  const handleConfirmDeleteDeck = () => {
    if (!deck) return;
    for (const card of draftCards) {
      for (const id of collectCardImageIds(card)) {
        deleteImage(id).catch(() => {});
      }
    }
    onDeleteDeck(deck.id);
    setShowDeleteDeckConfirm(false);
  };

  return (
    <ViewShell
      header={
        <ViewHeaderCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleExit}
            className="premium-btn flex w-fit items-center gap-2 self-start rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-secondary-foreground transition-all duration-300 hover:border-primary hover:text-foreground hover:shadow-glow-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {dict.studyCard.backToDecks}
          </button>

          {deck && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {deck.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(dict.deckEditor.subtitle, { count: draftCards.length })}
                </p>
              </div>
              {isDirty && (
                <span
                  title={dict.deckEditor.unsavedIndicator}
                  aria-label={dict.deckEditor.unsavedIndicator}
                  className="flex h-2 w-2 shrink-0 rounded-full bg-primary shadow-glow-sm"
                />
              )}
              <button
                type="button"
                onClick={() => setShowDeleteDeckConfirm(true)}
                className="premium-btn flex items-center gap-2 rounded-lg border border-rose-500/25 px-3 py-2 text-xs font-medium tracking-wide text-rose-400/90 uppercase transition-all duration-300 hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                {dict.deckEditor.deleteDeckButton}
              </button>
            </div>
          )}
        </div>
        </ViewHeaderCard>
      }
      bodyClassName="space-y-4 pb-28"
    >
      {!deck ? (
        <DeckNotFoundState onExit={onExit} />
      ) : (
        <>
          {draftCards.map((card, index) => (
            <CardEditorRow
              key={card.id}
              card={card}
              index={index}
              onFieldChange={(patch) => updateCard(card.id, patch)}
              onImageUpload={(slot, file) =>
                handleImageUpload(card, slot, file)
              }
              onImageRemove={(slot) => handleImageRemove(card, slot)}
              onDelete={() => handleDeleteCard(card)}
            />
          ))}

          {draftCards.length === 0 && (
            <EmptyStatePanel
              icon={<Layers className="h-5 w-5" strokeWidth={1.75} />}
              description={dict.deckEditor.emptyDeckDescription}
            />
          )}

          <GlassPanel dashed>
            <button
              type="button"
              onClick={handleAddCard}
              className="premium-btn flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-primary"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              {dict.deckEditor.addCardButton}
            </button>
          </GlassPanel>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!isDirty}
            className="premium-btn fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full border border-primary/60 bg-primary px-5 py-3 text-sm font-medium tracking-wide text-primary-foreground uppercase shadow-glow-card transition-all duration-300 hover:border-primary disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {dict.deckEditor.saveChangesButton}
          </button>
        </>
      )}

      {showDeleteDeckConfirm && deck && (
        <ConfirmDialog
          title={dict.common.confirmTitle}
          message={dict.common.confirmPermanentMessage}
          confirmLabel={dict.common.deleteAction}
          cancelLabel={dict.common.cancelLabel}
          destructive
          onConfirm={handleConfirmDeleteDeck}
          onCancel={() => setShowDeleteDeckConfirm(false)}
        />
      )}
    </ViewShell>
  );
}

function DeckNotFoundState({ onExit }: { onExit: () => void }) {
  const { dict } = useLanguage();

  return (
    <EmptyStatePanel
      icon={<AlertCircle className="h-6 w-6" strokeWidth={1.75} />}
      title={dict.deckEditor.deckNotFoundTitle}
      description={dict.deckEditor.deckNotFoundDescription}
      action={
        <button
          type="button"
          onClick={onExit}
          className="premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          {dict.studyCard.backToDecks}
        </button>
      }
    />
  );
}

type ImageSlotKey = "imageQuestion" | "imageHint" | "imageAnswer";

type CardEditorRowProps = {
  card: StudyCardData;
  index: number;
  onFieldChange: (patch: Partial<StudyCardData>) => void;
  onImageUpload: (slot: ImageSlotKey, file: File) => void;
  onImageRemove: (slot: ImageSlotKey) => void;
  onDelete: () => void;
};

function CardEditorRow({
  card,
  index,
  onFieldChange,
  onImageUpload,
  onImageRemove,
  onDelete,
}: CardEditorRowProps) {
  const { dict, t } = useLanguage();

  return (
    <article className="glow-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {t(dict.deckEditor.cardNumberLabel, { number: index + 1 })}
        </span>
        <button
          type="button"
          onClick={onDelete}
          aria-label={dict.deckEditor.deleteCardLabel}
          title={dict.deckEditor.deleteCardLabel}
          className="premium-btn flex h-7 w-7 items-center justify-center rounded-md text-icon-muted transition-all duration-300 hover:text-rose-400 hover:shadow-[0_0_12px_rgba(244,63,94,0.25)]"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <EditableField
          label={dict.deckEditor.questionLabel}
          value={card.front}
          placeholder={dict.deckEditor.questionPlaceholder}
          onChange={(front) => onFieldChange({ front })}
          imageId={resolveQuestionImage(card)}
          onImageUpload={(file) => onImageUpload("imageQuestion", file)}
          onImageRemove={() => onImageRemove("imageQuestion")}
        />
        <EditableField
          label={dict.deckEditor.hintLabel}
          value={card.hint}
          placeholder={dict.deckEditor.hintPlaceholder}
          onChange={(hint) => onFieldChange({ hint })}
          rows={1}
          imageId={card.imageHint}
          onImageUpload={(file) => onImageUpload("imageHint", file)}
          onImageRemove={() => onImageRemove("imageHint")}
        />
        <EditableField
          label={dict.deckEditor.answerLabel}
          value={card.back}
          placeholder={dict.deckEditor.answerPlaceholder}
          onChange={(back) => onFieldChange({ back })}
          imageId={card.imageAnswer}
          onImageUpload={(file) => onImageUpload("imageAnswer", file)}
          onImageRemove={() => onImageRemove("imageAnswer")}
        />
      </div>
    </article>
  );
}

type EditableFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows?: number;
  imageId?: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
};

function EditableField({
  label,
  value,
  placeholder,
  onChange,
  rows = 2,
  imageId,
  onImageUpload,
  onImageRemove,
}: EditableFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </label>
        <ImageSlot
          compact
          imageId={imageId}
          onUpload={onImageUpload}
          onRemove={onImageRemove}
        />
      </div>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onPaste={(event) => {
          const item = Array.from(event.clipboardData?.items ?? []).find(
            (entry) => entry.type.startsWith("image/"),
          );
          const file = item?.getAsFile();
          if (file) {
            event.preventDefault();
            onImageUpload(file);
            return;
          }
          void handleImagePaste(event, (markdown) => {
            const el = event.currentTarget;
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            onChange(value.slice(0, start) + markdown + value.slice(end));
          });
        }}
        className="mt-1 w-full resize-none border-0 border-b border-card-rest bg-transparent px-0 py-1.5 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-primary"
      />
    </div>
  );
}

type ImageSlotProps = {
  imageId?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  /** Compacto: icono + miniatura inline junto al label del campo. */
  compact?: boolean;
};

/**
 * Miniatura o botón adjuntar. En Tauri: diálogo nativo; en web: `<input type="file">`.
 */
function ImageSlot({ imageId, onUpload, onRemove, compact = false }: ImageSlotProps) {
  const { dict } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPicking, setIsPicking] = useState(false);

  const openPicker = async () => {
    if (isPicking) return;

    if (isNativeFilePickerAvailable()) {
      setIsPicking(true);
      try {
        const file = await pickImageFile();
        if (file) onUpload(file);
      } finally {
        setIsPicking(false);
      }
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = "";
  };

  return (
    <div className="shrink-0">
      {imageId ? (
        <div
          className={[
            "group relative overflow-hidden rounded-lg border border-card-rest",
            compact ? "h-10 w-10" : "h-24 w-24",
          ].join(" ")}
        >
          <ImageThumbnail imageId={imageId} />

          <button
            type="button"
            onClick={() => void openPicker()}
            disabled={isPicking}
            aria-label={dict.deckEditor.changeImageButton}
            title={dict.deckEditor.changeImageButton}
            className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-all duration-200 group-hover:bg-black/50 group-hover:text-white disabled:pointer-events-none"
          >
            <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={onRemove}
            aria-label={dict.deckEditor.removeImageLabel}
            title={dict.deckEditor.removeImageLabel}
            className="absolute top-0.5 right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-card-rest bg-card text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-rose-500"
          >
            <X className="h-2.5 w-2.5" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void openPicker()}
          disabled={isPicking}
          aria-label={dict.deckEditor.addImageButton}
          title={dict.deckEditor.addImageButton}
          className={[
            "premium-btn inline-flex items-center justify-center rounded-md border border-card-rest text-icon-muted transition-all duration-300 hover:border-primary hover:text-primary disabled:opacity-50",
            compact ? "h-7 w-7" : "h-24 w-24 flex-col gap-1",
          ].join(" ")}
        >
          <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} />
          {!compact && (
            <span className="text-center text-[10px] font-medium leading-tight">
              {dict.deckEditor.addImageButton}
            </span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}

function ImageThumbnail({ imageId }: { imageId: string }) {
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

  if (!imageUrl) {
    return <div className="h-full w-full animate-pulse bg-primary-soft" />;
  }

  return <img src={imageUrl} alt="" className="h-full w-full object-cover" />;
}
