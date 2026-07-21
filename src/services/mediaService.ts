import { isTauri } from "@tauri-apps/api/core";
import {
  BaseDirectory,
  exists,
  mkdir,
  writeFile,
} from "@tauri-apps/plugin-fs";

/** Carpeta de imágenes de flashcards dentro de `BaseDirectory.AppData`. */
export const MEDIA_DIR_NAME = "media";

const FS_OPTS = { baseDir: BaseDirectory.AppData } as const;

/** Quita separadores y caracteres inseguros del nombre original del archivo. */
function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "image.bin";
  return base.replace(/[^\w.\-()+]+/g, "_");
}

/**
 * Guarda un `File` del navegador en `$APPDATA/media/` y devuelve la ruta
 * relativa (ej. `media/1700000000-cerebro.png`) para referenciarla en la tarjeta.
 */
export async function saveImage(file: File): Promise<string> {
  if (!isTauri()) {
    throw new Error(
      "[mediaService] saveImage solo está disponible dentro del shell Tauri.",
    );
  }

  try {
    const dirReady = await exists(MEDIA_DIR_NAME, FS_OPTS);
    if (!dirReady) {
      await mkdir(MEDIA_DIR_NAME, { ...FS_OPTS, recursive: true });
    }

    const uniqueName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const relativePath = `${MEDIA_DIR_NAME}/${uniqueName}`;

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    await writeFile(relativePath, bytes, FS_OPTS);

    return relativePath;
  } catch (error) {
    console.error("[mediaService] saveImage falló al escribir en AppData:", error);
    throw error instanceof Error
      ? error
      : new Error("[mediaService] No se pudo guardar la imagen en disco.");
  }
}
