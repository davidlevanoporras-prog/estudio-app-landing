import { convertFileSrc } from "@tauri-apps/api/core";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ArrowLeft,
  Download,
  File as FileIcon,
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  Image as ImageIcon,
  Library,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  isNativeFilePickerAvailable,
  pickPdfFiles,
} from "../lib/nativeFiles";
import { useLanguage } from "../i18n/LanguageContext";
import { useConfirm } from "./ConfirmProvider";
import { PortalMenu } from "./PortalMenu";

/**
 * Gestor de Fuentes — 100% local, sin servidor ni nube.
 *
 * Todo (metadatos de carpetas/archivos Y los binarios reales) vive en
 * IndexedDB, en una base de datos propia (`SourcesDB`, ver Misión 1) —
 * separada de `estudio-media` (la bóveda de imágenes de flashcards, ver
 * `utils/mediaStore.ts`) para no mezclar dominios. Este archivo es
 * deliberadamente autónomo: no depende de ningún otro módulo del proyecto
 * más allá de `lucide-react`, así que se puede montar en cualquier vista
 * sin tocar nada más.
 */

// ────────────────────────────────────────────────────────────────────────
// Misión 1: Base de datos local (IndexedDB nativo, sin librerías)
// ────────────────────────────────────────────────────────────────────────

const DB_NAME = "SourcesDB";
const DB_VERSION = 1;
const FOLDERS_STORE = "folders";
const FILES_STORE = "files";

function openSourcesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no está disponible en este entorno."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadAllFromStore<T>(storeName: string): Promise<T[]> {
  return openSourcesDb().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => {
          resolve(request.result as T[]);
          db.close();
        };
        request.onerror = () => {
          reject(request.error);
          db.close();
        };
      }),
  );
}

function putInStore(storeName: string, value: unknown): Promise<void> {
  return openSourcesDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(value);
        tx.oncomplete = () => {
          resolve();
          db.close();
        };
        tx.onerror = () => {
          reject(tx.error);
          db.close();
        };
      }),
  );
}

function deleteFromStore(storeName: string, id: string): Promise<void> {
  return openSourcesDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).delete(id);
        tx.oncomplete = () => {
          resolve();
          db.close();
        };
        tx.onerror = () => {
          reject(tx.error);
          db.close();
        };
      }),
  );
}

/** Borra una carpeta y todos sus archivos en UNA sola transacción atómica — o desaparece todo, o no se toca nada. */
function deleteFolderCascade(folderId: string, fileIds: string[]): Promise<void> {
  return openSourcesDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction([FOLDERS_STORE, FILES_STORE], "readwrite");
        tx.objectStore(FOLDERS_STORE).delete(folderId);
        const filesStore = tx.objectStore(FILES_STORE);
        fileIds.forEach((id) => filesStore.delete(id));
        tx.oncomplete = () => {
          resolve();
          db.close();
        };
        tx.onerror = () => {
          reject(tx.error);
          db.close();
        };
      }),
  );
}

// ────────────────────────────────────────────────────────────────────────
// Misión 2: Estructura de datos
// ────────────────────────────────────────────────────────────────────────

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

export type SourceFile = {
  id: string;
  name: string;
  folderId: string;
  /** El binario real — IndexedDB lo guarda nativamente, sin pasar por Base64. */
  blob: Blob;
  /** Ya formateado (ej. "2.4 MB") — se calcula una vez, al subir el archivo. */
  size: string;
  type: string;
  /**
   * Ruta absoluta del SO cuando el PDF se importó vía diálogo nativo Tauri.
   * Alimenta `convertFileSrc` en el visor integrado; ausente en subidas web
   * o entradas antiguas de IndexedDB (ahí se usa un Object URL de respaldo).
   */
  path?: string;
};

let idSequence = 0;
function createId(prefix: string): string {
  idSequence += 1;
  return `${prefix}_${Date.now()}_${idSequence}`;
}

/** "2.4 MB" / "512 KB" / "0 B" — sin decimales para bytes/KB enteros pequeños, 1 decimal a partir de MB. */
function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** Ícono según el tipo MIME — imágenes, PDFs o genérico, mismo lenguaje visual en toda la vista. */
function FileTypeIcon({ type, className }: { type: string; className: string }) {
  if (type.startsWith("image/")) {
    return <ImageIcon className={className} strokeWidth={2} />;
  }
  if (type === "application/pdf") {
    return <FileText className={className} strokeWidth={2} />;
  }
  return <FileIcon className={className} strokeWidth={2} />;
}

