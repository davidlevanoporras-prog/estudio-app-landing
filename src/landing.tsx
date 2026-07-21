/**
 * Landing — Dark Luxury
 * Obsidiana · platino · oro cepillado. Un solo archivo, sin lógica de negocio.
 */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased selection:bg-[#D4AF37]/25 selection:text-white"
      style={{
        fontFamily:
          "'Outfit', 'Helvetica Neue', 'Segoe UI', ui-sans-serif, system-ui, sans-serif",
        backgroundColor: "#0a0a0a",
        color: "#e8e6e3",
      }}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");
      `}</style>

      {/* Atmósfera — brillos monocromáticos sutiles */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -8%, rgba(212,175,55,0.07), transparent 55%), radial-gradient(ellipse 40% 30% at 90% 10%, rgba(255,255,255,0.03), transparent 50%)",
        }}
      />

      {/* ── Nav mínima ── */}
      <header className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <span className="text-[11px] font-medium tracking-[0.32em] text-white/90 uppercase">
            Estudio
          </span>
          <span className="hidden text-[10px] tracking-[0.28em] text-white/35 uppercase sm:inline">
            Excellence absolue
          </span>
        </div>
      </header>

      <main className="relative z-10">
        {/* ── 1. Hero ── */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-20 text-center sm:px-8 sm:pt-32 sm:pb-24">
          <p className="mb-8 text-[10px] font-medium tracking-[0.4em] text-[#D4AF37]/80 uppercase">
            Software de alto rendimiento cognitivo
          </p>

          <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-[#f5f4f2] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Rendimiento Cognitivo Absoluto
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed font-light text-[#8a8782] sm:text-lg">
            Domina volúmenes masivos de información con un motor de repetición
            espaciada y asistencia inteligente — diseñado para quienes no
            negocian con la mediocridad.
          </p>

          <a
            href="#precios"
            className="group relative mt-12 inline-flex items-center justify-center overflow-hidden rounded-full px-9 py-3.5 text-[11px] font-semibold tracking-[0.22em] text-[#0a0a0a] uppercase transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background:
                "linear-gradient(135deg, #f0e6c8 0%, #D4AF37 45%, #b8962e 100%)",
              boxShadow:
                "0 0 0 1px rgba(212,175,55,0.35), 0 8px 32px rgba(212,175,55,0.22)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            Obtener Acceso Anticipado
          </a>
        </section>

        {/* ── 2. Social Proof ── */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-6 py-8 sm:flex-row sm:gap-5 sm:px-8">
            <div
              className="flex items-center gap-1"
              aria-label="5 de 5 estrellas"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 fill-[#D4AF37]"
                  aria-hidden
                >
                  <path d="M10 1.5l2.35 5.1 5.55.55-4.2 3.75 1.25 5.4L10 13.6l-4.95 2.7 1.25-5.4-4.2-3.75 5.55-.55L10 1.5z" />
                </svg>
              ))}
            </div>
            <div className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />
            <p className="text-[10px] font-medium tracking-[0.35em] text-[#c8c5bf] uppercase">
              Excelente
            </p>
            <p className="text-[10px] tracking-[0.18em] text-[#6b6864] uppercase">
              · Valoración de early adopters
            </p>
          </div>
        </section>

        {/* ── 3. Precios ── */}
        <section
          id="precios"
          className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
        >
          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] font-medium tracking-[0.35em] text-[#D4AF37]/75 uppercase">
              Acceso
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f5f4f2] sm:text-4xl">
              Elige tu nivel de dominio
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm font-light text-[#8a8782]">
              Dos ediciones. Una filosofía: claridad absoluta bajo presión.
            </p>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
            {/* Standard */}
            <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl sm:p-10">
              <p className="text-[10px] font-medium tracking-[0.3em] text-white/40 uppercase">
                Standard
              </p>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#f5f4f2]">
                Lista de espera
              </p>
              <p className="mt-2 text-sm font-light text-[#8a8782]">
                Acceso base cuando abra la siguiente cohorte.
              </p>

              <ul className="mt-10 flex-1 space-y-4 text-sm text-[#a8a59f]">
                {[
                  "Creación manual de tarjetas",
                  "Repetición espaciada ilimitada",
                  "Modo offline completo",
                  "Interfaz Dark Luxury",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 text-white/30" aria-hidden>
                      —
                    </span>
                    <span className="font-light">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-10 w-full rounded-full border border-white/15 bg-white/[0.04] py-3.5 text-[11px] font-medium tracking-[0.22em] text-[#c8c5bf] uppercase transition-colors duration-300 hover:border-white/30 hover:text-white"
              >
                Unirse a la lista
              </button>
            </article>

            {/* Premium */}
            <article
              className="relative flex flex-col rounded-2xl border border-[#D4AF37]/35 bg-white/[0.05] p-8 backdrop-blur-xl sm:p-10"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(212,175,55,0.12), 0 0 60px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Resplandor dorado */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-80"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(212,175,55,0.22), transparent 40%, transparent 60%, rgba(212,175,55,0.1))",
                }}
              />

              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-medium tracking-[0.3em] text-[#D4AF37] uppercase">
                  Premium
                </p>
                <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
                  Edición Limitada
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-4xl font-semibold tracking-tight text-[#f5f4f2]">
                  $4.99
                  <span className="ml-1 text-base font-light text-[#8a8782]">
                    /mes
                  </span>
                </p>
                <p className="text-sm font-light text-[#6b6864] line-through decoration-white/25">
                  $59.88/año
                </p>
              </div>
              <p className="mt-2 text-sm font-light text-[#8a8782]">
                Anclaje anual mostrado a precio de lista — ahorra con licencia
                mensual Pro.
              </p>

              <ul className="mt-10 flex-1 space-y-4 text-sm text-[#c8c5bf]">
                {[
                  "Generador de tarjetas con IA",
                  "Simulador inteligente (cloze)",
                  "Asistente RAG local — privacidad",
                  "Temas premium y mapa de calor",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 text-[#D4AF37]" aria-hidden>
                      ◆
                    </span>
                    <span className="font-light">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="group relative mt-10 w-full overflow-hidden rounded-full py-3.5 text-[11px] font-semibold tracking-[0.22em] text-[#0a0a0a] uppercase transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(135deg, #f0e6c8 0%, #D4AF37 45%, #b8962e 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(212,175,55,0.4), 0 10px 36px rgba(212,175,55,0.28)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                Asegurar Licencia Pro
              </button>
            </article>
          </div>
        </section>
      </main>

      {/* Footer mínimo */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row sm:px-8">
          <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
            © {new Date().getFullYear()} Estudio
          </p>
          <div className="flex gap-8 text-[10px] tracking-[0.18em] text-white/30 uppercase">
            <a href="#legal" className="transition-colors hover:text-white/60">
              Privacidad
            </a>
            <a href="#legal" className="transition-colors hover:text-white/60">
              Términos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
