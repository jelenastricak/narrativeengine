import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/narrative/Header";
import { NarrativeInput } from "@/components/narrative/NarrativeInput";
import { NarrativeDashboard } from "@/components/narrative/NarrativeDashboard";
import { NarrativeLoadingSkeleton } from "@/components/narrative/NarrativeLoadingSkeleton";
import { AnalysisHistory } from "@/components/narrative/AnalysisHistory";
import { mockNarrative } from "@/data/mockNarrative";
import { NarrativeModel } from "@/types/narrative";
import { Helmet } from "react-helmet-async";
import { useNarrativeAnalysis } from "@/hooks/useNarrativeAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { LogOut, History } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<NarrativeModel | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastInputText, setLastInputText] = useState("");
  const { analyzeNarrative, isLoading } = useNarrativeAnalysis();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { saveAnalysis } = useAnalysisHistory();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Auto-load demo if URL param present
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setModel(mockNarrative);
      setShowInput(false);
    }
  }, [searchParams]);
  
  const handleAnalyze = async (text: string) => {
    setShowInput(false);
    setShowHistory(false);
    setIsAnalyzing(true);
    setLastInputText(text);
    const result = await analyzeNarrative(text);
    setIsAnalyzing(false);
    if (result) {
      setModel(result);
      // Save to history
      if (user) {
        await saveAnalysis(text, result, user.id);
      }
    } else {
      setShowInput(true);
    }
  };
  
  const handleNewAnalysis = () => {
    setShowInput(true);
    setShowHistory(false);
  };

  const handleLoadFromHistory = (loadedModel: NarrativeModel) => {
    setModel(loadedModel);
    setShowInput(false);
    setShowHistory(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-mono">
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>The Narrative Engine | Strategic Narrative Intelligence</title>
        <meta name="description" content="Transform any input into dynamic, structured story models with entities, arcs, conflicts, opportunities, risks, and scenarios." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header hasModel={!!model} />
        
        {/* User bar */}
        <div className="border-b border-border">
          <div className="container mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                {user.email}
              </span>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                  showHistory ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="w-3 h-3" />
                History
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
        
        <main className="container mx-auto px-6 py-8">
          {showHistory ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg tracking-[0.15em] text-foreground">
                  ANALYSIS HISTORY
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="btn-tactical text-xs"
                >
                  Back
                </button>
              </div>
              <AnalysisHistory onLoadAnalysis={handleLoadFromHistory} />
            </div>
          ) : showInput ? (
            <div className="max-w-4xl mx-auto">
              {/* Welcome Panel */}
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl tracking-[0.15em] text-foreground mb-2">
                  NARRATIVE ANALYSIS
                </h2>
                <p className="text-muted-foreground font-body max-w-2xl mx-auto">
                  Input any text—notes, documents, updates, transcripts, market data—and the engine will extract entities, arcs, conflicts, opportunities, risks, and future scenarios into a structured narrative model.
                </p>
              </div>
              
              <NarrativeInput onSubmit={handleAnalyze} isLoading={isLoading} />
              
              {/* Demo Button */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => handleAnalyze("Demo analysis")}
                  className="text-sm text-muted-foreground hover:text-foreground font-body underline underline-offset-4 transition-colors"
                >
                  Load demo narrative model
                </button>
              </div>
            </div>
          ) : isAnalyzing ? (
            <NarrativeLoadingSkeleton />
          ) : (
            <>
              {/* Analysis Controls */}
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">
                    Active Narrative Model
                  </span>
                  <p className="text-sm text-foreground font-mono">
                    {model?.entities.length} entities • {model?.current_arcs.length} arcs • {model?.conflicts.length} conflicts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleNewAnalysis}
                    className="btn-tactical"
                  >
                    New Analysis
                  </button>
                  <button className="btn-hot">
                    Update Model
                  </button>
                </div>
              </div>
              
              {model && <NarrativeDashboard model={model} />}
            </>
          )}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
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

export default Index;
