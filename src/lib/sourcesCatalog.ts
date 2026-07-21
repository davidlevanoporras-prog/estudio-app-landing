/**
 * Catálogo ligero de Fuentes — lee metadatos de `SourcesDB` (la misma
 * IndexedDB que `SourcesView.tsx`) sin arrastrar la UI completa. El
 * Catedrático usa esto para poblar el selector de PDF; si la bóveda de
 * fuentes está vacía, el consumidor cae a PDFs simulados.
 */

const DB_NAME = "SourcesDB";
const DB_VERSION = 1;
const FILES_STORE = "files";

export type SourceFileMeta = {
  id: string;
  name: string;
  type: string;
};

function openSourcesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Lista PDFs (y documentos afines) de Fuentes — sin binarios, solo metadatos. */
export async function listSourcePdfFiles(): Promise<SourceFileMeta[]> {
  try {
    const db = await openSourcesDb();
    const files = await new Promise<SourceFileMeta[]>((resolve, reject) => {
      const tx = db.transaction(FILES_STORE, "readonly");
      const request = tx.objectStore(FILES_STORE).getAll();
      request.onsuccess = () => {
        const rows = (request.result as Array<{
          id: string;
          name: string;
          type: string;
        }>).map((row) => ({
          id: row.id,
          name: row.name,
          type: row.type ?? "",
        }));
        resolve(rows);
      };
      request.onerror = () => reject(request.error);
    });

    return files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );
  } catch {
    return [];
  }
}
