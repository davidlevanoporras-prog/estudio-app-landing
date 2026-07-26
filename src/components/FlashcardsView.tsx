import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Check,
  FileUp,
  FolderX,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  SearchX,
  Share2,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { exportDeckToEadeck } from "../lib/eadeckExport";
import { matchesLibrarySearch } from "../lib/librarySearch";
import type { Deck } from "../types/deck";
import ConfirmDialog from "./ConfirmDialog";
import EmptyStatePanel from "./EmptyStatePanel";
import FloatingSearchBar, {
  searchShortcutLabel,
} from "./FloatingSearchBar";
import ImportCardsModal from "./ImportCardsModal";
import { PortalMenu } from "./PortalMenu";
import ViewHeaderCard from "./ViewHeaderCard";
import ViewShell from "./ViewShell";

function deckMatchesQuery(deck: Deck, query: string): boolean {
  const tags = [
    ...new Set(
      deck.cards
        .map((card) => card.tag)
        .filter((tag): tag is string => Boolean(tag && tag.trim())),
    ),
  ];
  return matchesLibrarySearch(query, [
    deck.name,
    ...tags,
    ...tags.map((tag) => `#${tag}`),
    String(deck.cards.length),
    `${deck.cards.length} cards`,
    `${deck.cards.length} tarjetas`,
  ]);
}

type FlashcardsViewProps = {
  decks: Deck[];
  onCreateDeck: () => string;
  onImportDecks: (decks: Deck[]) => void;
  onRenameDeck: (id: string, name: string) => void;
  onOpenDeck: (id: string) => void;
  onEditDeck: (id: string) => void;
  onDeleteDecks: (ids: string[]) => void;
};

/**
 * Vista raíz de Flashcards — estantería "Mis Mazos".
 * Silent Luxury utilitario: oscuro, bordes tenues, sin paletas de ambiente.
 */
