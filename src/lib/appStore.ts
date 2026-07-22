import { isTauri } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import { decryptData, encryptData, isEncryptedPayload } from "./crypto";

/**
 * "Bóveda de Titanio" — el ÚNICO módulo de la app que sabe que
 * `@tauri-apps/plugin-store` existe. Los valores tipados se serializan y
 * cifran (AES) antes de bajar a `app_data.dat`.
 */
const VAULT_FILE_NAME = "app_data.dat";

let storeConnection: Promise<Store> | null = null;

function connect(): Promise<Store> {
  if (!storeConnection) {
    storeConnection = Store.load(VAULT_FILE_NAME);
  }
  return storeConnection;
}

export function isVaultAvailable(): boolean {
  return isTauri();
}

function encodeVaultPayload<T>(value: T): string {
  return encryptData(JSON.stringify(value));
}

function decodeVaultPayload<T>(raw: unknown): T | null {
  if (typeof raw !== "string") {
    // Legado pre-cifrado: el store guardaba objetos JSON tipados.
    return (raw as T) ?? null;
  }
  try {
    const plain = isEncryptedPayload(raw) ? decryptData(raw) : raw;
    return JSON.parse(plain) as T;
  } catch (error) {
    console.error("[Bóveda de Titanio] No se pudo descifrar payload:", error);
    return null;
  }
}

/** Lectura asíncrona y robusta: nunca lanza — cualquier fallo se registra y resuelve en `null`. */
export async function getVaultValue<T>(key: string): Promise<T | null> {
  if (!isVaultAvailable()) return null;

  try {
    const store = await connect();
    const value = await store.get<unknown>(key);
    if (value === null || value === undefined) return null;
    return decodeVaultPayload<T>(value);
  } catch (error) {
    console.error(`[Bóveda de Titanio] No se pudo leer "${key}":`, error);
    return null;
  }
}

export async function setVaultValue<T>(key: string, value: T): Promise<void> {
  if (!isVaultAvailable()) return;

  try {
    const store = await connect();
    await store.set(key, encodeVaultPayload(value));
  } catch (error) {
    console.error(`[Bóveda de Titanio] No se pudo escribir "${key}":`, error);
  }
}

export async function saveVault(): Promise<void> {
  if (!isVaultAvailable()) return;

  try {
    const store = await connect();
    await store.save();
  } catch (error) {
    console.error("[Bóveda de Titanio] No se pudo persistir en disco:", error);
  }
}

export async function setAndPersist<T>(key: string, value: T): Promise<void> {
  await setVaultValue(key, value);
  await saveVault();
}
