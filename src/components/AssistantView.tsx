import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Lock, Send } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  getOrCreateActiveSession,
  persistSessionMessages,
  type AssistantChatMessage,
  type AssistantMode,
} from "../lib/assistantMemory";
import {
  listSourcePdfFiles,
  type SourceFileMeta,
} from "../lib/sourcesCatalog";
import { useUserStore } from "../store/userStore";
import ProUpgradeModal from "./ProUpgradeModal";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ExamType = "clinical" | "multiple" | "active";

type ExamQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Índice de la opción correcta (0-based). */
  correctIndex: number;
};

type AssistantViewProps = {
  mode: AssistantMode;
};

/**
 * "La Consola Clínica" — Quirófano de Consultas del Asistente Cognitivo.
 * Paleta fija de basalto (misma intuición que `LaboratoryView.tsx`): este
 * panel debe leer siempre como un entorno de examen de grado, no como un
 * chat comercial, sin importar el tema activo de la app.
 *
 * - Inquisidor → chat socrático con memoria oculta (`assistant_memory`).
 * - Catedrático → formulario de simulacro (no chat).
 */
const BASALT_BG = "#0b0d0f";
const INPUT_BG = "#171717";
const USER_BUBBLE = "#262626";
const PANEL_BG = "#12161c";
const MODE_DOT_INQUISITOR = "#b45309";
const MODE_DOT_PROFESSOR = "#a8a29e";

/** PDFs de demostración cuando Fuentes aún no tiene documentos — apunta conceptualmente a esa lógica. */
const DEMO_PDFS: SourceFileMeta[] = [
  {
    id: "demo-neuro",
    name: "Neuroanatomía Clínica — Cap. 4.pdf",
    type: "application/pdf",
  },
  {
    id: "demo-fisio",
    name: "Fisiopatología del SNA.pdf",
    type: "application/pdf",
  },
];

let messageIdSequence = 0;
function nextMessageId(): string {
  messageIdSequence += 1;
  return `msg-${Date.now()}-${messageIdSequence}`;
}

function toVaultMessages(messages: ChatMessage[]): AssistantChatMessage[] {
  const now = new Date().toISOString();
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: now,
  }));
}

function fromVaultMessages(messages: AssistantChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as ChatRole,
      content: m.content,
    }));
}

