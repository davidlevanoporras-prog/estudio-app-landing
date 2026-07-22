import CryptoJS from "crypto-js";

/**
 * Cifrado AES-256 (CryptoJS) para datos persistidos en disco / localStorage.
 * La clave es de aplicación — ofuscación en cliente, no un KMS remoto.
 */
const APP_SECRET =
  "ExcellenceAbsolue·AES256·Vault·Key·v1·DoNotCommitVariants";

/** Prefijo para distinguir payload cifrado de legado en texto plano. */
export const SECURE_PAYLOAD_PREFIX = "ea1:";

export function encryptData(plainText: string): string {
  const cipher = CryptoJS.AES.encrypt(plainText, APP_SECRET).toString();
  return `${SECURE_PAYLOAD_PREFIX}${cipher}`;
}

export function decryptData(payload: string): string {
  const raw = payload.startsWith(SECURE_PAYLOAD_PREFIX)
    ? payload.slice(SECURE_PAYLOAD_PREFIX.length)
    : payload;
  const bytes = CryptoJS.AES.decrypt(raw, APP_SECRET);
  const plain = bytes.toString(CryptoJS.enc.Utf8);
  if (!plain) {
    throw new Error("[crypto] decryptData: payload inválido o clave incorrecta");
  }
  return plain;
}

export function isEncryptedPayload(value: string): boolean {
  return value.startsWith(SECURE_PAYLOAD_PREFIX);
}
