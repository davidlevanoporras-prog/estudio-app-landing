import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { LanguageProvider } from "./i18n/LanguageContext";
import { LicenseProvider } from "./i18n/LicenseContext";
import { ThemeEntitlementProvider } from "./i18n/ThemeEntitlementContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <LanguageProvider>
        <LicenseProvider>
          <ThemeEntitlementProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ThemeEntitlementProvider>
        </LicenseProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