export default function FlashcardsView({
  decks,
  onCreateDeck,
  onImportDecks,
  onRenameDeck,
  onOpenDeck,
  onEditDeck,
  onDeleteDecks,
}: FlashcardsViewProps) {
  const { dict, t } = useLanguage();
  const [renamingDeckId, setRenamingDeckId] = useState<string | null>(null);
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const filteredDecks = useMemo(
    () => decks.filter((deck) => deckMatchesQuery(deck, searchQuery)),
    [decks, searchQuery],
  );
  const hasActiveSearch = searchQuery.trim().length > 0;

  const showToast = (tone: "success" | "error", message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ tone, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleCreateDeck = () => {
    const newDeckId = onCreateDeck();
    setRenamingDeckId(newDeckId);
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleImportDeck = (deck: Deck) => {
    onImportDecks([deck]);
    showToast("success", dict.flashcards.importAnkiSuccess);
  };

  const handleToggleSelectionMode = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      return;
    }
    setIsSelectionMode((current) => !current);
  };

  const handleToggleSelected = (deckId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(deckId)) next.delete(deckId);
      else next.add(deckId);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setPendingDelete(Array.from(selectedIds));
  };

  const handleDeleteSingle = (deck: Deck) => {
    setPendingDelete([deck.id]);
  };

  const confirmPendingDelete = () => {
    if (!pendingDelete) return;
    onDeleteDecks(pendingDelete);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setPendingDelete(null);
  };

  const selectionButtonLabel =
    selectedIds.size > 0
      ? dict.flashcards.cancelSelection
      : dict.flashcards.selectMode;

  return (
    <ViewShell
      header={
        <ViewHeaderCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {dict.flashcards.heading}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {isSelectionMode && selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 rounded-lg border border-rose-400/30 px-3 py-2 text-sm font-medium text-rose-500 transition-colors duration-300 hover:border-rose-400/50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                    {t(dict.flashcards.deleteSelectedButton, {
                      count: selectedIds.size,
                    })}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleSelectionMode}
                  className="rounded-lg border border-card-rest bg-transparent px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-300 hover:border-primary hover:text-foreground"
                >
                  {selectionButtonLabel}
                </button>

                <button
                  type="button"
                  onClick={handleOpenImportModal}
                  className="premium-btn flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2 text-sm font-medium tracking-wide text-foreground transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
                >
                  <FileUp className="h-4 w-4" strokeWidth={2} />
                  {dict.flashcards.importAnki}
                </button>

                <button
                  type="button"
                  onClick={handleCreateDeck}
                  className="flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2 text-sm font-medium tracking-wide text-foreground uppercase transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  {dict.flashcards.createDeck}
                </button>
              </div>
            </div>

            {decks.length > 0 && (
              <FloatingSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={dict.librarySearch.placeholder}
                label={dict.librarySearch.label}
                shortcutLabel={searchShortcutLabel()}
              />
            )}
          </div>
        </ViewHeaderCard>
      }
      bodyClassName="pb-4"
    >
      {decks.length === 0 ? (
        <EmptyStatePanel
          className="py-28"
          icon={<FolderX className="h-6 w-6" strokeWidth={1.5} />}
          description={dict.emptyStates.noDecks}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleOpenImportModal}
                className="premium-btn flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2.5 text-sm font-medium tracking-wide text-foreground transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
              >
                <FileUp className="h-4 w-4" strokeWidth={2} />
                {dict.flashcards.importAnki}
              </button>
              <button
                type="button"
                onClick={handleCreateDeck}
                className="flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2.5 text-sm font-medium tracking-wide text-foreground uppercase transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                {dict.emptyStates.createFirstDeck}
              </button>
            </div>
          }
        />
      ) : hasActiveSearch && filteredDecks.length === 0 ? (
        <EmptyStatePanel
          className="py-20"
          icon={<SearchX className="h-6 w-6" strokeWidth={1.5} />}
          description={t(dict.librarySearch.noResults, {
            query: searchQuery.trim(),
          })}
          action={
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-lg border border-card-rest px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {dict.librarySearch.clearFilter}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              isRenaming={renamingDeckId === deck.id}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(deck.id)}
              isMenuOpen={openMenuDeckId === deck.id}
              onOpen={() => onOpenDeck(deck.id)}
              onToggleSelected={() => handleToggleSelected(deck.id)}
              onStartRenaming={() => setRenamingDeckId(deck.id)}
              onFinishRenaming={() => setRenamingDeckId(null)}
              onRename={(name) => onRenameDeck(deck.id, name)}
              onToggleMenu={() =>
                setOpenMenuDeckId((current) =>
                  current === deck.id ? null : deck.id,
                )
              }
              onCloseMenu={() => setOpenMenuDeckId(null)}
              onEdit={() => onEditDeck(deck.id)}
              onDelete={() => handleDeleteSingle(deck)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={dict.common.confirmTitle}
          message={dict.common.confirmPermanentMessage}
          confirmLabel={dict.common.deleteAction}
          cancelLabel={dict.common.cancelLabel}
          destructive
          onConfirm={confirmPendingDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {showImportModal && (
        <ImportCardsModal
          defaultDeckName={dict.flashcards.newDeckName}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportDeck}
        />
      )}

      {toast && (
        <div
          className={[
            "fixed bottom-8 left-1/2 z-[95] max-w-md -translate-x-1/2 rounded-lg border px-4 py-3 text-sm font-medium shadow-2xl",
            toast.tone === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
              : "border-rose-500/40 bg-rose-950/90 text-rose-100",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </ViewShell>
  );
}

type DeckCardProps = {
  deck: Deck;
  isRenaming: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  isMenuOpen: boolean;
  onOpen: () => void;
  onToggleSelected: () => void;
  onStartRenaming: () => void;
  onFinishRenaming: () => void;
  onRename: (name: string) => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function DeckCard({
  deck,
  isRenaming,
  isSelectionMode,
  isSelected,
  isMenuOpen,
  onOpen,
  onToggleSelected,
  onStartRenaming,
  onFinishRenaming,
  onRename,
  onToggleMenu,
  onCloseMenu,
  onEdit,
  onDelete,
}: DeckCardProps) {
  const { dict, t } = useLanguage();
  const [draftName, setDraftName] = useState(deck.name);

  useEffect(() => {
    setDraftName(deck.name);
  }, [deck.name]);

  const commitRename = () => {
    onRename(draftName.trim() || deck.name);
    onFinishRenaming();
  };

  return (
    <article
      onClick={() => {
        if (isRenaming) return;
        if (isSelectionMode) {
          onToggleSelected();
          return;
        }
        onOpen();
      }}
      className={[
        "photo-glass-panel group relative flex cursor-pointer items-center gap-3 rounded-xl border border-card-rest bg-card p-5 transition-all duration-300",
        "hover:border-primary hover:shadow-glow-card",
        isSelected ? "border-primary bg-primary-soft shadow-glow-sm" : "",
        isMenuOpen ? "z-[40]" : "z-0",
      ].join(" ")}
    >
      {isSelectionMode ? (
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
            isSelected
              ? "border-primary bg-primary-soft text-primary"
              : "border-card-rest text-icon-muted",
          ].join(" ")}
        >
          {isSelected ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Layers className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-background/50 text-icon-muted transition-colors duration-300 group-hover:text-foreground">
          <Layers className="h-5 w-5" strokeWidth={2} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <input
            autoFocus
            value={draftName}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") {
                setDraftName(deck.name);
                onFinishRenaming();
              }
            }}
            className="w-full min-w-0 rounded-md border border-card-rest bg-background/60 px-2 py-1 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
        ) : (
          <h3
            onClick={(event) => {
              if (isSelectionMode) return;
              event.stopPropagation();
              onStartRenaming();
            }}
            title={dict.flashcards.editHint}
            className="truncate text-base font-semibold text-foreground transition-colors duration-300 hover:text-primary"
          >
            {deck.name}
          </h3>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {deck.cards.length === 1
            ? dict.flashcards.cardCountOne
            : t(dict.flashcards.cardCountMany, { count: deck.cards.length })}
        </p>
      </div>

      {!isSelectionMode && (
        <DeckMenu
          isOpen={isMenuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
          onEdit={(event) => {
            event.stopPropagation();
            onCloseMenu();
            onEdit();
          }}
          onShare={(event) => {
            event.stopPropagation();
            onCloseMenu();
            void exportDeckToEadeck(deck);
          }}
          onDelete={(event) => {
            event.stopPropagation();
            onCloseMenu();
            onDelete();
          }}
        />
      )}
    </article>
  );
}

type DeckMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onShare: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

function DeckMenu({
  isOpen,
  onToggle,
  onClose,
  onEdit,
  onShare,
  onDelete,
}: DeckMenuProps) {
  const { dict } = useLanguage();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={dict.flashcards.deckMenuLabel}
        className="flex h-8 w-8 items-center justify-center rounded-md text-icon-muted transition-colors duration-300 hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>

      <PortalMenu
        open={isOpen}
        anchorRef={buttonRef}
        onClose={onClose}
        className="w-44"
      >
        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(event);
          }}
          className="ui-floating-item flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.flashcards.editAction}
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            event.stopPropagation();
            onShare(event);
          }}
          className="ui-floating-item flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.flashcards.shareAction}
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(event);
          }}
          className="ui-floating-item-danger flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.flashcards.deleteAction}
        </button>
      </PortalMenu>
    </div>
  );
}
