/** Replace with the live Mac App Store product URL before launch. */
export const MAC_APP_STORE_URL =
  "https://apps.apple.com/app/excellence-absolue/id0000000000";

export const SUPPORT_EMAIL = "mailto:support@excellenceabsolue.com";

export type LandingPath = "/" | "/privacy" | "/terms" | "/support";

export function normalizePath(pathname: string): LandingPath {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/privacy") return "/privacy";
  if (clean === "/terms") return "/terms";
  if (clean === "/support") return "/support";
  return "/";
}
