import { lazy, Suspense, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// Lazy load pages with error handling
const Index = lazy(() => 
  import("./pages/Index").catch(() => {
    return { default: () => <LazyLoadError page="Index" /> };
  })
);
const Auth = lazy(() => 
  import("./pages/Auth").catch(() => {
    return { default: () => <LazyLoadError page="Auth" /> };
  })
);
const NotFound = lazy(() => 
  import("./pages/NotFound").catch(() => {
    return { default: () => <LazyLoadError page="NotFound" /> };
  })
);

// Error component for failed lazy loads
function LazyLoadError({ page }: { page: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl uppercase tracking-wider text-accent mb-4">
          LOAD ERROR
        </h1>
        <p className="text-muted-foreground font-body mb-6">
          Failed to load {page} page. This may be a temporary issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-tactical"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

// Error boundary for Suspense
interface ErrorBoundaryState {
  hasError: boolean;
}

class SuspenseErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="font-display text-xl uppercase tracking-wider text-accent mb-4">
              RENDER ERROR
            </h1>
            <p className="text-muted-foreground font-body mb-6">
              Something went wrong loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-tactical"
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

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground font-mono tracking-widest">
      INITIALIZING...
    </div>
  </div>
);

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SuspenseErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </SuspenseErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
