import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Check,
  FolderX,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Deck } from "../types/deck";
import ConfirmDialog from "./ConfirmDialog";
import { PortalMenu } from "./PortalMenu";

type FlashcardsViewProps = {
  decks: Deck[];
  onCreateDeck: () => string;
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

  const handleCreateDeck = () => {
    const newDeckId = onCreateDeck();
    setRenamingDeckId(newDeckId);
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
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
            onClick={handleCreateDeck}
            className="flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2 text-sm font-medium tracking-wide text-foreground uppercase transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {dict.flashcards.createDeck}
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="photo-glass-panel flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-card-rest bg-card/40 py-28 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
            <FolderX className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {dict.emptyStates.noDecks}
          </p>
          <button
            type="button"
            onClick={handleCreateDeck}
            className="flex items-center gap-2 rounded-lg border border-card-rest bg-card px-4 py-2.5 text-sm font-medium tracking-wide text-foreground uppercase transition-colors duration-300 hover:border-primary hover:shadow-glow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {dict.emptyStates.createFirstDeck}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
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
    </>
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
          className="ui-floating-item flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium opacity-70 transition-colors duration-200"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.flashcards.shareAction}
          <span className="ml-auto text-[10px] uppercase">
            {dict.flashcards.shareComingSoon}
          </span>
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
