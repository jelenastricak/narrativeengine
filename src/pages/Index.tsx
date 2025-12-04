import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/narrative/Header";
import { NarrativeInput } from "@/components/narrative/NarrativeInput";
import { NarrativeDashboard } from "@/components/narrative/NarrativeDashboard";
import { mockNarrative } from "@/data/mockNarrative";
import { NarrativeModel } from "@/types/narrative";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [model, setModel] = useState<NarrativeModel | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-load demo if URL param present
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setModel(mockNarrative);
      setShowInput(false);
    }
  }, [searchParams]);
  
  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // For demo, use mock data
    setModel(mockNarrative);
    setShowInput(false);
    setIsLoading(false);
  };
  
  const handleNewAnalysis = () => {
    setShowInput(true);
  };

  return (
    <>
      <Helmet>
        <title>The Narrative Engine | Strategic Narrative Intelligence</title>
        <meta name="description" content="Transform any input into dynamic, structured story models with entities, arcs, conflicts, opportunities, risks, and scenarios." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header hasModel={!!model} />
        
        <main className="container mx-auto px-6 py-8">
          {showInput ? (
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