function buildMockExam(examType: ExamType): ExamQuestion[] {
  if (examType === "clinical") {
    return [
      {
        id: "q1",
        prompt:
          "Un paciente presenta hiperreflexia, Babinski positivo y paresia espástica en hemicuerpo derecho. ¿Cuál es la localización más probable de la lesión?",
        options: [
          "Neurona motora inferior izquierda",
          "Haz corticoespinal izquierdo (supranuclear)",
          "Nervio periférico derecho",
          "Placa neuromuscular",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt:
          "En el mismo caso, ¿qué hallazgo esperaría en el tono muscular del lado afecto?",
        options: [
          "Hipotonia flácida",
          "Hipertonía espástica",
          "Fasciculaciones prominentes",
          "Areflexia total",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt:
          "Si la lesión elimina el control inhibitorio cortical sobre la médula, ¿cómo reaccionan los reflejos miotáticos?",
        options: [
          "Se abolirán",
          "Se atenuarán levemente",
          "Se exagerarán (hiperreflexia)",
          "Permanecerán sin cambios",
        ],
        correctIndex: 2,
      },
    ];
  }

  if (examType === "active") {
    return [
      {
        id: "q1",
        prompt:
          "Recuerdo activo: nombre el signo patognomónico de lesión de neurona motora superior en el pie.",
        options: [
          "Signo de Babinski",
          "Signo de Tinel",
          "Signo de Chvostek",
          "Signo de Romberg",
        ],
        correctIndex: 0,
      },
      {
        id: "q2",
        prompt:
          "Recuerdo activo: el tracto responsable del control voluntario fino de la musculatura distal es…",
        options: [
          "Haz espinocerebeloso",
          "Haz corticoespinal (piramidal)",
          "Haz espinotalámico lateral",
          "Haz vestibuloespinal",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt:
          "Recuerdo activo: la debilidad en UMN suele acompañarse de…",
        options: [
          "Atrofia rápida y fasciculaciones",
          "Espasticidad e hiperreflexia",
          "Hipotonia y arreflexia",
          "Ptosis y diplopía",
        ],
        correctIndex: 1,
      },
    ];
  }

  // multiple (opción múltiple clásica)
  return [
    {
      id: "q1",
      prompt:
        "¿Cuál de las siguientes NO es característica de una lesión de neurona motora superior?",
      options: [
        "Babinski positivo",
        "Hiperreflexia",
        "Fasciculaciones",
        "Espasticidad",
      ],
      correctIndex: 2,
    },
    {
      id: "q2",
      prompt: "El reflejo miotático depende principalmente de…",
      options: [
        "Husos neuromusculares y arco mono/oligosináptico",
        "Nociceptores cutáneos",
        "Corpúsculos de Pacini",
        "Células de Schwann",
      ],
      correctIndex: 0,
    },
    {
      id: "q3",
      prompt:
        "Una lesión cortical que libera a la médula del control inhibitorio tiende a producir…",
      options: [
        "Parálisis flácida irreversible",
        "Hiperreflexia y clonus",
        "Anestesia en guante y calcetín",
        "Ptosis bilateral",
      ],
      correctIndex: 1,
    },
  ];
}

export default function AssistantView({ mode }: AssistantViewProps) {
  const { dict } = useLanguage();

  const modeLabel =
    mode === "catedratico"
      ? `${dict.assistant.modeProfessor} (${dict.assistant.modeProfessorMethod})`
      : `${dict.assistant.modeInquisitor} (${dict.assistant.modeInquisitorMethod})`;

  const modeDot =
    mode === "catedratico" ? MODE_DOT_PROFESSOR : MODE_DOT_INQUISITOR;

  return (
    <div
      className="flex h-[calc(100vh-8rem)] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-neutral-800"
      style={{ backgroundColor: BASALT_BG }}
    >
      <header className="shrink-0 border-b border-neutral-800/80 px-6 py-5 sm:px-8">
        <h2 className="assistant-serif text-2xl font-medium tracking-tight text-neutral-100 sm:text-3xl">
          {dict.assistant.title}
        </h2>
        <div className="mt-2.5 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: modeDot }}
            aria-hidden="true"
          />
          <p className="text-xs tracking-wide text-neutral-500">
            {dict.assistant.modeLabel}: {modeLabel}
          </p>
        </div>
      </header>

      {mode === "catedratico" ? <ProfessorExamPanel /> : <InquisitorChatPanel />}
    </div>
  );
}

/** Modo Inquisidor — chat socrático con persistencia en `assistant_memory`. */
function InquisitorChatPanel() {
  const { dict } = useLanguage();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const historyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = draft.trim().length > 0;

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const { session } = await getOrCreateActiveSession("inquisidor");
      if (!isMounted) return;

      const stored = fromVaultMessages(session.messages);
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        const seed: ChatMessage[] = [
          {
            id: "mock-user",
            role: "user",
            content: dict.assistant.mockUserMessage,
          },
          {
            id: "mock-assistant",
            role: "assistant",
            content: dict.assistant.mockAssistantMessage,
          },
        ];
        setMessages(seed);
        void persistSessionMessages(session.id, toVaultMessages(seed));
      }
      setSessionId(session.id);
      setIsHydrating(false);
    })();

    return () => {
      isMounted = false;
    };
    // Solo al montar / cambiar a este panel — los mocks del idioma de montaje
    // quedan como historial "ya dicho" si la sesión estaba vacía.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = historyRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !sessionId) return;

    setMessages((current) => {
      const next = [
        ...current,
        { id: nextMessageId(), role: "user" as const, content },
      ];
      void persistSessionMessages(sessionId, toVaultMessages(next));
      return next;
    });
    setDraft("");
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSend();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        ref={historyRef}
        className="flex flex-1 flex-col gap-7 overflow-y-auto px-6 py-8 sm:px-10"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isHydrating ? (
          <p className="text-sm text-neutral-600">…</p>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div
                  className="max-w-[min(36rem,88%)] rounded-lg px-4 py-3 text-sm leading-relaxed text-neutral-200"
                  style={{ backgroundColor: USER_BUBBLE }}
                >
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-start">
                <p className="assistant-serif max-w-[min(40rem,92%)] text-[1.05rem] leading-[1.7] text-neutral-300">
                  {message.content}
                </p>
              </div>
            ),
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-neutral-800/80 px-4 py-4 sm:px-6"
      >
        <div
          className="flex items-end gap-2 rounded-lg border border-neutral-800 px-3 py-2.5 transition-shadow duration-200 focus-within:ring-1 focus-within:ring-neutral-700"
          style={{ backgroundColor: INPUT_BG }}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={dict.assistant.inputPlaceholder}
            aria-label={dict.assistant.inputPlaceholder}
            className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={!hasText || isHydrating}
            aria-label={dict.assistant.sendLabel}
            title={dict.assistant.sendLabel}
            className={[
              "mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
              hasText
                ? "text-amber-600/90 hover:bg-neutral-800 hover:text-amber-500"
                : "cursor-not-allowed text-neutral-700",
            ].join(" ")}
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </form>
    </>
  );
}

