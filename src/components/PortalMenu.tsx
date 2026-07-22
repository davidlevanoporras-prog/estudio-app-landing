import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type PortalMenuProps = {
  open: boolean;
  /** Ancla del menú (botón kebab). */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Clases del panel flotante (sin posicionamiento). */
  className?: string;
  children: ReactNode;
  /** Alineación horizontal respecto al ancla. */
  align?: "start" | "end";
};

/**
 * Menú flotante en `document.body` — evita recortes por `overflow` y
 * stacking contexts de tarjetas hermanas (z-index local insuficiente).
 */
export function PortalMenu({
  open,
  anchorRef,
  onClose,
  className = "",
  children,
  align = "end",
}: PortalMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const menuWidth = menu?.offsetWidth ?? 176;
      const gap = 8;
      const left =
        align === "end"
          ? Math.min(
              Math.max(8, rect.right - menuWidth),
              window.innerWidth - menuWidth - 8,
            )
          : Math.min(rect.left, window.innerWidth - menuWidth - 8);

      setCoords({
        top: Math.min(rect.bottom + gap, window.innerHeight - 8),
        left,
      });
    };

    update();
    // Recalcula tras montar el menú (width real).
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, align]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className={["fixed z-[100]", className].join(" ")}
      style={
        coords
          ? { top: coords.top, left: coords.left }
          : { top: -9999, left: -9999, visibility: "hidden" }
      }
    >
      {children}
    </div>,
    document.body,
  );
}
