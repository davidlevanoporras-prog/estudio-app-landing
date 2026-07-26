import type { ReactNode } from "react";
import GlassPanel from "./GlassPanel";

type EmptyStatePanelProps = {
  icon?: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/** Empty state protegido con cristal del tema activo. */
export default function EmptyStatePanel({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStatePanelProps) {
  return (
    <GlassPanel
      dashed
      className={[
        "flex flex-col items-center justify-center gap-5 px-8 py-16 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-card-rest bg-card text-icon-muted">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        {title ? (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        ) : null}
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </GlassPanel>
  );
}
