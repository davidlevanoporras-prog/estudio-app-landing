import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import App from "./App";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { LanguageProvider } from "./i18n/LanguageContext";
import { LicenseProvider } from "./i18n/LicenseContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <LicenseProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </LicenseProvider>
    </LanguageProvider>
  </StrictMode>,
);
