/** Replace with the live Mac App Store product URL before launch. */
export const MAC_APP_STORE_URL =
  "https://apps.apple.com/app/excellence-absolue/id0000000000";

/**
 * Hide App Store CTAs while the listing is under Apple review.
 * Flip to `true` once the real `MAC_APP_STORE_URL` is live.
 */
export const SHOW_MAC_APP_STORE_CTA = false;

/** Primary support & privacy contact (App Store Guideline 5.1.1). */
export const SUPPORT_EMAIL_ADDRESS = "excellenceabsolue@gmail.com";
export const SUPPORT_EMAIL = `mailto:${SUPPORT_EMAIL_ADDRESS}`;

export type LandingPath = "/" | "/privacy" | "/terms" | "/support";

export type LegalDocId = "privacy" | "terms" | "support";

export function normalizePath(pathname: string): LandingPath {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/privacy") return "/privacy";
  if (clean === "/terms") return "/terms";
  if (clean === "/support") return "/support";
  return "/";
}

/** Stay on the marketing root — never push legal subpaths (footer uses modals). */
export function navigateLanding(path: LandingPath): void {
  const target = path === "/" ? "/" : "/";
  if (window.location.pathname !== target || window.location.hash) {
    window.history.pushState({}, "", target);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
