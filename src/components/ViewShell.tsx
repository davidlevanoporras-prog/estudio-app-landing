import type { ReactNode } from "react";

type ViewShellProps = {
  /** Cabecera estática (título, Volver, acciones). No hace scroll. */
  header: ReactNode;
  /** Cuerpo scrolleable con scrollbar premium del Showroom. */
  children: ReactNode;
  /** Clases extra del contenedor de scroll. */
  bodyClassName?: string;
  /** Clases extra del shell raíz. */
  className?: string;
};

/**
 * Layout de vista con cabecera fija + cuerpo con overflow elegante.
 * El `<main>` del Dashboard debe ser `overflow-hidden` + `min-h-0` para
 * que `h-full` / `flex-1` limiten la altura y el scroll quede interno.
 */
export default function ViewShell({
  header,
  children,
  bodyClassName = "",
  className = "",
}: ViewShellProps) {
  return (
    <div
      className={["flex h-full min-h-0 flex-col", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="shrink-0">{header}</div>
      <div
        className={[
          "ui-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pb-16",
          bodyClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
