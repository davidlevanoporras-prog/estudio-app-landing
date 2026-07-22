import {
  decryptData,
  encryptData,
  isEncryptedPayload,
} from "./crypto";

/**
 * Capa de persistencia cifrada sobre `localStorage`.
 * Migración: si el valor legado es JSON plano, se lee y se re-cifra al guardar.
 */

export function setSecureItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, encryptData(value));
  } catch (error) {
    console.error("[secureStorage] setSecureItem falló:", key, error);
  }
}

export function getSecureItem(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    if (isEncryptedPayload(raw)) {
      try {
        return decryptData(raw);
      } catch {
        return null;
      }
    }

    // Legado en claro — se acepta una vez; el próximo setSecureItem lo cifrará.
    return raw;
  } catch {
    return null;
  }
}

export function setSecureJSON(key: string, value: unknown): void {
  setSecureItem(key, JSON.stringify(value));
}

export function getSecureJSON<T>(key: string): T | null {
  const plain = getSecureItem(key);
  if (plain === null || plain === "") return null;
  try {
    return JSON.parse(plain) as T;
  } catch {
    return null;
  }
}

export function removeSecureItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
