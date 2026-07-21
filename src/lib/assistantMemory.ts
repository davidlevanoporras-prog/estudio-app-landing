import { getVaultValue, isVaultAvailable, setAndPersist } from "./appStore";
import { VAULT_KEYS } from "./vaultKeys";

/**
 * "Arquitectura de la Memoria" — nodo oculto `assistant_memory` en la
 * Bóveda de Titanio. Invisible en la UI: solo lo consumen
 * `AssistantView.tsx` (y futuros clientes del LLM) para retener contexto
 * a largo plazo por sesión y por modo (Inquisidor / Catedrático).
 */

export type AssistantMode = "inquisidor" | "catedratico" | "facilitador";

export type AssistantChatRole = "user" | "assistant" | "system";

export type AssistantChatMessage = {
  id: string;
  role: AssistantChatRole;
  content: string;
  /** ISO 8601 */
  createdAt: string;
};

export type AssistantSession = {
  id: string;
  mode: AssistantMode;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
  messages: AssistantChatMessage[];
};

export type AssistantMemory = {
  sessions: AssistantSession[];
  /** Sesión activa por modo — garantiza continuidad al reabrir la Consola. */
  activeSessionByMode: Partial<Record<AssistantMode, string>>;
};

/** Fallback de navegador (sin shell Tauri) — misma forma, distinto medio. Nunca se muestra en UI. */
const BROWSER_FALLBACK_KEY = "estudio-assistant-memory";

export function emptyAssistantMemory(): AssistantMemory {
  return { sessions: [], activeSessionByMode: {} };
}

function isChatMessage(value: unknown): value is AssistantChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AssistantChatMessage).id === "string" &&
    typeof (value as AssistantChatMessage).role === "string" &&
    typeof (value as AssistantChatMessage).content === "string"
  );
}

function isSession(value: unknown): value is AssistantSession {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AssistantSession).id === "string" &&
    typeof (value as AssistantSession).mode === "string" &&
    Array.isArray((value as AssistantSession).messages)
  );
}

function normalizeMemory(raw: AssistantMemory): AssistantMemory {
  return {
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions.filter(isSession).map((session) => ({
          ...session,
          messages: session.messages.filter(isChatMessage),
          createdAt: session.createdAt ?? new Date().toISOString(),
          updatedAt: session.updatedAt ?? new Date().toISOString(),
        }))
      : [],
    activeSessionByMode:
      raw.activeSessionByMode && typeof raw.activeSessionByMode === "object"
        ? raw.activeSessionByMode
        : {},
  };
}

function readBrowserFallback(): AssistantMemory | null {
  try {
    const raw = localStorage.getItem(BROWSER_FALLBACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssistantMemory;
    return normalizeMemory(parsed);
  } catch {
    return null;
  }
}

function writeBrowserFallback(memory: AssistantMemory): void {
  try {
    localStorage.setItem(BROWSER_FALLBACK_KEY, JSON.stringify(memory));
  } catch {
    /* cuota / private mode — la memoria queda solo en RAM esta sesión */
  }
}

/** Lectura del nodo oculto. Nunca lanza. */
export async function loadAssistantMemory(): Promise<AssistantMemory> {
  const fromVault = await getVaultValue<AssistantMemory>(
    VAULT_KEYS.assistantMemory,
  );
  if (fromVault) return normalizeMemory(fromVault);

  if (!isVaultAvailable()) {
    return readBrowserFallback() ?? emptyAssistantMemory();
  }

  return emptyAssistantMemory();
}

/** Persistencia inmediata a la Bóveda (o fallback de navegador). */
export async function saveAssistantMemory(
  memory: AssistantMemory,
): Promise<void> {
  const normalized = normalizeMemory(memory);
  if (isVaultAvailable()) {
    await setAndPersist(VAULT_KEYS.assistantMemory, normalized);
    return;
  }
  writeBrowserFallback(normalized);
}

let sessionIdSequence = 0;
function createSessionId(): string {
  sessionIdSequence += 1;
  return `session-${Date.now()}-${sessionIdSequence}`;
}

/**
 * Devuelve la sesión activa del modo pedido — o crea una nueva y la
 * persiste si aún no existe. Único punto de entrada para el chat.
 */
export async function getOrCreateActiveSession(
  mode: AssistantMode,
): Promise<{ memory: AssistantMemory; session: AssistantSession }> {
  const memory = await loadAssistantMemory();
  const activeId = memory.activeSessionByMode[mode];
  const existing = activeId
    ? memory.sessions.find((s) => s.id === activeId && s.mode === mode)
    : undefined;

  if (existing) return { memory, session: existing };

  const now = new Date().toISOString();
  const session: AssistantSession = {
    id: createSessionId(),
    mode,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  const next: AssistantMemory = {
    sessions: [...memory.sessions, session],
    activeSessionByMode: {
      ...memory.activeSessionByMode,
      [mode]: session.id,
    },
  };
  await saveAssistantMemory(next);
  return { memory: next, session };
}

/** Reemplaza el array de mensajes de una sesión y actualiza `updatedAt`. */
export async function persistSessionMessages(
  sessionId: string,
  messages: AssistantChatMessage[],
): Promise<void> {
  const memory = await loadAssistantMemory();
  const now = new Date().toISOString();
  const next: AssistantMemory = {
    ...memory,
    sessions: memory.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, messages, updatedAt: now }
        : session,
    ),
  };
  await saveAssistantMemory(next);
}
