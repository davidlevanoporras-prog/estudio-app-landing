import { AlertTriangle } from "lucide-react";

export type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Estilo destructivo (eliminar) — rojo cereza profundo. */
  destructive?: boolean;
};

/**
 * Diálogo de confirmación premium — respeta el Showroom (tokens de tema).
 * Overlay: blur + velo oscuro. Contenedor: card del tema activo.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="ui-floating w-full max-w-md rounded-xl p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={[
            "mx-auto flex h-11 w-11 items-center justify-center rounded-full border",
            destructive
              ? "border-[#7f1d1d]/40 bg-[#7f1d1d]/10 text-[#9f1239]"
              : "border-card-rest text-icon-muted",
          ].join(" ")}
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-5 text-center text-lg font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-card-rest bg-transparent px-4 py-2.5 text-xs font-medium tracking-[0.12em] text-secondary-foreground uppercase transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-lg border px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors",
              destructive
                ? "border-[#7f1d1d]/50 bg-[#9f1239] text-[#fdf2f4] hover:bg-[#881337] hover:text-white"
                : "border-primary/50 bg-primary text-primary-foreground hover:border-primary",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
