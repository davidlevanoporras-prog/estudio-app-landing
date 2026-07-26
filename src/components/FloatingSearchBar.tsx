import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { isMacPlatform } from "../lib/librarySearch";

type FloatingSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accesibilidad del campo. */
  label: string;
  /** Atajo mostrado a la derecha (p. ej. ⌘K / Ctrl+K). */
  shortcutLabel: string;
  /** Listener global Cmd/Ctrl+K → focus (solo mientras el componente está montado). */
  enableShortcut?: boolean;
  className?: string;
};

/**
 * Barra de búsqueda glassmorphic con indicador de atajo ⌘K / Ctrl+K.
 */
export default function FloatingSearchBar({
  value,
  onChange,
  placeholder,
  label,
  shortcutLabel,
  enableShortcut = true,
  className = "",
}: FloatingSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      // Evita choque con atajos del SO si el foco ya está en un diálogo modal.
      if ((event.target as HTMLElement | null)?.closest?.('[aria-modal="true"]')) {
        return;
      }
      event.preventDefault();
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  return (
    <label
      className={[
        "photo-glass-panel group relative flex w-full items-center gap-2.5 rounded-xl border border-card-rest bg-card/80 px-3 py-2 shadow-sm backdrop-blur-md transition-colors focus-within:border-primary/50 focus-within:shadow-glow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="sr-only">{label}</span>
      <Search
        className="h-4 w-4 shrink-0 text-icon-muted transition-colors group-focus-within:text-primary"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd
        className="pointer-events-none hidden shrink-0 select-none items-center rounded-md border border-card-rest bg-background/50 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted-foreground sm:inline-flex"
        aria-hidden="true"
        title={shortcutLabel}
      >
        {shortcutLabel}
      </kbd>
    </label>
  );
}

/** Etiqueta de atajo según plataforma (⌘K vs Ctrl+K). */
export function searchShortcutLabel(): string {
  return isMacPlatform() ? "⌘K" : "Ctrl+K";
}
