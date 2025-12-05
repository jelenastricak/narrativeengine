import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const RELOAD_KEY = "errorBoundary_reloadAttempt";
const MAX_AUTO_RELOADS = 1;

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Auto-reload for dynamic import errors (Vite HMR stale modules)
    const isDynamicImportError = error.message.includes("Failed to fetch dynamically imported module");
    
    if (isDynamicImportError) {
      const reloadAttempts = parseInt(sessionStorage.getItem(RELOAD_KEY) || "0", 10);
      
      if (reloadAttempts < MAX_AUTO_RELOADS) {
        sessionStorage.setItem(RELOAD_KEY, String(reloadAttempts + 1));
        setTimeout(() => window.location.reload(), 500);
      } else {
        // Clear after max attempts so future errors can still auto-reload
        sessionStorage.removeItem(RELOAD_KEY);
      }
    }
  }

  public componentDidMount() {
    // Clear reload counter on successful mount (app loaded correctly)
    sessionStorage.removeItem(RELOAD_KEY);
  }

  private handleReload = () => {
    sessionStorage.removeItem(RELOAD_KEY);
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDynamicImportError = this.state.error?.message.includes("Failed to fetch dynamically imported module");

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-2xl w-full border border-border p-8">
            <h1 className="font-display text-2xl uppercase tracking-wider text-accent mb-4">
              {isDynamicImportError ? "LOADING ERROR" : "APPLICATION ERROR"}
            </h1>
            <p className="font-body text-muted-foreground mb-4">
              {isDynamicImportError 
                ? "A module failed to load. Click reload to try again."
                : "Something went wrong. This may be a temporary issue."}
            </p>
            {this.state.error && (
              <div className="font-mono text-sm text-destructive mb-4 p-4 bg-muted/10 border border-border overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="btn-hot"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
