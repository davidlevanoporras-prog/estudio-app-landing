import { Component, type ErrorInfo, type ReactNode } from "react";

type ViewErrorBoundaryProps = {
  children: ReactNode;
  /** Etiqueta corta del módulo (para logs / mensaje). */
  moduleName?: string;
};

type ViewErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Contiene fallos de render de una vista sin tumbar toda la app.
 */
export default class ViewErrorBoundary extends Component<
  ViewErrorBoundaryProps,
  ViewErrorBoundaryState
> {
  state: ViewErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ViewErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `[ViewErrorBoundary] ${this.props.moduleName ?? "vista"}:`,
      error,
      info.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glow-card mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl p-8 text-center">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Module unavailable
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Módulo en mantenimiento
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta sección encontró un error inesperado. El resto de la aplicación
            sigue disponible.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="premium-btn rounded-lg border border-primary/50 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
