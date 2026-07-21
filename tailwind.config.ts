import type { Config } from "tailwindcss";

/**
 * Tailwind v4 reads theme tokens from CSS variables defined in src/index.css.
 * Premium Dark palette: cuervo (Negro Cuervo) + wenge (madera elegante).
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cuervo: "var(--cuervo)",
        wenge: {
          DEFAULT: "var(--wenge)",
          deep: "var(--wenge-deep)",
          subtle: "var(--color-wenge-subtle)",
          border: "var(--color-wenge-border)",
          "border-subtle": "var(--color-wenge-border-subtle)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
          rest: "var(--card-border-rest)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        "icon-muted": "var(--icon-muted)",
      },
      boxShadow: {
        glow: "var(--glow-interactive)",
        "glow-sm": "var(--glow-interactive-sm)",
        "glow-card": "var(--glow-card)",
      },
    },
  },
} satisfies Config;