/**
 * "El Nuevo Catedrático" — ya no es un chat: formulario Silent Luxury +
 * área de examen generado (serif, checkboxes, evaluar).
 */
function ProfessorExamPanel() {
  const { dict, t } = useLanguage();
  const isPro = useUserStore((s) => s.isPro);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<SourceFileMeta[]>(DEMO_PDFS);
  const [usingDemoSources, setUsingDemoSources] = useState(true);
  const [selectedPdfId, setSelectedPdfId] = useState(DEMO_PDFS[0].id);
  const [pageRange, setPageRange] = useState("12–28");
  const [examType, setExamType] = useState<ExamType>("clinical");
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    void listSourcePdfFiles().then((files) => {
      if (!isMounted) return;
      if (files.length > 0) {
        setPdfOptions(files);
        setSelectedPdfId(files[0].id);
        setUsingDemoSources(false);
      } else {
        setPdfOptions(DEMO_PDFS);
        setSelectedPdfId(DEMO_PDFS[0].id);
        setUsingDemoSources(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sesión de memoria del Catedrático: se asegura el nodo aunque la UI
  // no muestre el chat — retención de contexto a largo plazo.
  useEffect(() => {
    void getOrCreateActiveSession("catedratico");
  }, []);

  const handleGenerate = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    setQuestions(buildMockExam(examType));
    setAnswers({});
    setScore(null);
  };

  const handleEvaluate = () => {
    if (!questions) return;
    let correct = 0;
    for (const question of questions) {
      if (answers[question.id] === question.correctIndex) correct += 1;
    }
    setScore(correct);
  };

  const handleReset = () => {
    setQuestions(null);
    setAnswers({});
    setScore(null);
  };

  const fieldClass =
    "w-full rounded-md border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 text-sm text-neutral-200 outline-none transition-shadow focus:ring-1 focus:ring-neutral-700";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <form
        className="shrink-0 border-b border-neutral-800/80 px-6 py-5 sm:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          handleGenerate();
        }}
        style={{ backgroundColor: PANEL_BG }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="professor-pdf"
              className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase"
            >
              {dict.assistant.professor.sourceLabel}
            </label>
            <select
              id="professor-pdf"
              value={selectedPdfId}
              onChange={(event) => setSelectedPdfId(event.target.value)}
              className={`mt-1.5 ${fieldClass}`}
            >
              {pdfOptions.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
            {usingDemoSources && (
              <p className="mt-1.5 text-[11px] text-neutral-600">
                {dict.assistant.professor.noSourceHint}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="professor-pages"
              className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase"
            >
              {dict.assistant.professor.pageRangeLabel}
            </label>
            <input
              id="professor-pages"
              type="text"
              value={pageRange}
              onChange={(event) => setPageRange(event.target.value)}
              placeholder={dict.assistant.professor.pageRangePlaceholder}
              className={`mt-1.5 ${fieldClass}`}
            />
          </div>

          <div>
            <label
              htmlFor="professor-exam-type"
              className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase"
            >
              {dict.assistant.professor.examTypeLabel}
            </label>
            <select
              id="professor-exam-type"
              value={examType}
              onChange={(event) =>
                setExamType(event.target.value as ExamType)
              }
              className={`mt-1.5 ${fieldClass}`}
            >
              <option value="clinical">
                {dict.assistant.professor.examTypes.clinical}
              </option>
              <option value="multiple">
                {dict.assistant.professor.examTypes.multiple}
              </option>
              <option value="active">
                {dict.assistant.professor.examTypes.active}
              </option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={[
            "mt-5 flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3.5 text-sm font-medium tracking-[0.12em] uppercase transition-colors duration-200 sm:w-auto",
            isPro
              ? "border-neutral-700 bg-neutral-950 text-neutral-100 hover:border-amber-700/50 hover:text-amber-500/90"
              : "border-amber-700/40 bg-neutral-950 text-amber-200/90 hover:border-amber-600/60 hover:text-amber-100",
          ].join(" ")}
        >
          {isPro ? (
            dict.assistant.professor.generateButton
          ) : (
            <>
              {dict.assistant.professor.generateLocked}
              <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {showUpgradeModal && (
        <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        {!questions ? (
          <p className="assistant-serif text-center text-lg text-neutral-600">
            —
          </p>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="assistant-serif text-xl font-medium text-neutral-100">
                {dict.assistant.professor.examTitle}
              </h3>
              {score !== null && (
                <p className="text-sm tabular-nums tracking-wide text-amber-600/90">
                  {t(dict.assistant.professor.scoreLabel, {
                    score,
                    total: questions.length,
                  })}
                </p>
              )}
            </div>

            {questions.map((question, index) => (
              <fieldset key={question.id} className="border-0 p-0">
                <legend className="assistant-serif text-base leading-relaxed text-neutral-200">
                  <span className="mr-2 text-neutral-500">{index + 1}.</span>
                  {question.prompt}
                </legend>
                <div className="mt-4 flex flex-col gap-2.5">
                  {question.options.map((option, optionIndex) => {
                    const inputId = `${question.id}-${optionIndex}`;
                    const isSelected = answers[question.id] === optionIndex;
                    const showResult = score !== null;
                    const isCorrect = optionIndex === question.correctIndex;

                    return (
                      <label
                        key={inputId}
                        htmlFor={inputId}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors duration-150",
                          showResult && isCorrect
                            ? "border-emerald-800/60 text-emerald-200/90"
                            : showResult && isSelected && !isCorrect
                              ? "border-rose-900/50 text-rose-300/80"
                              : isSelected
                                ? "border-neutral-600 text-neutral-100"
                                : "border-neutral-800 text-neutral-400 hover:border-neutral-700",
                        ].join(" ")}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={isSelected}
                          disabled={score !== null}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: optionIndex,
                            }))
                          }
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-amber-700"
                        />
                        <span className="leading-relaxed">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-wrap gap-3 border-t border-neutral-800 pt-6">
              {score === null ? (
                <button
                  type="button"
                  onClick={handleEvaluate}
                  className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-medium tracking-wide text-neutral-200 uppercase transition-colors hover:border-amber-700/50 hover:text-amber-500/90"
                >
                  {dict.assistant.professor.evaluateButton}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-md border border-neutral-800 px-5 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300"
                >
                  {dict.assistant.professor.resetButton}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
