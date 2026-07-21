/**
 * Bóveda de imágenes offline para flashcards, respaldada por IndexedDB.
 *
 * Por qué no `localStorage`: una imagen en Base64 puede pesar varios MB de
 * texto, y `localStorage` tiene un límite (~5MB) compartido por TODA la app.
 * Un par de fotos bastarían para tirar el dashboard entero. IndexedDB no
 * tiene ese límite práctico y guarda los `Blob`/`File` de forma nativa, sin
 * pasar por texto — el mazo en `localStorage` solo guarda la referencia
 * (`imageId`), nunca el binario.
 */

const DB_NAME = "estudio-media";
const DB_VERSION = 1;
const STORE_NAME = "images";

let idSequence = 0;
function createImageId(): string {
  idSequence += 1;
  return `img_${Date.now()}_${idSequence}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no está disponible en este entorno."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Guarda una imagen en IndexedDB y devuelve el `imageId` único que la referencia. */
export async function saveImage(file: File): Promise<string> {
  const db = await openDb();
  const id = createImageId();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
  return id;
}

/**
 * Recupera una imagen por su id y la expone como Object URL lista para un
 * `<img src="...">`. Devuelve `null` si no existe (id inválido, blob borrado
 * o IndexedDB no disponible). Cada llamada crea una URL nueva — quien la
 * consuma debe revocarla con `URL.revokeObjectURL()` al desmontar o cambiar
 * de imagen, para no acumular memoria del navegador.
 */
export async function getImage(id: string): Promise<string | null> {
  try {
    const db = await openDb();

    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () =>
        resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

/** Borra una imagen del almacén (p. ej. al eliminar o reemplazar la tarjeta que la referencia). */
export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch {
    /* Sin IndexedDB no hay nada que borrar; falla en silencio por diseño. */
  }
}
