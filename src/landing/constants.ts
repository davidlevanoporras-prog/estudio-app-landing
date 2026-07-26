/** Replace with the live Mac App Store product URL before launch. */
export const MAC_APP_STORE_URL =
  "https://apps.apple.com/app/excellence-absolue/id0000000000";

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

/** Client-side SPA navigation — avoids full reload 404s before Vercel rewrites. */
export function navigateLanding(path: LandingPath): void {
  if (normalizePath(window.location.pathname) === path) {
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
