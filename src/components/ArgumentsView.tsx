import { Brain, Quote, Scale, Sigma, TrendingDown, type LucideIcon } from "lucide-react";

/**
 * "Argumentos" — la defensa científica y de marketing de la app, en formato
 * de manifiesto académico. 100% autónoma (ningún prop, ningún estado): el
 * mismo patrón que `SourcesView.tsx` — el contenido vive hardcodeado en
 * español, sin pasar por el diccionario de 5 idiomas (`i18n/dictionary.ts`),
 * porque es prosa larga y editorial, no microcopy de interfaz.
 *
 * Tipografía: Playfair Display (Serif, vía `style` inline — igual que
 * `OnboardingView`/`SplashScreenView`) para los títulos de marca en las TRES
 * jerarquías ("Argumentos", los dos subtítulos de sección), Inter (Sans,
 * heredada del body) para toda la prosa de lectura. No se usa
 * `prose`/`prose-invert` de `@tailwindcss/typography` — el plugin no está
 * instalado en este proyecto (Tailwind v4, sin plugins) — en su lugar, cada
 * bloque de texto es un "contenedor estilizado" a mano (ancho de lectura
 * acotado, `leading-relaxed`, jerarquía de grises platino/ámbar ya definida
 * por los tokens del tema activo).
 */

type Pillar = {
  number: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  body: string;
  footnote: string;
};

const pillars: Pillar[] = [
  {
    number: "I",
    icon: Brain,
    title: "Recuerdo Activo",
    subtitle: "Active Recall",
    body: "Leer un apunte por quinta vez se siente productivo y no lo es: es reconocimiento pasivo, la ilusión de saber. El giro de la tarjeta —el instante exacto en que tu cerebro busca la respuesta antes de verla— es un evento neurológico distinto: ese esfuerzo mecánico de extraer la información, no de re-exponerse a ella, es lo que consolida las vías sinápticas de la memoria de largo plazo. Cada tarjeta de esta app está diseñada para forzar ese esfuerzo de recuperación, nunca para evitarlo.",
    footnote: "Karpicke & Roediger (2008) — la práctica de recuperación supera a la relectura incluso cuando el estudiante siente lo contrario.",
  },
  {
    number: "II",
    icon: TrendingDown,
    title: "La Curva del Olvido",
    subtitle: "Hermann Ebbinghaus",
    body: "En 1885, Ebbinghaus demostró que la memoria no decae de forma lineal: cae en picado en las primeras horas y luego se aplana, una exponencial pura. Ignorar esa curva —como hace cualquier planificador basado en fechas de calendario— garantiza reestudiar información que ya se perdió. Esta app anticipa matemáticamente ese decaimiento: cada repetición se dispara justo antes de la caída, aplanando la curva un poco más en cada ciclo.",
    footnote: "Ebbinghaus (1885), Über das Gedächtnis — el decaimiento exponencial que toda repetición espaciada intenta contrarrestar.",
  },
  {
    number: "III",
    icon: Sigma,
    title: "Repetición Espaciada y Algoritmo SM-2",
    subtitle: "Spaced Repetition",
    body: "Un temporizador rígido asume que toda la materia merece el mismo minuto. El algoritmo SM-2 asume lo contrario: su motor dinámico calcula, tarjeta por tarjeta, el intervalo exacto —el umbral crítico— en el que la probabilidad de olvido está a punto de dispararse, y obliga al usuario a repasar justo ahí, ni un día antes (desperdicio) ni un día después (olvido). El resultado es matemático, no anecdótico: el mismo dominio, en una fracción del tiempo de estudio.",
    footnote: "Wozniak (1990) — SuperMemo SM-2: el factor de facilidad (EF) ajusta el intervalo tras cada respuesta, tarjeta por tarjeta.",
  },
];

export default function ArgumentsView() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 pb-12">
      {/* Encabezado */}
      <header className="flex flex-col gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
          <Scale className="h-6 w-6" strokeWidth={1.75} />
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Ciencia · Diseño · Evidencia
          </p>
          <h1
            className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Argum<span className="text-primary">entos</span>
          </h1>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          No es una promesa de marketing: es una defensa razonada, punto por
          punto, de por qué esta herramienta está construida como está — y
          por qué las alternativas de siempre se han quedado obsoletas.
        </p>
      </header>

      {/* Sección 1: El Manifiesto de Superioridad */}
      <section className="flex flex-col gap-6">
        <h2
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          El Manifiesto de Superioridad
        </h2>

        <div className="glow-card relative overflow-hidden p-8 sm:p-10">
          <Quote
            className="pointer-events-none absolute -top-3 -left-3 h-20 w-20 text-primary/10"
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-5 border-l-2 border-primary/40 pl-6 sm:pl-8">
            <p className="text-base leading-relaxed text-secondary-foreground italic sm:text-lg">
              Un temporizador que corre igual para todos los estudiantes, en
              todos los temas, es una reliquia de la era analógica —
              conveniente para programar, ciego a cómo funciona realmente la
              memoria humana.
            </p>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Las apps de estudio convencionales miden el esfuerzo en
              minutos porque los minutos son fáciles de mostrar en una
              barra de progreso. Pero el minuto veinte estudiando una
              tarjeta ya dominada vale cero, y el minuto que falta para
              revisar la tarjeta que estás a punto de olvidar vale
              muchísimo. Un reloj no distingue eso. Un algoritmo, sí.
            </p>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Por eso <span className="font-medium text-foreground">
              Excellence absolue</span> rechaza sin rodeos los dos vicios de
              siempre: el cronómetro arbitrario, que mide esfuerzo en minutos
              en vez de en memoria consolidada, y la relectura pasiva, que se
              siente como estudio y es apenas reconocimiento. En su lugar,
              opera exclusivamente sobre tres cuerpos de evidencia
              neurobiológica —recuerdo activo, la curva del olvido y
              repetición espaciada— que llevan más de un siglo describiendo,
              con precisión creciente, cómo se forma y cómo se pierde una
              memoria. Cada decisión de diseño, desde el giro de una
              tarjeta hasta la fecha exacta de su próxima repetición, es la
              traducción directa de esa evidencia a una interfaz. Nada aquí
              es estético sin ser también funcional.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2: Fundamentos Científicos */}
      <section className="flex flex-col gap-6">
        <div>
          <h2
            className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Fundamentos Científicos
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Tres pilares, tres décadas de literatura cada uno, un solo
            propósito: que el tiempo que le das a esta app se convierta en
            memoria de largo plazo, no en la ilusión de haber estudiado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.number} {...pillar} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PillarCard({ number, icon: Icon, title, subtitle, body, footnote }: Pillar) {
  return (
    <article className="glow-card flex flex-col gap-4 p-6 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-card-rest bg-primary-soft text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-semibold tracking-wider text-icon-muted">
          {number}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-xs font-medium tracking-wide text-primary/80 uppercase">
          {subtitle}
        </p>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>

      <p className="border-t border-wenge-border-subtle pt-3 text-xs leading-relaxed text-secondary-foreground/80 italic">
        {footnote}
      </p>
    </article>
  );
}
