import { motion, type Variants } from "framer-motion";
import { Brain } from "lucide-react";

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

/**
 * Landing — Dark Luxury.
 * Hero cinematográfico intacto (Fase 1 + 2). Debajo: ciencia + pricing con scroll.
 */
export default function Landing() {
  return (
    <div className="relative w-full bg-[#050505] text-[#e8e6e3]">
      {/* ═══ HERO — 100vh, coreografía original sin cambios ═══ */}
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
            className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl sm:h-80"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-[11px] font-medium tracking-[0.28em] text-white/30 uppercase">
              Captura Flashcards
            </span>
          </motion.div>
        </div>

        {/* Bloque B — Simulador: captura izq / texto der (zig-zag) */}
        <div className="mt-28 grid items-center gap-14 sm:mt-36 lg:mt-44 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={revealSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="order-2 flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl sm:h-80 lg:order-1"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-[11px] font-medium tracking-[0.28em] text-white/30 uppercase">
              Captura Simulador
            </span>
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
            className="text-3xl font-light tracking-[0.22em] text-[#f2f0ec] uppercase sm:text-4xl md:text-5xl"
            style={{
              fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
            }}
          >
            Excellence Pro
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

          <button
            type="button"
            className="mt-16 inline-flex items-center justify-center rounded-full border border-white/25 bg-gradient-to-b from-white/[0.08] to-transparent px-10 py-3.5 text-[11px] font-medium tracking-[0.28em] text-[#f2f0ec] uppercase transition-all duration-500 hover:border-white/45 hover:from-white/[0.14] hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Adquirir Licencia
          </button>
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
