import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  interpolate,
  languageOptions,
  translations,
  type Dictionary,
  type Language,
} from "./dictionary";

const LANGUAGE_STORAGE_KEY = "estudio-language";
const DEFAULT_LANGUAGE: Language = "es";
const LANGUAGE_IDS = languageOptions.map((option) => option.id);

type LanguageContextValue = {
  language: Language;
  dict: Dictionary;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (template: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isValidLanguage(value: string | null): value is Language {
  return LANGUAGE_IDS.includes(value as Language);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isValidLanguage(stored)) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      dict: translations[language],
      setLanguage,
      toggleLanguage: () =>
        setLanguage((current) => {
          const currentIndex = LANGUAGE_IDS.indexOf(current);
          return LANGUAGE_IDS[(currentIndex + 1) % LANGUAGE_IDS.length];
        }),
      t: interpolate,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
