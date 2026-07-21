import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

/**
 * Puente nativo Tauri v2 (`plugin-dialog` + `plugin-fs`) para abrir el
 * buscador de archivos del SO. Fuera del shell Tauri (Vite en navegador)
 * las funciones resuelven `null` — el consumidor debe ofrecer un
 * `<input type="file">` de respaldo.
 */

function fileNameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || "file";
}

function mimeFromImageName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

async function pathToFile(path: string, mime: string): Promise<File> {
  const bytes = await readFile(path);
  const name = fileNameFromPath(path);
  // Copia a un `Uint8Array` propio: algunos runtimes no aceptan el
  // buffer subyacente de Tauri como `BlobPart` directo.
  const copy = new Uint8Array(bytes);
  return new File([copy], name, { type: mime });
}

/** Abre el diálogo nativo filtrado a png/jpg/jpeg. `null` si cancela o no hay Tauri. */
export async function pickImageFile(): Promise<File | null> {
  if (!isTauri()) return null;

  try {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg"],
        },
      ],
    });

    if (typeof selected !== "string" || selected.length === 0) return null;
    return pathToFile(selected, mimeFromImageName(selected));
  } catch (error) {
    console.error("[nativeFiles] No se pudo abrir imagen:", error);
    return null;
  }
}

/** Resultado del picker nativo de PDF: binario + ruta absoluta (para `convertFileSrc`). */
export type PickedPdf = {
  file: File;
  /** Ruta de sistema — necesaria para el protocolo `asset:` de Tauri. */
  path: string;
};

/** Abre el diálogo nativo filtrado exclusivamente a PDF. Soporta selección múltiple. */
export async function pickPdfFiles(): Promise<PickedPdf[]> {
  if (!isTauri()) return [];

  try {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [
        {
          name: "PDF",
          extensions: ["pdf"],
        },
      ],
    });

    if (selected === null) return [];
    const paths = Array.isArray(selected) ? selected : [selected];
    const picked: PickedPdf[] = [];

    for (const path of paths) {
      if (typeof path !== "string" || path.length === 0) continue;
      picked.push({
        file: await pathToFile(path, "application/pdf"),
        path,
      });
    }

    return picked;
  } catch (error) {
    console.error("[nativeFiles] No se pudo abrir PDF:", error);
    return [];
  }
}

export function isNativeFilePickerAvailable(): boolean {
  return isTauri();
}
