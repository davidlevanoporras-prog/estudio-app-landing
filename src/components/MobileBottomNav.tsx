import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  Library,
  Menu,
  User,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export type MobileNavTabId =
  | "dashboard"
  | "flashcards"
  | "sources"
  | "profile"
  | "more";

type MobileBottomNavProps = {
  activeView: string;
  isMoreOpen: boolean;
  onSelect: (tab: MobileNavTabId) => void;
};

type TabDef = {
  id: MobileNavTabId;
  icon: LucideIcon;
  label: string;
  matchViews?: string[];
};

/**
 * Bottom bar iOS — Dashboard, Flashcards, Sources, Profile + More (drawer).
 * Solo visible < md. Respeta `safe-area-inset-bottom`.
 */
export default function MobileBottomNav({
  activeView,
  isMoreOpen,
  onSelect,
}: MobileBottomNavProps) {
  const { dict } = useLanguage();

  const tabs: TabDef[] = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: dict.nav.dashboard,
      matchViews: ["dashboard"],
    },
    {
      id: "flashcards",
      icon: Layers,
      label: dict.nav.flashcards,
      matchViews: ["flashcards", "study", "editDeck"],
    },
    {
      id: "sources",
      icon: Library,
      label: dict.nav.sources,
      matchViews: ["sources"],
    },
    {
      id: "profile",
      icon: User,
      label: dict.nav.profile,
      matchViews: ["profile", "theme"],
    },
    {
      id: "more",
      icon: Menu,
      label: dict.nav.more,
    },
  ];

  return (
    <nav
      aria-label={dict.sidebar.openMenuLabel}
      className={[
        "fixed inset-x-0 bottom-0 z-[55] border-t border-card-rest bg-cuervo/95 backdrop-blur-md md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1 pt-1">
        {tabs.map(({ id, icon: Icon, label, matchViews }) => {
          const isActive =
            id === "more"
              ? isMoreOpen
              : Boolean(matchViews?.includes(activeView));

          return (
            <li key={id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive && id !== "more" ? "page" : undefined}
                aria-expanded={id === "more" ? isMoreOpen : undefined}
                className={[
                  "touch-target flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5",
                  "text-[10px] font-medium tracking-wide transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground",
                ].join(" ")}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={isActive ? 2.25 : 2}
                  aria-hidden
                />
                <span className="max-w-full truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
