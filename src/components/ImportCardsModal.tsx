import { useEffect, useId, useRef, useState } from "react";
import { CircleHelp, FileUp, Loader2, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  buildDeckFromPlainText,
  buildDeckFromTextFile,
} from "../lib/plainTextDeckImport";
import type { Deck } from "../types/deck";

type ImportCardsModalProps = {
  onClose: () => void;
  onImport: (deck: Deck) => void;
  defaultDeckName: string;
};

/**
 * Modal Beta: pegar texto o subir .txt/.csv/.tsv — sin WASM ni .apkg.
 */
export default function ImportCardsModal({
  onClose,
  onImport,
  defaultDeckName,
}: ImportCardsModalProps) {
  const { dict } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const helpPanelId = useId();
  const [deckName, setDeckName] = useState(defaultDeckName);
  const [pasteText, setPasteText] = useState("");
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!helpOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!helpRef.current?.contains(event.target as Node)) {
        setHelpOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelpOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [helpOpen]);

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] ?? null;
    setPendingFile(file);
    setFileLabel(file?.name ?? null);
    setError(null);
    if (file && !deckName.trim()) {
      setDeckName(file.name.replace(/\.(txt|csv|tsv)$/i, "").trim());
    }
  };

  const handleImport = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setError(null);

    try {
      const name = deckName.trim() || defaultDeckName;
      // Pegado tiene prioridad si hay texto; si no, el archivo .txt/.csv.
      const result =
        pasteText.trim().length > 0
          ? buildDeckFromPlainText(pasteText, name)
          : pendingFile
            ? await buildDeckFromTextFile(pendingFile, name)
            : {
                ok: false as const,
                reason: "empty" as const,
                message: dict.flashcards.importAnkiEmpty,
              };

      if (!result.ok) {
        setError(
          result.message ||
            dict.flashcards.importAnkiEmpty ||
            dict.flashcards.importAnkiError,
        );
        return;
      }

      onImport(result.deck);
      onClose();
    } catch (err) {
      console.error("[ImportCardsModal]", err);
      setError(dict.flashcards.importAnkiError);
    } finally {
      setIsBusy(false);
    }
  };

  const canSubmit =
    !isBusy &&
    (pendingFile !== null || pasteText.trim().length > 0) &&
    deckName.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-cards-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="glow-card photo-glass-panel relative w-full max-w-lg border border-card-rest bg-card/90 p-6 shadow-2xl backdrop-blur-md sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={dict.common.cancelLabel}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Beta
        </p>
        <h2
          id="import-cards-title"
          className="mt-1 text-xl font-semibold tracking-tight text-foreground"
        >
          {dict.flashcards.importModalTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {dict.flashcards.importModalSubtitle}
        </p>

        <label className="mt-5 block">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {dict.flashcards.importDeckNameLabel}
          </span>
          <input
            type="text"
            value={deckName}
            onChange={(event) => setDeckName(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-card-rest bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            placeholder={defaultDeckName}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {dict.flashcards.importPasteLabel}
          </span>
          <textarea
            value={pasteText}
            onChange={(event) => {
              setPasteText(event.target.value);
              setError(null);
            }}
            rows={7}
            spellCheck={false}
            placeholder={dict.flashcards.importPastePlaceholder}
            className="ui-scrollbar mt-1.5 w-full resize-y rounded-lg border border-card-rest bg-background/50 px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {dict.flashcards.importFileLabel}
            </span>

            <div
              ref={helpRef}
              className="relative"
              onMouseEnter={() => setHelpOpen(true)}
              onMouseLeave={() => setHelpOpen(false)}
            >
              <button
                type="button"
                aria-expanded={helpOpen}
                aria-controls={helpPanelId}
                onClick={() => setHelpOpen((current) => !current)}
                className="inline-flex items-center gap-1.5 text-left text-[11px] font-medium tracking-wide text-primary/80 underline-offset-2 transition-colors hover:text-primary hover:underline"
              >
                <CircleHelp className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {dict.flashcards.importAnkiHelpLink}
              </button>

              {helpOpen && (
                <div
                  id={helpPanelId}
                  role="note"
                  className="photo-glass-panel absolute right-0 bottom-full z-20 mb-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-card-rest bg-card/95 p-4 shadow-2xl backdrop-blur-md"
                >
                  <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    {dict.flashcards.importAnkiHelpTitle}
                  </p>
                  <ol className="mt-3 flex flex-col gap-3">
                    <li className="flex gap-2.5 text-left">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary-soft text-[10px] font-semibold text-primary">
                        1
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {dict.flashcards.importAnkiHelpStep1Label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {dict.flashcards.importAnkiHelpStep1Body}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2.5 text-left">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary-soft text-[10px] font-semibold text-primary">
                        2
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {dict.flashcards.importAnkiHelpStep2Label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {dict.flashcards.importAnkiHelpStep2Body}
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.tsv,text/plain,text/csv"
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="premium-btn mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-card-rest bg-background/40 px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <FileUp className="h-4 w-4" strokeWidth={2} />
            {fileLabel ?? dict.flashcards.importFileButton}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-card-rest px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {dict.common.cancelLabel}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleImport()}
            className="premium-btn inline-flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:border-primary hover:shadow-glow-card disabled:pointer-events-none disabled:opacity-40"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : null}
            {dict.flashcards.importConfirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
