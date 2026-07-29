import { motion, type Variants } from "framer-motion";
import { MAC_APP_STORE_URL, SHOW_MAC_APP_STORE_CTA } from "./constants";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUpDelay: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
  },
};

const revealInView: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.33 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="ea-hero" id="home" aria-labelledby="ea-hero-title">
        <div className="ea-shell ea-hero-grid">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 id="ea-hero-title">
              Studying is your goal. Making it effortless is ours.
            </h1>
            <p className="ea-hero-sub">
              Find your focus, organize seamlessly, and achieve your academic
              milestones with clarity.
            </p>
            <div className="ea-hero-actions">
              {SHOW_MAC_APP_STORE_CTA ? (
                <a
                  href={MAC_APP_STORE_URL}
                  className="ea-cta ea-cta-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AppleGlyph />
                  Download on the App Store
                </a>
              ) : null}
              <a href="#command-center" className="ea-cta ea-cta-secondary">
                Start Your Free Journey
              </a>
            </div>
          </motion.div>

          <motion.div
            className="ea-preview-frame"
            initial="hidden"
            animate="visible"
            variants={fadeUpDelay}
          >
            <img
              src="/images/app-preview.png"
              alt="Excellence Absolue macOS app — study session preview"
              width={1600}
              height={1000}
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 1 — Command Center (Z: copy left, image right) */}
      <section
        className="ea-section ea-section-white"
        id="command-center"
        aria-labelledby="ea-dashboard-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">The Command Center</p>
              <h2 id="ea-dashboard-title">Command Your Academic Focus.</h2>
              <p>
                Your entire study ecosystem at a glance. Monitor your daily
                streak, track pending reviews, and maintain absolute control over
                your progress with a beautifully crafted dashboard.
              </p>
            </div>
            <div className="ea-split-media">
              <img
                className="ea-shot"
                src="/images/dashboard.png"
                alt="Excellence Absolue dashboard — streak, pending reviews, and daily overview"
                width={1800}
                height={1120}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — Precision Flashcards (Z inverted: image left, copy right) */}
      <section
        className="ea-section ea-section-cream"
        id="features"
        aria-labelledby="ea-flashcards-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split ea-split-reverse"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">Precision Flashcards</p>
              <h2 id="ea-flashcards-title">Master Complexity with Precision.</h2>
              <p>
                Built for rigorous study. Organize your decks seamlessly and
                create highly detailed flashcards with image attachments and
                tailored hints. Total memory retention, zero friction.
              </p>
            </div>
            <div className="ea-split-media ea-layers">
              <img
                className="ea-layers-base"
                src="/images/flashcards-decks.png"
                alt="My Decks library in Excellence Absolue"
                width={1800}
                height={1120}
                loading="lazy"
              />
              <img
                className="ea-layers-overlay"
                src="/images/flashcards-modal.png"
                alt="Add card modal floating over the decks view"
                width={1200}
                height={900}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3 — Ironclad Discipline (Z: copy left, image right) */}
      <section
        className="ea-section ea-section-white"
        id="challenges"
        aria-labelledby="ea-challenges-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">Ironclad Discipline</p>
              <h2 id="ea-challenges-title">Forge Ironclad Discipline.</h2>
              <p>
                Transform your ambitions into inevitable realities. Set daily
                gauntlets—whether it&apos;s a brutal three-hour anatomy sprint or
                an intense physics session. The Challenges engine holds you
                ruthlessly accountable to your highest potential.
              </p>
            </div>
            <div className="ea-split-media">
              <img
                className="ea-shot"
                src="/images/challenges.png"
                alt="Excellence Absolue Challenges — daily gauntlets and accountability"
                width={1800}
                height={1120}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4 — Cognitive MRI / Analytics (Z inverted + bento) */}
      <section
        className="ea-section ea-section-cream"
        id="analytics"
        aria-labelledby="ea-analytics-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split ea-split-reverse"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">Cognitive MRI</p>
              <h2 id="ea-analytics-title">
                Surgical Insight Into Your Cognition.
              </h2>
              <p>
                Stop guessing. Excellence Absolue maps your neural pathways in
                real-time. Track your exact Retention Index, analyze Synaptic
                Stability, and visualize your Forgetting Curve. It&apos;s a live
                MRI of your academic performance, ensuring you never waste a
                single second of study.
              </p>
            </div>
            <div className="ea-split-media ea-bento" aria-label="Analytics previews">
              <img
                className="ea-bento-hero"
                src="/images/analytics-neuro.png"
                alt="Neurometrics laboratory — Retention Index and Forgetting Curve"
                width={1600}
                height={1000}
                loading="lazy"
              />
              <img
                className="ea-bento-tile ea-bento-time"
                src="/images/analytics-time.png"
                alt="Time analytics — study investment overview"
                width={1200}
                height={800}
                loading="lazy"
              />
              <img
                className="ea-bento-tile ea-bento-perf"
                src="/images/analytics-performance.png"
                alt="Performance analytics — review quality and retention"
                width={1200}
                height={800}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5 — The Absolute Vault (Sources) */}
      <section
        className="ea-section ea-section-white"
        id="sources"
        aria-labelledby="ea-sources-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">The Absolute Vault</p>
              <h2 id="ea-sources-title">The Absolute Knowledge Vault.</h2>
              <p>
                Stop scattering your literature. &apos;Sources&apos; is your
                centralized, indestructible library. Organize your heaviest
                textbooks and research papers in a frictionless environment,
                ready to be synthesized into pure intellect at a moment&apos;s
                notice.
              </p>
            </div>
            <div className="ea-split-media">
              <img
                className="ea-shot"
                src="/images/sources.png"
                alt="Excellence Absolue Sources — centralized knowledge vault"
                width={1800}
                height={1120}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 6 — High-Stakes Training (Simulator) */}
      <section
        className="ea-section ea-section-cream"
        id="simulator"
        aria-labelledby="ea-simulator-title"
      >
        <div className="ea-shell">
          <motion.div
            className="ea-split ea-split-reverse"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealInView}
          >
            <div className="ea-split-copy">
              <p className="ea-kicker">High-Stakes Training</p>
              <h2 id="ea-simulator-title">The Ultimate Simulation Engine.</h2>
              <p>
                Prepare for the most brutal academic trials. Build advanced
                cloze-deletion decks with custom distractors to forge your active
                recall under absolute pressure. Whether conquering complex
                anatomy or advanced theorems, this high-performance training
                ground is engineered to make you infallible.
              </p>
            </div>
            <div className="ea-split-media">
              <img
                className="ea-shot"
                src="/images/simulator.png"
                alt="Excellence Absolue Simulator — cloze deletion training under pressure"
                width={1800}
                height={1120}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Epilogue — final conversion before legal footer */}
      <section
        className="ea-epilogue"
        id="epilogue"
        aria-labelledby="ea-epilogue-quote"
      >
        <div className="ea-shell ea-epilogue-inner">
          <motion.blockquote
            id="ea-epilogue-quote"
            className="ea-epilogue-quote"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={revealInView}
          >
            Time is irrevocable, and we know it.
          </motion.blockquote>
          {SHOW_MAC_APP_STORE_CTA ? (
            <motion.div
              className="ea-epilogue-cta"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUpDelay}
            >
              <a
                href={MAC_APP_STORE_URL}
                className="ea-cta ea-cta-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AppleGlyph />
                Download on the App Store
              </a>
            </motion.div>
          ) : null}
        </div>
      </section>
    </>
  );
}
