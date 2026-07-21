import { useState, type FormEvent } from "react";
import { ExternalLink, Lock, Sparkles, X, Zap } from "lucide-react";
import { useUserStore } from "../store/userStore";

/** Placeholder de checkout — sustituir por link real de Stripe. */
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_excellence_pro";

type ProUpgradeModalProps = {
  onClose: () => void;
};

/**
 * Modal de venta Pro — glassmorphism + activación por clave.
 */
export default function ProUpgradeModal({ onClose }: ProUpgradeModalProps) {
  const activatePro = useUserStore((s) => s.activatePro);
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [activating, setActivating] = useState(false);

  const handleCheckout = () => {
    window.open(STRIPE_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const handleActivate = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setActivating(true);
    setError(false);
    try {
      await activatePro(trimmed);
      onClose();
    } finally {
      setActivating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="glow-card relative w-full max-w-md overflow-hidden border border-amber-500/30 bg-[#0B0D0F]/85 p-7 shadow-[0_0_40px_rgba(212,165,116,0.18)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,165,116,0.2),transparent_55%)]"
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-md p-1 text-neutral-500 transition-colors hover:text-neutral-200"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="relative z-10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-300">
            <Zap className="h-5 w-5" strokeWidth={1.75} />
          </div>

          <h2
            id="pro-upgrade-title"
            className="text-xl font-semibold tracking-tight text-neutral-50"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Desbloquea el Alto Rendimiento ⚡️
          </h2>

          <ul className="mt-4 space-y-2.5 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/90" strokeWidth={2} />
              Generación de tarjetas con IA
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/90" strokeWidth={2} />
              Análisis de PDFs ilimitado
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/90" strokeWidth={2} />
              Mapa de Calor Avanzado
            </li>
          </ul>

          <button
            type="button"
            onClick={handleCheckout}
            className="premium-btn mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-sm font-medium tracking-wide text-amber-100 uppercase transition-all duration-300 hover:border-amber-300/70 hover:bg-amber-500/25 hover:shadow-[0_0_24px_rgba(212,165,116,0.35)]"
          >
            Obtener Licencia Pro ($4.99/mes)
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <form onSubmit={(e) => void handleActivate(e)} className="mt-6 border-t border-white/10 pt-5">
            <label
              htmlFor="pro-license-key"
              className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase"
            >
              ¿Ya tienes una clave?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="pro-license-key"
                type="text"
                value={key}
                onChange={(event) => {
                  setKey(event.target.value);
                  setError(false);
                }}
                placeholder="EXCELLENCE-XXXX"
                spellCheck={false}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-amber-400/40"
              />
              <button
                type="submit"
                disabled={activating || key.trim().length === 0}
                className="premium-btn flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/50 bg-primary px-3 py-2.5 text-xs font-medium tracking-wide text-primary-foreground uppercase disabled:opacity-40"
              >
                <Lock className="h-3 w-3" strokeWidth={2} />
                Activar
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-rose-300/90">
                Introduce una clave válida para activar Pro.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
