import Landing from "./landing";

/**
 * Raíz de producción (marketing): la URL `/` muestra la Landing Page.
 * El Dashboard interno no se monta aquí — sin splash, privacy gate ni onboarding.
 */
export default function App() {
  return <Landing />;
}
