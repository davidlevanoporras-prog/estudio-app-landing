import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  dashed?: boolean;
  as?: "div" | "section" | "article";
};

/** Contenedor de cristal: hereda --card / blur del tema activo. */
export default function GlassPanel({
  children,
  className = "",
  dashed = false,
  as: Tag = "div",
}: GlassPanelProps) {
  return (
    <Tag
      className={[
        "photo-glass-panel max-w-full rounded-xl border bg-card text-card-foreground",
        dashed ? "border-dashed border-card-rest" : "border-card-rest",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
