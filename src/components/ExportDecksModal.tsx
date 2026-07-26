import { useEffect, useMemo, useState } from "react";
import { Check, Package, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { exportDecksToEasim } from "../lib/easimExport";
import type { Folder, SimulationDeck } from "../types/simulator";

type ExportDecksModalProps = {
  open: boolean;
  onClose: () => void;
  decks: SimulationDeck[];
  folders: Folder[];
  /** Prefiere estos IDs al abrir (p. ej. mazo activo en la biblioteca). */
  initiallySelectedIds?: string[];
};

/**
 * Modal «Empaquetar Mazos» — selección múltiple antes de escribir `.easim.json`.
 */
export default function ExportDecksModal({
  open,
  onClose,
  decks,
  folders,
  initiallySelectedIds,
}: ExportDecksModalProps) {
  const { dict, t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const folderNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const folder of folders) map.set(folder.id, folder.name);
    return map;
  }, [folders]);

  const sortedDecks = useMemo(
    () =>
      [...decks].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      ),
    [decks],
  );

  useEffect(() => {
    if (!open) return;
    const preferred = (initiallySelectedIds ?? []).filter((id) =>
      decks.some((d) => d.id === id),
    );
    setSelectedIds(
      new Set(preferred.length > 0 ? preferred : decks.map((d) => d.id)),
    );
    setFeedback(null);
    setIsExporting(false);
  }, [open, decks, initiallySelectedIds]);
  if (!open) return null;

  const allSelected =
    sortedDecks.length > 0 && selectedIds.size === sortedDecks.length;
  const selectedCount = selectedIds.size;

  const toggleDeck = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(sortedDecks.map((d) => d.id)));
  };

  const handleExport = async () => {
    const selected = sortedDecks.filter((d) => selectedIds.has(d.id));
    if (selected.length === 0) {
      setFeedback(dict.simulator.exportEmptySelection);
      return;
    }

    setIsExporting(true);
    setFeedback(null);
    try {
      const result = await exportDecksToEasim(selected, {
        defaultFileName:
          selected.length === 1
            ? selected[0]!.title
            : `mazos-excellence-${selected.length}`,
      });

      if (result.ok) {
        onClose();
        return;
      }
      if (result.reason === "cancelled") return;
      if (result.reason === "empty") {
        setFeedback(dict.simulator.exportEmptySelection);
        return;
      }
      setFeedback(result.message ?? dict.simulator.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-decks-title"
      onClick={onClose}
    >
      <div
        className="ui-floating flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-card-rest shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-card-rest px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary-soft text-primary shadow-glow-sm">
              <Package className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2
                id="export-decks-title"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {dict.simulator.exportModalTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.simulator.exportModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
            aria-label={dict.common.cancelLabel}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t(dict.simulator.exportSelectedCount, { count: selectedCount })}
          </p>
          <button
            type="button"
            onClick={toggleAll}
            disabled={sortedDecks.length === 0}
            className="text-xs font-semibold tracking-wide text-primary transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {allSelected
              ? dict.simulator.exportDeselectAll
              : dict.simulator.exportSelectAll}
          </button>
        </div>

        <div className="ui-scrollbar max-h-[min(50vh,22rem)] overflow-y-auto px-4 pb-2">
          {sortedDecks.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {dict.simulator.exportNoDecks}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {sortedDecks.map((deck) => {
                const checked = selectedIds.has(deck.id);
                const folderLabel =
                  deck.folderId != null
                    ? folderNameById.get(deck.folderId)
                    : null;

                return (
                  <li key={deck.id}>
                    <label
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                        checked
                          ? "border-primary/45 bg-primary-soft/70"
                          : "border-card-rest bg-background/40 hover:border-primary/25 hover:bg-background/70",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-card-rest bg-background text-transparent",
                        ].join(" ")}
                        aria-hidden
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleDeck(deck.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {deck.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {t(dict.simulator.exportDeckMeta, {
                            count: deck.cards.length,
                            folder: folderLabel ?? dict.simulator.noFolder,
                          })}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {feedback && (
          <p
            className="px-6 pt-2 text-xs text-muted-foreground"
            role="status"
          >
            {feedback}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-card-rest px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-lg border border-card-rest px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-background/70 disabled:opacity-50"
          >
            {dict.common.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting || selectedCount === 0}
            className="premium-btn rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-sm transition-all hover:shadow-glow-card disabled:opacity-50"
          >
            {isExporting
              ? dict.simulator.exportBusy
              : dict.simulator.exportConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
