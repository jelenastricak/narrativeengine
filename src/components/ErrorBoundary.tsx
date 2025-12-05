import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-2xl w-full border border-primary/20 p-8">
            <h1 className="font-oswald text-2xl uppercase tracking-wider text-primary mb-4">
              APPLICATION ERROR
            </h1>
            <div className="font-mono text-sm text-destructive mb-4">
              {this.state.error?.message || "Unknown error"}
            </div>
            <pre className="font-mono text-xs text-muted-foreground overflow-auto max-h-64 p-4 bg-muted/10 border border-primary/10">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 border border-accent text-accent font-oswald uppercase tracking-wider hover:bg-accent hover:text-background transition-colors"
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
