import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NarrativeModel } from "@/types/narrative";
import { NarrativeDashboard } from "@/components/narrative/NarrativeDashboard";
import { Header } from "@/components/narrative/Header";
import logo from "@/assets/logo.png";

const SharedAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<NarrativeModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedAnalysis = async () => {
      if (!id) {
        setError("Invalid analysis ID");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("narrative_analyses")
          .select("*")
          .eq("id", id)
          .eq("is_shared", true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Analysis not found or is private");
          setIsLoading(false);
          return;
        }

        setModel(data.analysis_result as unknown as NarrativeModel);
      } catch (err) {
        console.error("Error fetching shared analysis:", err);
        setError("Failed to load analysis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedAnalysis();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-mono">
            LOADING ANALYSIS...
          </p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <>
        <Helmet>
          <title>Analysis Not Found | The Narrative Engine</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Home</span>
          </Link>

          <div className="max-w-md w-full text-center">
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Narrative Engine" className="w-12 h-12 invert mb-4" />
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>

            <h1 className="font-display text-xl tracking-[0.15em] text-foreground mb-4">
              {error === "Analysis not found or is private" ? "PRIVATE OR NOT FOUND" : "ERROR"}
            </h1>

            <p className="text-muted-foreground font-body mb-6">
              {error || "This analysis is not available."}
            </p>

            <Link to="/" className="btn-tactical inline-flex items-center gap-2 py-3 px-6 text-sm">
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shared Analysis | The Narrative Engine</title>
        <meta name="description" content="View a shared narrative analysis from The Narrative Engine." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header hasModel={true} />

        {/* Shared badge */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="uppercase">Shared Analysis</span>
              <span className="text-foreground">•</span>
              <span>{model.entities.length} entities • {model.current_arcs.length} arcs</span>
            </div>
            <Link
              to="/auth"
              className="text-xs text-accent hover:text-accent/80 font-mono transition-colors"
            >
              Sign in to analyze your own
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <NarrativeDashboard model={model} />
        </main>

        <footer className="border-t border-border mt-8 sm:mt-12">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <span className="text-xs text-muted-foreground font-mono">
              NARRATIVE ENGINE v1.0
            </span>
            <span className="text-xs text-muted-foreground font-body">
              Strategic Intelligence System
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SharedAnalysis;
