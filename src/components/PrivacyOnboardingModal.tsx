/**
 * Alias canónico del modal de privacidad al primer inicio.
 * Implementación: `PrivacyOnboarding.tsx` · storage: `lib/privacyModal.ts`.
 */
export {
  default,
  PRIVACY_MODAL_STORAGE_KEY,
  PRIVACY_ONBOARDING_STORAGE_KEY,
  PRIVACY_ACCEPTED_STORAGE_KEY,
  readPrivacyAccepted,
  persistPrivacyAccepted,
  clearPrivacyModalFlag,
} from "./PrivacyOnboarding";
