/**
 * URLs legales públicas (App Store Review Guidelines 5.1.1).
 * Deep links open the landing root; the SPA shows the Privacy modal and
 * normalizes the address bar to `/` (no dedicated Vercel page required).
 * Keep `vercel.json` SPA rewrite so `/privacy` still loads index.html.
 */
export const PRIVACY_POLICY_URL =
  "https://estudio-app-landing.vercel.app/privacy";

export const TERMS_OF_SERVICE_URL =
  "https://estudio-app-landing.vercel.app/terms";

export const SUPPORT_URL = "https://estudio-app-landing.vercel.app/support";

export const SUPPORT_EMAIL = "mailto:excellenceabsolue@gmail.com";