function isPdfSource(file: SourceFile): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

/** Nombre de archivo a partir de una ruta de sistema (Unix o Windows). */
function fileNameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

/** Fundido "Lujo Percibido" reutilizable — mismo patrón que el swap de vistas en `DashboardLayout.tsx`: apaga antes de pintar, sube en el siguiente frame. Se dispara cada vez que `dependencyKey` cambia (cambio de carpeta activa, o de término de búsqueda — Misión 4). */
function useFadeTransition(dependencyKey: string) {
  const [isVisible, setIsVisible] = useState(true);

  useLayoutEffect(() => {
    setIsVisible(false);
    const rafId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, [dependencyKey]);

  return isVisible;
}

type SearchResultEntry = {
  folder: Folder;
  files: SourceFile[];
  highlightedFileIds: Set<string>;
};

export default function SourcesView() {
  const { dict } = useLanguage();
  const confirm = useConfirm();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPickingPdf, setIsPickingPdf] = useState(false);
  /**
   * Misión 2 — Visor PDF: ruta de sistema (o Object URL de respaldo) del
   * documento abierto. `null` = modal cerrado.
   */
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  /** Etiqueta de cabecera del modal — se guarda aparte porque un Object URL no lleva nombre. */
  const [selectedPdfName, setSelectedPdfName] = useState("");

  // Carga inicial (Misión 2): lee TODO de IndexedDB una vez al montar y lo
  // vuelca al estado — de ahí en adelante el estado es la fuente de verdad
  // para el render, y cada mutación se refleja también en IndexedDB.
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        const [loadedFolders, loadedFiles] = await Promise.all([
          loadAllFromStore<Folder>(FOLDERS_STORE),
          loadAllFromStore<SourceFile>(FILES_STORE),
        ]);
        if (isCancelled) return;
        setFolders(
          [...loadedFolders].sort((a, b) => b.createdAt - a.createdAt),
        );
        setFiles(loadedFiles);
      } catch {
        /* IndexedDB no disponible en este entorno — la vista sigue funcionando vacía. */
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  const activeFolder = useMemo(
    () => folders.find((folder) => folder.id === activeFolderId) ?? null,
    [folders, activeFolderId],
  );

  const filesInActiveFolder = useMemo(
    () =>
      activeFolder
        ? files.filter((file) => file.folderId === activeFolder.id)
        : [],
    [files, activeFolder],
  );

  const filesCountByFolder = useMemo(() => {
    const counts = new Map<string, number>();
    for (const file of files) {
      counts.set(file.folderId, (counts.get(file.folderId) ?? 0) + 1);
    }
    return counts;
  }, [files]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  /** Misión 4: filtra en tiempo real. Si el nombre de la carpeta matchea, se muestran TODOS sus archivos; si no, solo los archivos cuyo nombre matchea — y esos quedan resaltados. */
  const searchResults = useMemo<SearchResultEntry[]>(() => {
    if (!normalizedQuery) return [];

    const results: SearchResultEntry[] = [];

    for (const folder of folders) {
      const folderMatches = folder.name.toLowerCase().includes(normalizedQuery);
      const folderFiles = files.filter((file) => file.folderId === folder.id);
      const matchingFiles = folderFiles.filter((file) =>
        file.name.toLowerCase().includes(normalizedQuery),
      );

      if (!folderMatches && matchingFiles.length === 0) continue;

      results.push({
        folder,
        files: folderMatches ? folderFiles : matchingFiles,
        highlightedFileIds: new Set(matchingFiles.map((file) => file.id)),
      });
    }

    return results;
  }, [folders, files, normalizedQuery]);

  const isSearching = normalizedQuery.length > 0;
  const contentFadeKey = isSearching
    ? `search:${normalizedQuery}`
    : `folder:${activeFolderId ?? "grid"}`;
  const isContentVisible = useFadeTransition(contentFadeKey);

  const handleCreateFolder = () => {
    const folder: Folder = {
      id: createId("folder"),
      name: dict.sources.defaultFolderName,
      createdAt: Date.now(),
    };
    setFolders((current) => [folder, ...current]);
    setRenamingFolderId(folder.id);
    void putInStore(FOLDERS_STORE, folder);
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders((current) =>
      current.map((folder) => {
        if (folder.id !== id) return folder;
        const updated = { ...folder, name };
        void putInStore(FOLDERS_STORE, updated);
        return updated;
      }),
    );
  };

  const handleDeleteFolder = async (folder: Folder) => {
    const ok = await confirm();
    if (!ok) return;

    const relatedFileIds = files
      .filter((file) => file.folderId === folder.id)
      .map((file) => file.id);

    setFolders((current) => current.filter((item) => item.id !== folder.id));
    setFiles((current) => current.filter((file) => file.folderId !== folder.id));
    setOpenMenuFolderId((current) => (current === folder.id ? null : current));
    setActiveFolderId((current) => (current === folder.id ? null : current));

    void deleteFolderCascade(folder.id, relatedFileIds);
  };

  const persistSourceFile = async (
    file: File,
    options?: { path?: string },
  ) => {
    if (!activeFolder) return;

    const sourceFile: SourceFile = {
      id: createId("file"),
      name: file.name,
      folderId: activeFolder.id,
      blob: file,
      size: formatFileSize(file.size),
      type: file.type || "application/octet-stream",
      ...(options?.path ? { path: options.path } : {}),
    };

    setFiles((current) => [...current, sourceFile]);

    try {
      await putInStore(FILES_STORE, sourceFile);
    } catch {
      // El guardado falló (IndexedDB llena/no disponible): revertimos el optimista.
      setFiles((current) => current.filter((item) => item.id !== sourceFile.id));
    }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || !activeFolder) return;

    for (const file of Array.from(fileList)) {
      await persistSourceFile(file);
    }
  };

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = event.target;
    event.target.value = ""; // permite volver a elegir el mismo archivo más adelante
    void handleFilesSelected(selectedFiles);
  };

  /**
   * "Añadir archivo": en Tauri abre el diálogo nativo filtrado a PDF;
   * fuera del shell, cae al `<input type="file">` de respaldo.
   */
  const handleUploadClick = async () => {
    if (!activeFolder || isPickingPdf) return;

    if (isNativeFilePickerAvailable()) {
      setIsPickingPdf(true);
      try {
        const pdfs = await pickPdfFiles();
        if (pdfs.length === 0) return;

        for (const { file, path } of pdfs) {
          await persistSourceFile(file, { path });
        }
      } finally {
        setIsPickingPdf(false);
      }
      return;
    }

    fileInputRef.current?.click();
  };

  /** Abre el visor integrado — prioriza la ruta nativa para `convertFileSrc`. */
  const handleOpenPdf = (file: SourceFile) => {
    if (!isPdfSource(file)) return;

    if (selectedPdf?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPdf);
    }

    if (file.path) {
      setSelectedPdf(file.path);
    } else {
      // Respaldo web / entradas sin path: Object URL del blob en IndexedDB.
      setSelectedPdf(URL.createObjectURL(file.blob));
    }
    setSelectedPdfName(file.name);
  };

  const handleClosePdf = () => {
    if (selectedPdf?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPdf);
    }
    setSelectedPdf(null);
    setSelectedPdfName("");
  };

  const handleDeleteFile = async (file: SourceFile) => {
    const ok = await confirm();
    if (!ok) return;
    setFiles((current) => current.filter((item) => item.id !== file.id));
    void deleteFromStore(FILES_STORE, file.id);
  };

  /** Descarga forzada real (Misión 3): Object URL efímero, revocado justo después de disparar el clic. */
  const handleDownloadFile = (file: SourceFile) => {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openFolderFromSearch = (folderId: string) => {
    setSearchQuery("");
    setActiveFolderId(folderId);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
            <Library className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="sources-title text-xl font-semibold tracking-tight text-foreground">
            {dict.sources.title}
          </h2>
        </div>

        {!activeFolder && (
          <button
            type="button"
            onClick={handleCreateFolder}
            className="sources-new-folder-btn premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
            {dict.sources.newFolder}
          </button>
        )}
      </div>

      {/* ── Misión 4: buscador instantáneo, estilo Google ── */}
      <div className="sources-search-bar glow-card flex items-center gap-2.5 px-4 py-2.5 transition-all duration-300">
        <Search className="h-4 w-4 shrink-0 text-icon-muted" strokeWidth={2} />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={dict.sources.searchPlaceholder}
          className="min-w-0 flex-1 rounded-md bg-transparent py-0.5 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label={dict.sources.clearSearch}
            title={dict.sources.clearSearch}
            className="premium-btn flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-icon-muted transition-all duration-300 hover:text-primary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-primary/40 border-t-primary" />
          <p className="text-sm text-muted-foreground">{dict.sources.loadingVault}</p>
        </div>
      ) : (
        <div
          className={[
            "transition-opacity duration-300 ease-in-out",
            isContentVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {isSearching ? (
            <SearchResultsView
              results={searchResults}
              query={searchQuery}
              onOpenFolder={openFolderFromSearch}
              onOpenFile={handleOpenPdf}
              onDownloadFile={handleDownloadFile}
              onDeleteFile={handleDeleteFile}
            />
          ) : activeFolder ? (
            <FolderDetailView
              folder={activeFolder}
              files={filesInActiveFolder}
              onBack={() => setActiveFolderId(null)}
              onUploadClick={() => void handleUploadClick()}
              isUploading={isPickingPdf}
              onOpenFile={handleOpenPdf}
              onDownloadFile={handleDownloadFile}
              onDeleteFile={handleDeleteFile}
            />
          ) : (
            <FolderGridView
              folders={folders}
              filesCountByFolder={filesCountByFolder}
              renamingFolderId={renamingFolderId}
              onOpenFolder={setActiveFolderId}
              onStartRenaming={setRenamingFolderId}
              onFinishRenaming={() => setRenamingFolderId(null)}
              onRenameFolder={handleRenameFolder}
              openMenuFolderId={openMenuFolderId}
              onToggleMenu={(id) =>
                setOpenMenuFolderId((current) => (current === id ? null : id))
              }
              onCloseMenu={() => setOpenMenuFolderId(null)}
              onDeleteFolder={handleDeleteFolder}
              onCreateFolder={handleCreateFolder}
            />
          )}
        </div>
      )}

      {/* Vive una sola vez a nivel de vista: el botón de "Añadir archivo" del detalle de carpeta solo dispara su clic. */}
      {/* Respaldo para Vite en navegador — en Tauri se usa `pickPdfFiles()`. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleUploadInputChange}
        className="sr-only"
      />

      {selectedPdf !== null && (
        <PdfViewerModal
          filePath={selectedPdf}
          fileName={selectedPdfName || fileNameFromPath(selectedPdf)}
          onClose={handleClosePdf}
        />
      )}
    </div>
  );
}

/**
 * Misión 3–4 — Modal de lectura Silent Luxury.
 * El `src` del iframe SIEMPRE pasa por `convertFileSrc` cuando `filePath`
 * es una ruta de sistema; los Object URL (`blob:`) se usan tal cual.
 */
function PdfViewerModal({
  filePath,
  fileName,
  onClose,
}: {
  filePath: string;
  fileName: string;
  onClose: () => void;
}) {
  const { dict } = useLanguage();
  const isBlobUrl = filePath.startsWith("blob:");
  const iframeSrc = isBlobUrl ? filePath : convertFileSrc(filePath);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={fileName}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex h-[90%] w-[90%] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#121212]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
          <p className="min-w-0 truncate text-sm font-medium tracking-wide text-neutral-200">
            {fileName}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.sources.closeViewer}
            title={dict.sources.close}
            className="premium-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-all duration-300 hover:bg-white/5 hover:text-neutral-100"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <iframe
          title={fileName}
          src={iframeSrc}
          className="h-full w-full min-h-0 flex-1 border-0 bg-[#0a0a0a]"
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Misión 3: Cuadrícula de carpetas (estilo Notion/Drive oscuro)
// ────────────────────────────────────────────────────────────────────────

type FolderGridViewProps = {
  folders: Folder[];
  filesCountByFolder: Map<string, number>;
  renamingFolderId: string | null;
  onOpenFolder: (id: string) => void;
  onStartRenaming: (id: string) => void;
  onFinishRenaming: () => void;
  onRenameFolder: (id: string, name: string) => void;
  openMenuFolderId: string | null;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  onDeleteFolder: (folder: Folder) => void;
  onCreateFolder: () => void;
};

function FolderGridView({
  folders,
  filesCountByFolder,
  renamingFolderId,
  onOpenFolder,
  onStartRenaming,
  onFinishRenaming,
  onRenameFolder,
  openMenuFolderId,
  onToggleMenu,
  onCloseMenu,
  onDeleteFolder,
  onCreateFolder,
}: FolderGridViewProps) {
  const { dict } = useLanguage();
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-card-rest py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
          <FolderPlus className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {dict.sources.emptyVault}
        </p>
        <button
          type="button"
          onClick={onCreateFolder}
            className="sources-new-folder-btn premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
            {dict.sources.createFolder}
        </button>
      </div>
    );
  }

  return (
    <div className="sources-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          fileCount={filesCountByFolder.get(folder.id) ?? 0}
          isRenaming={renamingFolderId === folder.id}
          onOpen={() => onOpenFolder(folder.id)}
          onStartRenaming={() => onStartRenaming(folder.id)}
          onFinishRenaming={onFinishRenaming}
          onRename={(name) => onRenameFolder(folder.id, name)}
          isMenuOpen={openMenuFolderId === folder.id}
          onToggleMenu={() => onToggleMenu(folder.id)}
          onCloseMenu={onCloseMenu}
          onDelete={() => onDeleteFolder(folder)}
        />
      ))}
    </div>
  );
}

