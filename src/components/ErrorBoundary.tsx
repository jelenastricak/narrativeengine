import { Button } from "@/components/ui/button";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (/Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(error.message)) {
      try {
        const key = "narrative-engine-chunk-reload";
        const lastReload = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - lastReload > 60_000) {
          sessionStorage.setItem(key, String(Date.now()));
          window.location.reload();
        }
      } catch { /* Keep the manual reload action available. */ }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-2xl w-full border border-border p-8">
            <h1 className="font-display text-2xl uppercase tracking-wider text-accent mb-4">
              APPLICATION ERROR
            </h1>
            <p className="font-body text-muted-foreground mb-4">
              Something went wrong. Please reload the application.
            </p>
            {this.state.error && (
              <div className="font-mono text-sm text-destructive mb-4 p-4 bg-muted/10 border border-border overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <Button variant="hot"
              onClick={this.handleReload}
              className="btn-hot"
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
