import { saveImage } from "../utils/mediaStore";

const IDB_MEDIA_PREFIX = "idb:";

/** Markdown que apunta a un blob en IndexedDB (`mediaStore`). */
export function idbImageMarkdown(imageId: string, alt = "image"): string {
  return `![${alt}](${IDB_MEDIA_PREFIX}${imageId})`;
}

export function isIdbImageSrc(src: string): boolean {
  return src.startsWith(IDB_MEDIA_PREFIX);
}

export function idbImageIdFromSrc(src: string): string {
  return src.slice(IDB_MEDIA_PREFIX.length);
}

/**
 * Si el portapapeles trae una imagen, la guarda en IndexedDB e inserta
 * markdown `![…](idb:…)` en el campo. Devuelve `true` si consumió el paste.
 */
export async function handleImagePaste(
  event: {
    clipboardData: DataTransfer | null;
    preventDefault: () => void;
  },
  insertMarkdown: (markdown: string) => void,
): Promise<boolean> {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (const item of Array.from(items)) {
    if (!item.type.startsWith("image/")) continue;

    const file = item.getAsFile();
    if (!file) continue;

    event.preventDefault();
    try {
      const imageId = await saveImage(file);
      insertMarkdown(`\n${idbImageMarkdown(imageId)}\n`);
      return true;
    } catch (error) {
      console.error("[pasteImage] No se pudo guardar la imagen pegada:", error);
      return false;
    }
  }

  return false;
}
