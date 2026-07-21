/**
 * "Secuencia de Arranque Cinematográfica" (Misión 1) — el telón de suspenso
 * de 5000ms exactos que se ve al abrir la app, antes de cualquier decisión
 * de enrutamiento (Onboarding vs. Dashboard, ver `App.tsx`).
 *
 * Es puro y tonto a propósito: no lee la Bóveda, no sabe qué viene después,
 * no tiene estado propio ni temporizador — toda la coreografía en el tiempo
 * vive en CSS (`.splash-veil` / `.splash-brand-text`, ver `src/index.css`)
 * para que la animación arranque en el mismo frame en que React monta el
 * nodo, sin depender de que un `useEffect` alcance a dispararse a tiempo.
 * `App.tsx` es el único responsable de desmontarlo, exactamente a los
 * 5000ms, momento en el que su propia animación ya lo dejó en opacidad 0.
 */
export default function SplashScreenView() {
  return (
    <div
      className="splash-veil fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="presentation"
      aria-hidden="true"
    >
      <h1
        className="splash-brand-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 bg-clip-text px-6 text-center text-4xl font-semibold text-transparent select-none sm:text-6xl"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Excellence absolue
      </h1>
    </div>
  );
}
