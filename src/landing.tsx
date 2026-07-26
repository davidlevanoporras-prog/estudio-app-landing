import { useEffect, useState } from "react";
import {
  normalizePath,
  type LegalDocId,
} from "./landing/constants";
import HomePage from "./landing/HomePage";
import LegalModal from "./landing/LegalModal";
import { SiteChrome } from "./landing/SiteChrome";
import "./landing/landing.css";

function legalDocFromPath(pathname: string): LegalDocId | null {
  const path = normalizePath(pathname);
  if (path === "/privacy") return "privacy";
  if (path === "/terms") return "terms";
  if (path === "/support") return "support";
  return null;
}

/**
 * Marketing landing — legal docs open as glass modals only.
 * Footer never navigates to /privacy|/terms|/support (avoids Vercel 404).
 * Deep links still open the matching modal, then normalize the URL to `/`.
 */
export default function Landing() {
  const [legalModal, setLegalModal] = useState<LegalDocId | null>(() =>
    legalDocFromPath(window.location.pathname),
  );

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "Excellence Absolue — Effortless studying for Mac";
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevColor = body.style.color;
    html.style.background = "#fdfdfd";
    body.style.background = "#fdfdfd";
    body.style.color = "#2a2420";
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      body.style.color = prevColor;
    };
  }, []);

  // Deep link /privacy etc. → open modal, keep address bar on `/`.
  useEffect(() => {
    const doc = legalDocFromPath(window.location.pathname);
    if (!doc) return;
    setLegalModal(doc);
    window.history.replaceState({}, "", "/");
  }, []);

  const openLegal = (doc: LegalDocId) => {
    setLegalModal(doc);
    // Never push /privacy|/terms|/support — URL stays on the landing root.
    if (normalizePath(window.location.pathname) !== "/") {
      window.history.replaceState({}, "", "/");
    }
  };

  return (
    <SiteChrome onOpenLegal={openLegal}>
      <HomePage />
      {legalModal ? (
        <LegalModal doc={legalModal} onClose={() => setLegalModal(null)} />
      ) : null}
    </SiteChrome>
  );
}
