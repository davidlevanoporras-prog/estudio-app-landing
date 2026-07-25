import { useMemo, useState } from "react";
import {
  ChevronRight,
  CircleHelp,
  FolderPlus,
  Layers,
  Folder as FolderIcon,
  Plus,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useLibraryStore } from "../store/libraryStore";
import { useSimulatorStore } from "../store/simulatorStore";
import type { ClozeCard, SimulationDeck } from "../types/simulator";
import {
  clozeAnswersFromCard,
  clozeSegmentsFromCard,
  parseClozeSyntax,
} from "../utils/parseClozeSyntax";
import { useConfirm } from "../components/ConfirmProvider";

type Selection =
  | { kind: "folder"; id: string }
  | { kind: "deck"; id: string }
  | null;

/**
 * Gestor de biblioteca del Simulador — split view:
 * árbol de carpetas/mazos (izq.) + editor CRUD de cloze (der.).
 */
export default function SimulatorManager() {
  const { dict } = useLanguage();
  const confirm = useConfirm();
  const folders = useLibraryStore((s) => s.folders);
  const decks = useLibraryStore((s) => s.decks);
  const createFolder = useLibraryStore((s) => s.createFolder);
  const createDeck = useLibraryStore((s) => s.createDeck);
  const updateDeck = useLibraryStore((s) => s.updateDeck);
  const deleteDeck = useLibraryStore((s) => s.deleteDeck);
  const deleteFolder = useLibraryStore((s) => s.deleteFolder);
  const moveDeck = useLibraryStore((s) => s.moveDeck);
  const addCard = useLibraryStore((s) => s.addCard);
  const updateCard = useLibraryStore((s) => s.updateCard);
  const deleteCard = useLibraryStore((s) => s.deleteCard);
  const startSession = useSimulatorStore((s) => s.startSession);

  const [selection, setSelection] = useState<Selection>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(folders.map((f) => f.id)),
  );

  const rootFolders = useMemo(
    () => folders.filter((f) => f.parentId === null),
    [folders],
  );
  const orphanDecks = useMemo(
    () => decks.filter((d) => d.folderId === null),
    [decks],
  );

  const selectedDeck: SimulationDeck | undefined =
    selection?.kind === "deck"
      ? decks.find((d) => d.id === selection.id)
      : undefined;

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    const id = createFolder(dict.simulator.defaultFolderName);
    setExpandedFolders((prev) => new Set(prev).add(id));
    setSelection({ kind: "folder", id });
  };

  const handleCreateDeck = (folderId: string | null) => {
    const id = createDeck(dict.simulator.defaultDeckName, folderId);
    setSelection({ kind: "deck", id });
  };

  const handleTrain = (deck: SimulationDeck) => {
    if (deck.cards.length === 0) return;
    startSession(deck.cards, { deckId: deck.id, deckTitle: deck.title });
  };

  return (
    <div className="glow-card flex min-h-[32rem] flex-1 overflow-hidden border-card-rest bg-card/90 backdrop-blur-xl">
      {/* Árbol izquierdo */}
      <aside className="flex w-full max-w-[16rem] shrink-0 flex-col border-r border-card-rest md:max-w-[18rem]">
        <div className="flex items-center justify-between gap-2 border-b border-card-rest px-3 py-3">
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {dict.simulator.library}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={dict.simulator.newFolder}
              onClick={handleCreateFolder}
              className="premium-btn flex h-7 w-7 items-center justify-center rounded-md text-icon-muted transition-colors hover:bg-background/60 hover:text-primary"
            >
              <FolderPlus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              title={dict.simulator.newDeckRoot}
              onClick={() => handleCreateDeck(null)}
              className="premium-btn flex h-7 w-7 items-center justify-center rounded-md text-icon-muted transition-colors hover:bg-background/60 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {rootFolders.map((folder) => {
            const open = expandedFolders.has(folder.id);
            const childDecks = decks.filter((d) => d.folderId === folder.id);
            const isSelected =
              selection?.kind === "folder" && selection.id === folder.id;

            return (
              <div key={folder.id}>
                <div
                  className={[
                    "group flex items-center gap-1 rounded-lg px-1.5 py-1",
                    isSelected ? "bg-primary-soft" : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className="flex h-6 w-6 items-center justify-center text-icon-muted"
                    aria-expanded={open}
                  >
                    <ChevronRight
                      className={[
                        "h-3.5 w-3.5 transition-transform duration-200",
                        open ? "rotate-90" : "",
                      ].join(" ")}
                      strokeWidth={2}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelection({ kind: "folder", id: folder.id })}
                    className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-sm text-foreground"
                  >
                    <FolderIcon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  <button
                    type="button"
                    title={dict.simulator.newDeckInFolder}
                    onClick={() => handleCreateDeck(folder.id)}
                    className="invisible flex h-6 w-6 items-center justify-center rounded text-icon-muted group-hover:visible hover:text-primary"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>

                {open && (
                  <div className="ml-4 space-y-0.5 border-l border-card-rest pl-2">
                    {childDecks.map((deck) => (
                      <DeckRow
                        key={deck.id}
                        deck={deck}
                        selected={
                          selection?.kind === "deck" && selection.id === deck.id
                        }
                        onSelect={() =>
                          setSelection({ kind: "deck", id: deck.id })
                        }
                      />
                    ))}
                    {childDecks.length === 0 && (
                      <p className="px-2 py-1 text-[11px] text-muted-foreground">
                        {dict.simulator.emptyDecks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {orphanDecks.length > 0 && (
            <div className="pt-2">
              <p className="px-2 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
                {dict.simulator.noFolder}
              </p>
              {orphanDecks.map((deck) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  selected={
                    selection?.kind === "deck" && selection.id === deck.id
                  }
                  onSelect={() => setSelection({ kind: "deck", id: deck.id })}
                />
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Editor derecho */}
      <section className="flex min-w-0 flex-1 flex-col">
        {selectedDeck ? (
          <DeckEditor
            deck={selectedDeck}
            folders={folders}
            onTitleChange={(title) => updateDeck(selectedDeck.id, { title })}
            onMove={(folderId) => moveDeck(selectedDeck.id, folderId)}
            onDelete={() => {
              void (async () => {
                const ok = await confirm();
                if (!ok) return;
                deleteDeck(selectedDeck.id);
                setSelection(null);
              })();
            }}
            onAddCard={(card) => addCard(selectedDeck.id, card)}
            onUpdateCard={(cardId, patch) =>
              updateCard(selectedDeck.id, cardId, patch)
            }
            onDeleteCard={(cardId) => {
              void (async () => {
                const ok = await confirm();
                if (!ok) return;
                deleteCard(selectedDeck.id, cardId);
              })();
            }}
            onTrain={() => handleTrain(selectedDeck)}
          />
        ) : selection?.kind === "folder" ? (
          <FolderPane
            folderId={selection.id}
            onDelete={() => {
              void (async () => {
                const ok = await confirm();
                if (!ok) return;
                deleteFolder(selection.id);
                setSelection(null);
              })();
            }}
            onCreateDeck={() => handleCreateDeck(selection.id)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <Layers className="h-8 w-8 text-icon-muted" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              {dict.simulator.selectDeckHint}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DeckRow({
  deck,
  selected,
  onSelect,
}: {
  deck: SimulationDeck;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        selected
          ? "bg-primary-soft text-primary"
          : "text-secondary-foreground hover:bg-background/60 hover:text-foreground",
      ].join(" ")}
    >
      <Layers className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span className="min-w-0 flex-1 truncate">{deck.title}</span>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {deck.cards.length}
      </span>
    </button>
  );
}

function FolderPane({
  folderId,
  onDelete,
  onCreateDeck,
}: {
  folderId: string;
  onDelete: () => void;
  onCreateDeck: () => void;
}) {
  const { dict } = useLanguage();
  const folder = useLibraryStore((s) =>
    s.folders.find((f) => f.id === folderId),
  );
  const updateFolder = useLibraryStore((s) => s.updateFolder);

  if (!folder) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <input
        value={folder.name}
        onChange={(e) => updateFolder(folder.id, { name: e.target.value })}
        className="w-full rounded-lg border border-card-rest bg-background/40 px-3 py-2 text-lg font-semibold text-foreground outline-none focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCreateDeck}
          className="premium-btn flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-xs font-medium text-primary uppercase"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.simulator.deckShort}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="premium-btn flex items-center gap-2 rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-medium text-rose-300/90 uppercase"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.simulator.deleteFolder}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        {dict.simulator.folderHelp}
      </p>
    </div>
  );
}

function DeckEditor({
  deck,
  folders,
  onTitleChange,
  onMove,
  onDelete,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onTrain,
}: {
  deck: SimulationDeck;
  folders: { id: string; name: string }[];
  onTitleChange: (title: string) => void;
  onMove: (folderId: string | null) => void;
  onDelete: () => void;
  onAddCard: (card: Partial<ClozeCard>) => void;
  onUpdateCard: (cardId: string, patch: Partial<Omit<ClozeCard, "id">>) => void;
  onDeleteCard: (cardId: string) => void;
  onTrain: () => void;
}) {
  const { dict, t } = useLanguage();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-card-rest px-5 py-4">
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={deck.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-lg font-semibold text-foreground outline-none hover:border-card-rest focus:border-primary"
          />
          <select
            value={deck.folderId ?? ""}
            onChange={(e) =>
              onMove(e.target.value === "" ? null : e.target.value)
            }
            className="rounded-md border border-card-rest bg-background/50 px-2 py-1 text-xs text-muted-foreground outline-none focus:border-primary"
          >
            <option value="">{dict.simulator.noFolder}</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTrain}
            disabled={deck.cards.length === 0}
            className="premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-3 py-2 text-xs font-medium tracking-wide text-primary-foreground uppercase disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.simulator.train}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="premium-btn flex items-center gap-2 rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-medium text-rose-300/90 uppercase"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.simulator.delete}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <ManualClozeForm onSave={onAddCard} />

        {deck.cards.map((card, index) => (
          <article
            key={card.id}
            className="rounded-xl border border-card-rest bg-background/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {t(dict.simulator.cardLabel, { n: index + 1 })}
              </p>
              <button
                type="button"
                onClick={() => onDeleteCard(card.id)}
                className="text-xs text-muted-foreground hover:text-rose-300"
              >
                {dict.simulator.remove}
              </button>
            </div>
            <p
              className="text-sm leading-relaxed text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {clozeSegmentsFromCard(card).map((segment, segmentIndex) =>
                segment.kind === "text" ? (
                  <span key={`t-${segmentIndex}`}>{segment.value}</span>
                ) : (
                  <span
                    key={`b-${segment.index}`}
                    className="mx-1 inline-flex min-w-[4.5rem] items-center justify-center rounded-md border border-primary/40 bg-primary-soft px-2 py-0.5 text-primary"
                  >
                    {segment.answer}
                  </span>
                ),
              )}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {t(dict.simulator.distractorsLabel, {
                list: card.distractors.join(" · ") || "—",
              })}
            </p>
            <div className="mt-3 grid gap-2 border-t border-card-rest pt-3">
              <label className="block text-xs text-muted-foreground">
                {dict.simulator.editAnswer}
                <input
                  value={clozeAnswersFromCard(card).join(" · ")}
                  onChange={(e) => {
                    const nextAnswers = e.target.value
                      .split("·")
                      .map((part) => part.trim())
                      .filter(Boolean);
                    if (nextAnswers.length === 0) return;
                    const segments = clozeSegmentsFromCard(card).map(
                      (segment) => {
                        if (segment.kind !== "blank") return segment;
                        const next =
                          nextAnswers[segment.index] ?? segment.answer;
                        return { ...segment, answer: next };
                      },
                    );
                    onUpdateCard(card.id, {
                      answer: nextAnswers[0],
                      answers: nextAnswers,
                      segments,
                      textBefore: card.textBefore,
                      textAfter: card.textAfter,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-card-rest bg-background/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {dict.simulator.distractorsComma}
                <input
                  value={card.distractors.join(", ")}
                  onChange={(e) =>
                    onUpdateCard(card.id, {
                      distractors: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-card-rest bg-background/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * Formulario de creación rápida: frase con `[[respuesta]]` + 3 distractores + preview.
 */
function ManualClozeForm({
  onSave,
}: {
  onSave: (card: Partial<ClozeCard>) => void;
}) {
  const { dict, t } = useLanguage();
  const [sentence, setSentence] = useState("");
  const [distractors, setDistractors] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [syntaxError, setSyntaxError] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const parsed = useMemo(() => parseClozeSyntax(sentence), [sentence]);
  const filledDistractors = distractors.map((d) => d.trim()).filter(Boolean);
  const canAttemptSave =
    sentence.trim().length > 0 && filledDistractors.length >= 1;

  const handleSave = () => {
    if (!parsed) {
      setSyntaxError(true);
      return;
    }
    setSyntaxError(false);
    onSave({
      textBefore: parsed.textBefore,
      answer: parsed.answer,
      textAfter: parsed.textAfter,
      segments: parsed.segments,
      answers: parsed.answers,
      distractors: filledDistractors,
    });
    setSentence("");
    setDistractors(["", "", ""]);
  };

  return (
    <div className="rounded-xl border border-card-rest bg-card/80 p-4 shadow-glow-card backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {dict.simulator.newManualCard}
        </p>
        <button
          type="button"
          onClick={() => setIsHelpOpen((open) => !open)}
          aria-expanded={isHelpOpen}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-neutral-500 transition-colors duration-300 hover:text-foreground"
        >
          <CircleHelp className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.simulator.syntaxHelp}
        </button>
      </div>

      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-out",
          isHelpOpen
            ? "mt-3 max-h-56 opacity-100"
            : "mt-0 max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="rounded-xl border border-card-rest bg-card p-3.5 shadow-glow-card backdrop-blur-xl">
          <p className="text-[11px] font-semibold tracking-wide text-foreground">
            {dict.simulator.helpTitle}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {dict.simulator.helpBody}
          </p>
          <code className="mt-2.5 block rounded-lg border border-card-rest bg-background/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-secondary-foreground">
            {dict.simulator.helpExample}
          </code>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/90">
            {dict.simulator.helpDistractors}
          </p>
        </div>
      </div>

      <textarea
        value={sentence}
        onChange={(e) => {
          setSentence(e.target.value);
          if (syntaxError) setSyntaxError(false);
        }}
        rows={4}
        placeholder={dict.simulator.sentencePlaceholder}
        aria-invalid={syntaxError}
        className={[
          "mt-3 w-full resize-y rounded-xl border bg-background/60 px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70",
          syntaxError
            ? "border-rose-400/50 focus:border-rose-400/70 focus:shadow-[0_0_0_1px_rgba(251,113,133,0.35)]"
            : "border-card-rest focus:border-primary/50 focus:shadow-[0_0_0_1px_rgba(212,165,116,0.25)]",
        ].join(" ")}
      />

      {syntaxError && (
        <p
          role="alert"
          className="mt-2 text-xs font-medium text-rose-300/90"
        >
          {dict.simulator.syntaxError}
        </p>
      )}

      <div className="mt-3 rounded-xl border border-dashed border-card-rest bg-background/40 px-4 py-4">
        <p className="mb-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {dict.simulator.preview}
        </p>
        {parsed ? (
          <p
            className="text-center text-base leading-relaxed text-foreground md:text-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {parsed.segments.map((segment, segmentIndex) =>
              segment.kind === "text" ? (
                <span key={`pt-${segmentIndex}`}>{segment.value}</span>
              ) : (
                <span
                  key={`pb-${segment.index}`}
                  className="mx-1 inline-flex min-w-[5.5rem] items-center justify-center rounded-lg border border-dashed border-card-rest bg-background/50 px-3 py-1 align-baseline text-muted-foreground"
                >
                  _____
                </span>
              ),
            )}
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {dict.simulator.previewEmpty}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {dict.simulator.distractors}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {distractors.map((value, index) => (
            <input
              key={index}
              value={value}
              onChange={(e) => {
                const next: [string, string, string] = [...distractors];
                next[index] = e.target.value;
                setDistractors(next);
              }}
              placeholder={t(dict.simulator.falseOption, { n: index + 1 })}
              className="rounded-lg border border-card-rest bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/45 hover:border-card-rest"
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canAttemptSave}
        onClick={handleSave}
        className="premium-btn mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card disabled:pointer-events-none disabled:opacity-35"
      >
        <Save className="h-4 w-4" strokeWidth={2} />
        {dict.simulator.saveCard}
      </button>
    </div>
  );
}
