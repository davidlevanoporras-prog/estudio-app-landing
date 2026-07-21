/**
 * "El Inyector de Lujo": una única fuente de verdad para la velocidad de
 * transiciones de toda la interfaz. `DashboardLayout.tsx` controla el
 * estado; este módulo define los valores válidos y sus dos diccionarios de
 * duración (ver comentario de `UI_SPEED_DURATION_MS` más abajo).
 */
export type UiSpeed = "fast" | "smooth" | "luxury";

export const uiSpeedIds: UiSpeed[] = ["fast", "smooth", "luxury"];

export function isValidUiSpeed(value: string | null): value is UiSpeed {
  return value === "fast" || value === "smooth" || value === "luxury";
}

/**
 * Diccionario de clases Tailwind — pensado para elementos "limpios" sin
 * transición propia en CSS (p. ej. `<main>`). 'luxury' es el "Fade" exacto
 * de 450ms: combinado con `transition-opacity` (hardcodeado en `<main>`,
 * ver `DashboardLayout.tsx`) produce `transition-opacity duration-[450ms]
 * ease-in-out`.
 */
export const UI_SPEED_DURATION_CLASSES: Record<UiSpeed, string> = {
  fast: "duration-150",
  smooth: "duration-300",
  luxury: "duration-[450ms] ease-in-out",
};

/**
 * Espejo en milisegundos del diccionario anterior. `premium-btn` y
 * `glow-card` (ver `index.css`) ya declaran su propia duración fija vía la
 * propiedad abreviada `transition`, así que una clase Tailwind `duration-*`
 * no tiene garantía de ganarles por especificidad/orden de cascada. Un
 * estilo en línea (`style={{ transitionDuration }}`) sí gana siempre, y es
 * lo que usa `ProfileView.tsx` para que sus controles respeten `uiSpeed`.
 */
export const UI_SPEED_DURATION_MS: Record<UiSpeed, number> = {
  fast: 150,
  smooth: 300,
  luxury: 450,
};