type FolderCardProps = {
  folder: Folder;
  fileCount: number;
  isRenaming: boolean;
  onOpen: () => void;
  onStartRenaming: () => void;
  onFinishRenaming: () => void;
  onRename: (name: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onDelete: () => void;
};

/** Tarjeta "Premium Dark" — mismo lenguaje visual que `DeckCard` (FlashcardsView): clic abre, clic en el título renombra inline, kebab a la derecha. */
function FolderCard({
  folder,
  fileCount,
  isRenaming,
  onOpen,
  onStartRenaming,
  onFinishRenaming,
  onRename,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onDelete,
}: FolderCardProps) {
  const { dict, t } = useLanguage();
  const fileCountLabel = (count: number) =>
    count === 1
      ? dict.sources.fileCountOne
      : t(dict.sources.fileCountMany, { count });
  const [draftName, setDraftName] = useState(folder.name);

  useEffect(() => {
    setDraftName(folder.name);
  }, [folder.name]);

  const commitRename = () => {
    onRename(draftName.trim() || folder.name);
    onFinishRenaming();
  };

  return (
    <article
      onClick={() => {
        if (!isRenaming) onOpen();
      }}
      className={[
        "glow-card group relative flex cursor-pointer flex-col gap-4 p-5 transition-all duration-300",
        isMenuOpen ? "z-[40]" : "z-0",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary transition-all duration-300 group-hover:border-primary group-hover:shadow-glow-sm">
          <FolderIcon className="h-5 w-5" strokeWidth={2} />
        </div>

        <FolderMenu
          isOpen={isMenuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
          onRename={(event) => {
            event.stopPropagation();
            onCloseMenu();
            onStartRenaming();
          }}
          onDelete={(event) => {
            event.stopPropagation();
            onCloseMenu();
            onDelete();
          }}
        />
      </div>

      <div className="min-w-0">
        {isRenaming ? (
          <input
            autoFocus
            value={draftName}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") {
                setDraftName(folder.name);
                onFinishRenaming();
              }
            }}
            className="w-full min-w-0 rounded-md border border-primary bg-background/60 px-2 py-1 text-base font-semibold text-foreground outline-none transition-all duration-300 focus:shadow-glow-sm"
          />
        ) : (
          <h3
            onClick={(event) => {
              event.stopPropagation();
              onStartRenaming();
            }}
            title="Editar nombre de la carpeta"
            className="truncate text-base font-semibold text-foreground transition-colors duration-300 hover:text-primary"
          >
            {folder.name}
          </h3>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {fileCountLabel(fileCount)}
        </p>
      </div>
    </article>
  );
}

type FolderMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRename: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

function FolderMenu({ isOpen, onToggle, onClose, onRename, onDelete }: FolderMenuProps) {
  const { dict } = useLanguage();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={dict.sources.folderOptions}
        className="premium-btn flex h-8 w-8 items-center justify-center rounded-md text-icon-muted transition-all duration-300 hover:text-primary hover:shadow-glow-sm"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>

      <PortalMenu
        open={isOpen}
        anchorRef={buttonRef}
        onClose={onClose}
        className="w-40"
      >
        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            event.stopPropagation();
            onRename(event);
          }}
          className="ui-floating-item flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.sources.rename}
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(event);
          }}
          className="ui-floating-item-danger flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.sources.delete}
        </button>
      </PortalMenu>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Detalle de una carpeta: lista de archivos + subida
