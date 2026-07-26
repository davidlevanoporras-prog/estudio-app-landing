import { SUPPORT_EMAIL } from "./constants";

export function PrivacyPage() {
  return (
    <section className="ea-legal">
      <div className="ea-shell">
        <article>
          <h1>Privacy Policy</h1>
          <p className="ea-meta">Last updated: July 26, 2026</p>
          <p>
            Excellence Absolue is designed as a local-first Mac application. Your
            study materials, profile details, and usage metrics are processed and
            stored on your device.
          </p>
          <h2>Data we store on your Mac</h2>
          <ul>
            <li>Study decks, cards, and review history</li>
            <li>Optional profile name and avatar image</li>
            <li>Local preferences such as language and theme settings</li>
            <li>Sources and media you import into the app</li>
          </ul>
          <h2>What we do not do</h2>
          <p>
            We do not operate a cloud account system for your study content, and
            we do not sell personal data. The marketing website may use standard
            hosting logs; the desktop app itself is built to keep your academic
            data private on your machine.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about privacy:{" "}
            <a className="ea-inline" href={SUPPORT_EMAIL}>
              support@excellenceabsolue.com
            </a>
            .
          </p>
        </article>
      </div>
    </section>
  );
}

export function TermsPage() {
  return (
    <section className="ea-legal">
      <div className="ea-shell">
        <article>
          <h1>Terms of Service</h1>
          <p className="ea-meta">Last updated: July 26, 2026</p>
          <p>
            By downloading or using Excellence Absolue, you agree to use the
            software for lawful personal or educational purposes and to comply
            with Apple&apos;s Mac App Store terms where applicable.
          </p>
          <h2>License</h2>
          <p>
            Excellence Absolue is licensed, not sold. Optional visual theme
            packs may be offered as non-consumable in-app purchases through the
            Mac App Store.
          </p>
          <h2>Disclaimer</h2>
          <p>
            The app is provided as a study aid. You remain responsible for your
            academic work and for maintaining backups of any materials you
            import.
          </p>
          <h2>Contact</h2>
          <p>
            Legal inquiries:{" "}
            <a className="ea-inline" href={SUPPORT_EMAIL}>
              support@excellenceabsolue.com
            </a>
            .
          </p>
        </article>
      </div>
    </section>
  );
}

export function SupportPage() {
  return (
    <section className="ea-legal">
      <div className="ea-shell">
        <article>
          <h1>Support &amp; Contact</h1>
          <p className="ea-meta">We typically respond within 2 business days.</p>
          <p>
            Need help with installation, purchases, or a bug report? Reach our
            team directly:
          </p>
          <p>
            <a className="ea-inline" href={SUPPORT_EMAIL}>
              support@excellenceabsolue.com
            </a>
          </p>
          <h2>Before you write</h2>
          <ul>
            <li>macOS version and Mac model</li>
            <li>App version (Excellence Absolue → Profile)</li>
            <li>Steps to reproduce the issue, if reporting a bug</li>
          </ul>
          <h2>Purchases</h2>
          <p>
            Theme pack purchases and restorations are handled through your Apple
            ID. Manage App Store purchases in System Settings → Apple ID →
            Media &amp; Purchases, or via{" "}
            <a
              className="ea-inline"
              href="https://apps.apple.com/account/subscriptions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple subscription management
            </a>
            .
          </p>
        </article>
      </div>
    </section>
  );
}
