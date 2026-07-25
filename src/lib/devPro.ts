/**
 * Override Pro solo para desarrollo local.
 * En builds de producción `import.meta.env.DEV` es `false` → nunca fuerza Pro.
 */
export const DEV_PRO_LICENSE_KEY = "DEV-LOCAL-PRO";

export function isDevProForced(): boolean {
  return (
    import.meta.env.DEV === true &&
    import.meta.env.VITE_DEV_PRO === "true"
  );
}
