import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

/**
 * Contiene errores fatales de arranque/runtime para evitar la pantalla en blanco.
 */
export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message?.trim() || "Error inesperado de ejecución.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleDismiss = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B0D0F] p-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141618] p-8 text-center shadow-2xl">
            <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-500 uppercase">
              Excellence Absolue
            </p>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-neutral-100">
              Algo salió mal
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              La aplicación encontró un error y se detuvo de forma segura. Puedes
              reintentar o recargar.
            </p>
            {this.state.message && (
              <p className="mt-4 rounded-lg border border-white/5 bg-black/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-neutral-500">
                {this.state.message}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={this.handleDismiss}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-white/30"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
              >
                Recargar app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
