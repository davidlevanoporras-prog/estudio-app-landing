import type { ReactNode } from "react";
import { MAC_APP_STORE_URL, SUPPORT_EMAIL } from "./constants";

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.33 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="ea-header">
      <div className="ea-shell ea-header-inner">
        <a href="/" className="ea-logo">
          Excellence Absolue
        </a>

        <nav className="ea-nav" aria-label="Primary">
          <a href="/" className="ea-nav-link">
            Home
          </a>
          <a href="/#features" className="ea-nav-link">
            Features
          </a>
        </nav>

        <div className="ea-header-cta">
          <a
            href={MAC_APP_STORE_URL}
            className="ea-cta ea-cta-primary ea-cta-header"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppleGlyph />
            Download on the App Store
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="ea-footer">
      <div className="ea-shell">
        <div className="ea-footer-inner">
          <div>
            <p className="ea-footer-brand">Excellence Absolue</p>
            <p className="ea-footer-note">
              A private, local-first study workspace for Mac — built for focus,
              clarity, and academic excellence.
            </p>
          </div>

          <nav className="ea-footer-links" aria-label="Legal and support">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/support">Support &amp; Contact</a>
            <a href={SUPPORT_EMAIL}>support@excellenceabsolue.com</a>
          </nav>
        </div>

        <p className="ea-footer-copy">
          © {new Date().getFullYear()} Excellence Absolue. All rights reserved.
          Apple, the Apple logo, and Mac App Store are trademarks of Apple Inc.
        </p>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="ea-landing">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
