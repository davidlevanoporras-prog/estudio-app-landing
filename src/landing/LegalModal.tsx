import { useEffect } from "react";
import { X } from "lucide-react";
import type { LegalDocId } from "./constants";
import { LegalArticle } from "./LegalPages";

type LegalModalProps = {
  doc: LegalDocId;
  onClose: () => void;
};

const TITLES: Record<LegalDocId, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  support: "Support & Contact",
};

/**
 * Glass overlay for legal docs — footer clicks never hit a missing route.
 * Deep links (/privacy etc.) still work via SPA pages + vercel.json rewrites.
 */
export default function LegalModal({ doc, onClose }: LegalModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="ea-legal-modal-root"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[doc]}
        className="ea-legal-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ea-legal-modal-bar">
          <p className="ea-legal-modal-kicker">Excellence Absolue</p>
          <button
            type="button"
            className="ea-legal-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="ea-legal-modal-body ea-legal">
          <article>
            <LegalArticle id={doc} />
          </article>
        </div>
      </div>
    </div>
  );
}
