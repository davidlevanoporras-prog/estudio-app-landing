import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

type InfoTooltipProps = {
  /** Texto del recuadro informativo. */
  content: string;
  /** Accesibilidad del trigger. */
  label: string;
};

/**
 * Tooltip informativo — panel temático (`.ui-floating`) vía Showroom.
 */
export default function InfoTooltip({ content, label }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="info-tooltip relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-current/45 transition-colors duration-200 hover:text-current/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="ui-floating animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md px-3 py-2.5 text-left text-xs leading-relaxed font-normal normal-case tracking-normal sm:w-72"
        >
          {content}
        </span>
      )}
    </span>
  );
}
