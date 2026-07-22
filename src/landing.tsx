import { useState, type MouseEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { Brain } from "lucide-react";

const MAC_DOWNLOAD_URL =
  "https://github.com/davidlevanoporras-prog/estudio-app-landing/releases/download/v1.0.0/Excellence.Absolue_1.0.0_aarch64.dmg";

const LEMON_SQUEEZY_CHECKOUT =
  "https://excellenceabsolue.lemonsqueezy.com/checkout/buy/d967ee67-1653-4c34-8948-18fd57f41366";

const reveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const revealSlow: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
  },
};

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.33 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 5.5 10.5 4.4v7.1H3V5.5zm0 13 7.5 1.1v-7.2H3v6.1zM11.5 4.25 21 3v8.5h-9.5V4.25zM11.5 20.9 21 22V12.5h-9.5v8.4z" />
    </svg>
  );
}

/**
 * Landing — Dark Luxury + Freemium.
 * Hero: descargas gratuitas. Debajo: ciencia + muro Pro (Lemon Squeezy).
 */
export default function Landing() {
  const [windowsNotice, setWindowsNotice] = useState(false);

  const handleWindowsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setWindowsNotice(true);
    window.setTimeout(() => setWindowsNotice(false), 4200);
  };

  return (
    <div className="relative w-full bg-[#050505] text-[#e8e6e3]">
      {/* ═══ HERO — 100vh, coreografía + CTAs de descarga ═══ */}
      <section className="relative h-[100vh] w-full overflow-hidden">
        {/* Fase 2 — Logo: emerge al centro cuando el texto llega a la base */}
        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.5,
              delay: 2.0,
              ease: "easeOut",
            }}
          >
            <div
              className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl sm:h-36 sm:w-36"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 80px rgba(0,0,0,0.55)",
              }}
            >
              <Brain
                className="h-12 w-12 text-[#f2f0ec] sm:h-14 sm:w-14"
                strokeWidth={1.15}
                aria-hidden
              />
              <span className="sr-only">Excellence Absolue</span>
            </div>
          </motion.div>
        </div>

        {/* Descargas gratuitas — emergen tras la coreografía del logo */}
        <motion.div
          className="absolute inset-x-0 top-[calc(50%+7.5rem)] z-30 flex flex-col items-center gap-3 px-4 sm:top-[calc(50%+9rem)] sm:flex-row sm:justify-center sm:gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 3.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href={MAC_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[220px] items-center justify-center gap-2.5 rounded-full border border-white/25 bg-gradient-to-b from-white/[0.12] to-white/[0.02] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] text-[#f2f0ec] uppercase backdrop-blur-xl transition-all duration-500 hover:border-white/45 hover:from-white/[0.18] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <AppleIcon className="h-4 w-4 shrink-0" />
            Descargar para macOS
          </a>
          <a
            href="#windows-coming-soon"
            onClick={handleWindowsClick}
            className="inline-flex min-w-[220px] items-center justify-center gap-2.5 rounded-full border border-white/15 bg-transparent px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] text-[#c8c5bf] uppercase backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-white/[0.04] hover:text-[#f2f0ec]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <WindowsIcon className="h-3.5 w-3.5 shrink-0" />
            Descargar para Windows
          </a>
        </motion.div>

        {windowsNotice ? (
          <p
            role="status"
            className="absolute inset-x-0 top-[calc(50%+14rem)] z-30 px-4 text-center text-xs font-light tracking-wide text-[#8a8782] sm:top-[calc(50%+13.5rem)]"
          >
            Versión para Windows en camino. Disponible próximamente.
          </p>
        ) : null}
        {/* Fase 1 — Texto: aparece en el centro y desciende a bottom-10 */}
        <motion.h1
          className="pointer-events-none absolute inset-x-0 z-20 px-4 text-center text-2xl font-light tracking-[0.28em] text-[#f2f0ec] uppercase sm:text-4xl md:text-5xl lg:text-6xl"
          style={{
            fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
          }}
          initial={{
            top: "50%",
            y: "-50%",
            opacity: 0,
            filter: "blur(12px)",
          }}
          animate={{
            top: ["50%", "50%", "100%"],
            y: ["-50%", "-50%", "calc(-100% - 2.5rem)"],
            opacity: [0, 1, 1],
            filter: ["blur(12px)", "blur(0px)", "blur(0px)"],
          }}
          transition={{
            duration: 2.5,
            ease: "circOut",
            times: [0, 0.38, 1],
          }}
        >
          Excellence Absolue
        </motion.h1>
      </section>

      {/* ═══ SECCIÓN 1 — Arquitectura Cognitiva ═══ */}
      <section className="relative mx-auto max-w-6xl px-6 py-32 sm:px-10 sm:py-40 lg:px-12 lg:py-48">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          className="mb-24 text-center sm:mb-32"
        >
          <p className="mb-5 text-[10px] font-medium tracking-[0.4em] text-white/35 uppercase">
            Ciencia aplicada
          </p>
          <h2
            className="text-3xl font-light tracking-[0.12em] text-[#f2f0ec] uppercase sm:text-4xl"
            style={{
              fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
            }}
          >
            La Arquitectura Cognitiva
          </h2>
        </motion.div>

        {/* Bloque A — Flashcards: texto izq / captura der */}
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-md lg:pr-4"
          >
            <p className="mb-6 text-[10px] font-medium tracking-[0.35em] text-white/40 uppercase">
              Repetición Espaciada
            </p>
            <p className="text-base leading-[1.85] font-light text-[#8a8782] sm:text-lg">
              El motor algorítmico interviene la Curva del Olvido de Ebbinghaus
              en el instante exacto en que la memoria empieza a degradarse.
              Cada tarjeta resurge cuando el cerebro está a punto de soltar —
              retención absoluta, sin repetición ciega.
            </p>
          </motion.div>

          <motion.div
            variants={revealSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1.5 sm:p-2"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <img
              src="/captura-flashcards.png"
              alt="Flashcards Dashboard"
              className="h-full w-full rounded-xl border border-zinc-800/50 object-cover shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Bloque B — Simulador: captura izq / texto der (zig-zag) */}
        <div className="mt-28 grid items-center gap-14 sm:mt-36 lg:mt-44 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={revealSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="relative order-2 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1.5 sm:p-2 lg:order-1"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <img
              src="/captura-simulator.png"
              alt="Simulator Interface"
              className="h-full w-full rounded-xl border border-zinc-800/50 object-cover shadow-2xl"
            />
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="order-1 max-w-md lg:order-2 lg:justify-self-end lg:pl-4"
          >
            <p className="mb-6 text-[10px] font-medium tracking-[0.35em] text-white/40 uppercase">
              Estrés Controlado
            </p>
            <p className="text-base leading-[1.85] font-light text-[#8a8782] sm:text-lg">
              Desensibilización sistemática bajo presión calibrada. El
              Simulador evalúa el recuerdo activo en condiciones de examen —
              fallar no es castigo: es el ensayo que convierte la ansiedad en
              dominio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2 — Acceso / Pricing ═══ */}
      <section className="relative border-t border-white/[0.06] px-6 py-32 sm:px-10 sm:py-40 lg:py-48">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,255,255,0.03), transparent 60%)",
          }}
        />

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          className="relative mx-auto max-w-xl text-center"
        >
          <p className="mb-8 text-[10px] font-medium tracking-[0.4em] text-white/35 uppercase">
            El Acceso
          </p>

          <h2
            className="text-3xl font-light tracking-[0.18em] text-[#f2f0ec] uppercase sm:text-4xl md:text-[2.75rem]"
            style={{
              fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
            }}
          >
            Excellence Pro - Licencia
          </h2>

          <p
            className="mt-12 text-6xl font-light tracking-tight text-[#f2f0ec] sm:text-7xl"
            style={{
              fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
            }}
          >
            $5.00
            <span className="ml-2 text-base font-light tracking-[0.2em] text-[#8a8782] uppercase">
              / mes
            </span>
          </p>

          <ul className="mx-auto mt-14 max-w-sm space-y-5 text-left text-sm font-light tracking-wide text-[#8a8782] sm:text-base">
            {[
              "Generación de tarjetas con IA",
              "Simulador inteligente bajo presión",
              "Asistente RAG local — privacidad total",
              "Temas premium y mapa de calor avanzado",
            ].map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-px w-4 shrink-0 bg-white/35"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href={LEMON_SQUEEZY_CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-16 inline-flex items-center justify-center rounded-full border border-white/25 bg-gradient-to-b from-white/[0.08] to-transparent px-10 py-3.5 text-[11px] font-medium tracking-[0.2em] text-[#f2f0ec] uppercase transition-all duration-500 hover:border-white/45 hover:from-white/[0.14] hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Desbloquear Pro - $5.00/mes
          </a>

          <p className="mx-auto mt-5 max-w-xs text-xs font-light leading-relaxed tracking-wide text-[#6a6762]">
            Recibirás tu clave de activación al instante por correo electrónico.
          </p>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.05] px-6 py-12 text-center">
        <p className="text-[10px] tracking-[0.22em] text-white/25 uppercase">
          © {new Date().getFullYear()} Excellence Absolue
        </p>
      </footer>
    </div>
  );
}
