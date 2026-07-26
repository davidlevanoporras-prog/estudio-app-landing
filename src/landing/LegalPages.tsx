import {
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_ADDRESS,
  type LegalDocId,
} from "./constants";

export function PrivacyContent() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="ea-meta">Last updated: July 26, 2026</p>
      <p>
        Excellence Absolue (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
        &ldquo;the app&rdquo;) is a <strong>local-first</strong> study
        application for Mac and iPad. This Privacy Policy explains how
        information is handled when you use the app and this website, in
        accordance with Apple App Store Review Guideline 5.1.1.
      </p>

      <h2>Local-first design</h2>
      <p>
        All study processing and analytics run <strong>locally on your
        device</strong>. Decks, flashcards, spaced-repetition state, challenges,
        sources, timers, and neurometric summaries are stored on your Mac or
        iPad using on-device storage (application data, local browser storage,
        and/or IndexedDB as applicable). We do not operate a cloud account that
        syncs or hosts your academic content on our servers.
      </p>

      <h2>Personal data</h2>
      <p>
        We <strong>do not sell</strong> personal data. We{" "}
        <strong>do not collect</strong> study content, profile photos, or
        analytics from your device for advertising, resale, or third-party
        profiling. Optional on-device profile details (such as a display name or
        avatar) remain on your device unless you choose to share them outside
        the app.
      </p>

      <h2>Data that may remain on your device</h2>
      <ul>
        <li>Study decks, cards, review history, and simulator libraries</li>
        <li>Optional profile name and avatar image</li>
        <li>Language, theme, and interface preferences</li>
        <li>Imported sources and media you add yourself</li>
        <li>Local study statistics and focus timers</li>
      </ul>

      <h2>Purchases</h2>
      <p>
        Optional in-app purchases (for example, visual theme packs) are
        processed by Apple through the Mac App Store / App Store. We do not
        receive your full payment card details. Apple&apos;s privacy policy
        applies to App Store transactions.
      </p>

      <h2>This website</h2>
      <p>
        The marketing website may generate standard hosting or CDN logs (such
        as IP address, user agent, and requested URL) operated by our hosting
        provider. Those logs are used for security and reliability, not for
        selling personal information.
      </p>

      <h2>Your choices</h2>
      <p>
        You may delete local app data from within Excellence Absolue (Profile →
        data reset controls) or by removing the application. Uninstalling the
        app removes on-device app data according to the operating system.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, contact us at{" "}
        <a className="ea-inline" href={SUPPORT_EMAIL}>
          {SUPPORT_EMAIL_ADDRESS}
        </a>
        .
      </p>
    </>
  );
}

export function TermsContent() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="ea-meta">Last updated: July 26, 2026</p>
      <p>
        By downloading, installing, or using Excellence Absolue, you agree to
        these Terms of Service and to applicable Apple Media Services / Mac App
        Store terms.
      </p>

      <h2>License</h2>
      <p>
        Excellence Absolue is licensed, not sold. Subject to these terms, we
        grant you a personal, non-exclusive, non-transferable license to use the
        app on Apple-branded products you own or control, as permitted by the
        App Store rules.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree to use the software only for lawful personal or educational
        purposes and not to reverse engineer, redistribute, or misuse the app
        except as allowed by applicable law.
      </p>

      <h2>In-app purchases</h2>
      <p>
        Optional theme packs or similar non-consumable purchases are offered
        through Apple In-App Purchase. Pricing, billing, and refunds are governed
        by Apple&apos;s terms.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The app is provided as a study aid on an &ldquo;as is&rdquo; basis. You
        remain responsible for your academic work and for backing up materials
        you import. To the maximum extent permitted by law, we disclaim
        warranties of merchantability and fitness for a particular purpose.
      </p>

      <h2>Contact</h2>
      <p>
        Legal inquiries:{" "}
        <a className="ea-inline" href={SUPPORT_EMAIL}>
          {SUPPORT_EMAIL_ADDRESS}
        </a>
        .
      </p>
    </>
  );
}

export function SupportContent() {
  return (
    <>
      <h1>Support &amp; Contact</h1>
      <p className="ea-meta">We typically respond within 2 business days.</p>
      <p>
        Need help with installation, purchases, privacy, or a bug report? Email
        us at:
      </p>
      <p>
        <a className="ea-inline" href={SUPPORT_EMAIL}>
          {SUPPORT_EMAIL_ADDRESS}
        </a>
      </p>

      <h2>Before you write</h2>
      <ul>
        <li>macOS or iPadOS version and device model</li>
        <li>App version (Excellence Absolue → Profile)</li>
        <li>Clear steps to reproduce the issue, if reporting a bug</li>
      </ul>

      <h2>Purchases</h2>
      <p>
        Theme pack purchases and restorations are handled through your Apple ID.
        Manage App Store purchases in System Settings → Apple ID → Media &amp;
        Purchases, or via{" "}
        <a
          className="ea-inline"
          href="https://apps.apple.com/account/subscriptions"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apple account purchase management
        </a>
        .
      </p>

      <h2>Privacy</h2>
      <p>
        For privacy-related questions, use the same contact address above and
        review our Privacy Policy. Excellence Absolue is local-first: study data
        stays on your device.
      </p>
    </>
  );
}

export function LegalArticle({ id }: { id: LegalDocId }) {
  if (id === "privacy") return <PrivacyContent />;
  if (id === "terms") return <TermsContent />;
  return <SupportContent />;
}

export function PrivacyPage() {
  return (
    <section className="ea-legal">
      <div className="ea-shell">
        <article>
          <PrivacyContent />
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
          <TermsContent />
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
          <SupportContent />
        </article>
      </div>
    </section>
  );
}
