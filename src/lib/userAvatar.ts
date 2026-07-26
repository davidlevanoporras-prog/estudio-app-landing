/**
 * Persistencia del avatar de perfil — Base64 Data URI en localStorage.
 * Clave canónica pedida por producto: `excellence_user_avatar`.
 */

export const USER_AVATAR_STORAGE_KEY = "excellence_user_avatar";

const MAX_EDGE_PX = 512;
const JPEG_QUALITY = 0.88;

/** Lee el avatar persistido. `null` si no hay foto (mostrar inicial). */
export function readUserAvatar(): string | null {
  try {
    const raw = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
    if (!raw || !raw.startsWith("data:image/")) return null;
    return raw;
  } catch {
    return null;
  }
}

/** Guarda o borra el avatar. Nunca lanza. */
export function persistUserAvatar(dataUri: string | null): void {
  try {
    if (!dataUri) {
      localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
      return;
    }
    if (!dataUri.startsWith("data:image/")) return;
    localStorage.setItem(USER_AVATAR_STORAGE_KEY, dataUri);
  } catch (error) {
    console.error("[userAvatar] No se pudo persistir el avatar:", error);
  }
}

export function clearUserAvatar(): void {
  persistUserAvatar(null);
}

/**
 * Convierte un File de imagen a Data URI (JPEG reescalado).
 * Evita blobs efímeros y reduce el riesgo de cuota de localStorage.
 */
export function fileToAvatarDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const { width, height } = image;
        const scale = Math.min(1, MAX_EDGE_PX / Math.max(width, height, 1));
        const w = Math.max(1, Math.round(width * scale));
        const h = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible."));
          return;
        }
        ctx.drawImage(image, 0, 0, w, h);

        const dataUri = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUri);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Fallo al codificar."));
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };

    image.src = objectUrl;
  });
}
