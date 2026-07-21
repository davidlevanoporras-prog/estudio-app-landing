/**
 * Reseteo duro de datos locales (solo desarrollo / herramientas internas).
 * Limpia localStorage, IndexedDB de media y recarga la ventana.
 */

const MEDIA_DB_NAME = "estudio-media";

function clearIndexedDb(name: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve();
      return;
    }
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

export async function hardResetLocalData(): Promise<void> {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("[devReset] localStorage.clear falló:", error);
  }

  await clearIndexedDb(MEDIA_DB_NAME);

  window.location.reload();
}