// ────────────────────────────────────────────────────────────────────────

type FolderDetailViewProps = {
  folder: Folder;
  files: SourceFile[];
  onBack: () => void;
  onUploadClick: () => void;
  isUploading?: boolean;
  onOpenFile: (file: SourceFile) => void;
  onDownloadFile: (file: SourceFile) => void;
  onDeleteFile: (file: SourceFile) => void;
};

function FolderDetailView({
  folder,
  files,
  onBack,
  onUploadClick,
  isUploading = false,
  onOpenFile,
  onDownloadFile,
  onDeleteFile,
}: FolderDetailViewProps) {
  const { dict } = useLanguage();
  const fileCountLabel = (count: number) =>
    count === 1
      ? dict.sources.fileCountOne
      : dict.sources.fileCountMany.replace("{{count}}", String(count));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={dict.sources.backToSources}
            title={dict.sources.backToSources}
            className="premium-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-rest text-icon-muted transition-all duration-300 hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
            <FolderOpen className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{folder.name}</h3>
            <p className="text-xs text-muted-foreground">
              {fileCountLabel(files.length)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          className="premium-btn flex items-center gap-2 rounded-lg border border-primary/60 bg-primary px-4 py-2.5 text-sm font-medium tracking-wide text-primary-foreground uppercase transition-all duration-300 hover:border-primary hover:shadow-glow-card disabled:opacity-50"
        >
          <Upload className="h-4 w-4" strokeWidth={2.5} />
          {dict.sources.addFile}
        </button>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-card-rest py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {dict.sources.emptyFolder}
          </p>
        </div>
      ) : (
        <div className="glow-card flex flex-col divide-y divide-wenge-border-subtle p-2">
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onOpen={() => onOpenFile(file)}
              onDownload={() => onDownloadFile(file)}
              onDelete={() => onDeleteFile(file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FileRowProps = {
  file: SourceFile;
  isHighlighted?: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

function FileRow({
  file,
  isHighlighted = false,
  onOpen,
  onDownload,
  onDelete,
}: FileRowProps) {
  const { dict } = useLanguage();
  const canOpen = isPdfSource(file);

  return (
    <div
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onClick={canOpen ? onOpen : undefined}
      onKeyDown={
        canOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={[
        "group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-300",
        canOpen ? "cursor-pointer" : "",
        isHighlighted ? "bg-primary-soft" : "hover:bg-white/[0.03]",
      ].join(" ")}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-card-rest bg-card text-icon-muted">
        <FileTypeIcon type={file.type} className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-sm font-medium",
            isHighlighted ? "text-primary" : "text-foreground",
          ].join(" ")}
        >
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">{file.size}</p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDownload();
        }}
        aria-label={`${dict.sources.download} ${file.name}`}
        title={dict.sources.download}
        className="premium-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-icon-muted transition-all duration-300 hover:text-primary hover:shadow-glow-sm"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        aria-label={`${dict.sources.delete} ${file.name}`}
        title={dict.sources.delete}
        className="premium-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-icon-muted transition-all duration-300 hover:text-rose-300 hover:shadow-[0_0_12px_rgba(244,63,94,0.25)]"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Misión 4: resultados de búsqueda
// ────────────────────────────────────────────────────────────────────────

type SearchResultsViewProps = {
  results: SearchResultEntry[];
  query: string;
  onOpenFolder: (folderId: string) => void;
  onOpenFile: (file: SourceFile) => void;
  onDownloadFile: (file: SourceFile) => void;
  onDeleteFile: (file: SourceFile) => void;
};

function SearchResultsView({
  results,
  query,
  onOpenFolder,
  onOpenFile,
  onDownloadFile,
  onDeleteFile,
}: SearchResultsViewProps) {
  const { dict } = useLanguage();
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-card-rest py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {dict.sources.noResultsFor.replace("{{query}}", query)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {results.map(({ folder, files, highlightedFileIds }) => (
        <section key={folder.id} className="glow-card p-4 transition-all duration-300">
          <button
            type="button"
            onClick={() => onOpenFolder(folder.id)}
            className="flex items-center gap-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:text-primary"
          >
            <FolderIcon className="h-4 w-4 text-primary" strokeWidth={2} />
            {folder.name}
          </button>

          {files.length > 0 && (
            <div className="mt-3 flex flex-col divide-y divide-wenge-border-subtle border-t border-wenge-border-subtle">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isHighlighted={highlightedFileIds.has(file.id)}
                  onOpen={() => onOpenFile(file)}
                  onDownload={() => onDownloadFile(file)}
                  onDelete={() => onDeleteFile(file)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
