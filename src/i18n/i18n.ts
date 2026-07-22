import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
} from "./dictionary";

const resources = {
  es: { translation: translations.es },
  en: { translation: translations.en },
  de: { translation: translations.de },
  ja: { translation: translations.ja },
  ko: { translation: translations.ko },
} as const;

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && stored in resources) return stored as Language;
  } catch {
    /* ignore */
  }
  return "es";
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
    prefix: "{{",
    suffix: "}}",
  },
  returnNull: false,
});

export default i18n;
