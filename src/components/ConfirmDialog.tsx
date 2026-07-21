import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Estilo destructivo (eliminar) — acento rose sutil. */
  destructive?: boolean;
};

/**
 * Modal Silent Luxury de confirmación — reemplaza `window.confirm` con
 * la misma autoridad visual del Paywall (basalato, tipografía sobria,
 * sin ruido comercial).
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={[
            "mx-auto flex h-11 w-11 items-center justify-center rounded-full border",
            destructive
              ? "border-rose-900/50 text-rose-400/90"
              : "border-neutral-800 text-neutral-400",
          ].join(" ")}
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2
          id="confirm-dialog-title"
          className="mt-5 text-center text-lg font-medium tracking-tight text-neutral-100"
        >
          {title}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-neutral-400">
          {message}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-800 px-4 py-2.5 text-xs font-medium tracking-[0.12em] text-neutral-400 uppercase transition-colors hover:border-neutral-600 hover:text-neutral-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-md border px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors",
              destructive
                ? "border-rose-800/60 text-rose-300 hover:border-rose-600/70 hover:bg-rose-950/40 hover:text-rose-200"
                : "border-neutral-700 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
