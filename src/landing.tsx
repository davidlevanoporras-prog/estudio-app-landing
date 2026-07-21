import { Brain, Flame, Lock, Puzzle, Sparkles } from "lucide-react";

/**
 * Landing Page — maqueta de venta (Dark + Glass + acentos cobalto/neón).
 * Sin lógica de negocio: solo estructura visual lista para conectar Lemon Squeezy.
 */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden text-slate-100 antialiased"
      style={{
        fontFamily: "'Outfit', 'Segoe UI', ui-sans-serif, system-ui, sans-serif",
        background:
          "radial-gradient(ellipse 90% 60% at 50% -20%, rgba(56, 189, 248, 0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(37, 99, 235, 0.18), transparent 45%), #05070d",
      }}
    >
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap");`}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Brain className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
              Estudio
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a
              href="#caracteristicas"
              className="transition-colors hover:text-sky-300"
            >
              Características
            </a>
            <a href="#precios" className="transition-colors hover:text-sky-300">
              Precios
            </a>
          </nav>

          <a
            href="#descargar"
            className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium tracking-wide text-slate-200 backdrop-blur-md transition-colors hover:border-sky-400/40 hover:text-sky-200 sm:px-4"
          >
            Descargar Gratis
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ── */}
        <section className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
          />

          <p className="mb-5 text-center text-xs font-semibold tracking-[0.28em] text-sky-400/90 uppercase">
            Excellence absolue
          </p>

          <h1 className="mx-auto max-w-4xl text-center text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Memoriza más rápido.{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Aprende sin límites.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-slate-400 sm:text-lg">
            El motor de repetición espaciada con IA integrada para estudiantes
            de alto rendimiento.
          </p>

          <div className="mt-10 flex justify-center">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_32px_rgba(56,189,248,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              Obtener Licencia Pro — $4.99
            </a>
          </div>

          {/* Mockup cristal */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div
              aria-hidden
              className="absolute -inset-px rounded-2xl bg-gradient-to-br from-sky-400/40 via-transparent to-blue-600/30 opacity-70 blur-[1px]"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_0_60px_rgba(37,99,235,0.15)] backdrop-blur-2xl sm:p-4">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-3 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-[10px] tracking-widest text-slate-500 uppercase">
                  estudio.app — dashboard
                </span>
              </div>

              <div className="grid gap-3 pt-3 sm:grid-cols-[140px_1fr]">
                <div className="hidden space-y-2 rounded-xl border border-white/5 bg-black/30 p-3 sm:block">
                  {["Inicio", "Fuentes", "Asistente", "Simulador"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={[
                          "rounded-lg px-2.5 py-2 text-[11px] tracking-wide",
                          i === 2
                            ? "border border-sky-400/30 bg-sky-500/15 text-sky-200"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 sm:p-6">
                  <div className="h-3 w-1/3 rounded bg-sky-400/25" />
                  <div className="h-2 w-2/3 rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[72, 45, 91].map((v) => (
                      <div
                        key={v}
                        className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
                      >
                        <div className="mb-2 h-1.5 w-8 rounded bg-white/15" />
                        <div className="text-lg font-semibold text-sky-300">
                          {v}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex h-24 items-end gap-1.5 rounded-lg border border-white/5 bg-black/20 px-3 pb-3">
                    {[40, 55, 35, 70, 50, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-blue-600/80 to-cyan-400/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="caracteristicas"
          className="mx-auto max-w-6xl px-5 py-20 sm:px-8"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Diseñado para el alto rendimiento
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Tres pilares. Cero distracciones. Todo local cuando importa.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Asistente RAG Local",
                body: "Consulta tus PDFs sin salir del dispositivo. Privacidad total: tu material nunca viaja a la nube.",
              },
              {
                icon: Puzzle,
                title: "Simulador Interactivo",
                body: "Tarjetas cloze con loop punitivo. Fallas → vuelves a intentarlo hasta que el conocimiento se graba.",
              },
              {
                icon: Flame,
                title: "Mapa de Calor",
                body: "Visualiza rachas, puntos ciegos y días de máxima retención. Entrena donde más duele.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(37,99,235,0.08)] backdrop-blur-xl transition-colors hover:border-sky-400/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="precios" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Empieza gratis. Escala cuando estés listo.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Sin compromiso. El plan Pro se activa con una licencia.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* Básico */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                Básico
              </p>
              <p className="mt-3 text-4xl font-semibold text-white">
                Gratis
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-sky-400">✓</span> Creación manual de
                  tarjetas
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-400">✓</span> Repaso ilimitado (SRS)
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-400">✓</span> Modo offline completo
                </li>
              </ul>
              <a
                id="descargar"
                href="#descargar"
                className="mt-8 flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-sky-400/40 hover:text-sky-200"
              >
                Descargar Gratis
              </a>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border border-sky-400/40 bg-gradient-to-b from-sky-500/10 to-white/[0.03] p-7 shadow-[0_0_50px_rgba(56,189,248,0.12)] backdrop-blur-xl">
              <span className="absolute -top-3 right-6 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-0.5 text-[10px] font-semibold tracking-wider text-sky-200 uppercase">
                Recomendado
              </span>
              <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
                Pro
              </p>
              <p className="mt-3 text-4xl font-semibold text-white">
                $4.99
                <span className="text-base font-normal text-slate-400">
                  /mes
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-cyan-300">✓</span> Generador de IA
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-300">✓</span> Simulador Inteligente
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-300">✓</span> Temas Premium
                </li>
              </ul>
              {/* Conectar a Lemon Squeezy */}
              <button
                type="button"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(56,189,248,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Obtener Licencia Pro
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-black/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Estudio. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#legal" className="transition-colors hover:text-sky-300">
              Privacidad
            </a>
            <a href="#legal" className="transition-colors hover:text-sky-300">
              Términos
            </a>
            <a href="#legal" className="transition-colors hover:text-sky-300">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
