import { motion } from "framer-motion";
import { Brain } from "lucide-react";

/**
 * Hero cinematográfico — Dark Luxury (Jacob & Co).
 * Una sola pantalla (100vh). Sin scroll. Coreografía en dos fases.
 */
export default function Landing() {
  return (
    <div className="relative h-[100vh] w-full overflow-hidden bg-[#050505]">
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
    </div>
  );
}
