import type { ReactNode } from "react";
import {
  CLASSIC_THEME_ID,
  getThemeConfig,
  useThemeStore,
} from "../store/themeStore";

type ViewHeaderCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Cabecera de vista:
 * - Interfaz Clásica → títulos nativos (sin tarjeta).
 * - Cualquiera de los entornos fotográficos → `glow-card` protectora.
 */
export default function ViewHeaderCard({
  children,
  className = "",
}: ViewHeaderCardProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const isClassic =
    currentTheme === CLASSIC_THEME_ID ||
    !getThemeConfig(currentTheme)?.hasImage;

  if (isClassic) {
    return <div className={className || undefined}>{children}</div>;
  }

  return (
    <section
      className={["glow-card rounded-2xl p-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
