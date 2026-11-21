import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/narrative/Header";
import { NarrativeDashboard } from "@/components/narrative/NarrativeDashboard";
import { NarrativeLoadingSkeleton } from "@/components/narrative/NarrativeLoadingSkeleton";
import { AnalysisHistory } from "@/components/narrative/AnalysisHistory";
import { IncrementalUpdateInput } from "@/components/narrative/IncrementalUpdateInput";
import { ModelComparison } from "@/components/narrative/ModelComparison";
import { OnboardingModal } from "@/components/narrative/OnboardingModal";
import { mockNarrative } from "@/data/mockNarrative";
import { NarrativeModel } from "@/types/narrative";
import { Helmet } from "react-helmet-async";
import { useNarrativeAnalysis } from "@/hooks/useNarrativeAnalysis";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { History, HelpCircle } from "lucide-react";
import { AnalysisToolbar } from "@/components/narrative/AnalysisToolbar";
import { EmptyState } from "@/components/narrative/EmptyState";
import type { SavedAnalysis } from "@/hooks/useAnalysisHistory";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "narrative-engine-onboarding-seen";

interface ComparisonItem {
  id: string;
  model: NarrativeModel;
  created_at: string;
  input_text: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const [updateDraft, setUpdateDraft] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [model, setModel] = useState<NarrativeModel | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showIncrementalInput, setShowIncrementalInput] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ older: ComparisonItem; newer: ComparisonItem } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { analyzeNarrative, isLoading } = useNarrativeAnalysis();
  const { analyses, saveAnalysis, deleteAnalysis } = useAnalysisHistory();

  const handleLoadDemo = useCallback(() => {
    setModel(mockNarrative);
    setIsDemo(true);
    setCurrentAnalysisId(null);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setShowInput(false);
  }, []);

  useEffect(() => {
    if (searchParams.get("demo") === "true") handleLoadDemo();
  }, [searchParams, handleLoadDemo]);

  useEffect(() => {
    if (currentAnalysisId && !analyses.some(a => a.id === currentAnalysisId)) setCurrentAnalysisId(null);
  }, [analyses, currentAnalysisId]);

  // Show onboarding for first-time visitors
  useEffect(() => {
    try { setShowOnboarding(!localStorage.getItem(ONBOARDING_KEY)); }
    catch { setShowOnboarding(true); }
  }, []);

  const handleCloseOnboarding = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* Still close when storage is blocked. */ }
    setShowOnboarding(false);
  };

  const handleAnalyze = async (text: string) => {
    if (isLoading) return;
    setDraft(text);
    setShowInput(false);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setIsAnalyzing(true);
    const result = await analyzeNarrative(text);
    setIsAnalyzing(false);
    if (result) {
      setModel(result);
      setIsDemo(false);
      setCurrentAnalysisId(await saveAnalysis(text, result));
      setDraft("");
    } else {
      setShowInput(true);
    }
  };

  const handleIncrementalUpdate = async (text: string) => {
    if (!model || isLoading) return;
    setUpdateDraft(text);

    setShowIncrementalInput(false);
    setIsAnalyzing(true);
    const result = await analyzeNarrative(text, model);
    setIsAnalyzing(false);
    if (result) {
      setModel(result);
      setCurrentAnalysisId(await saveAnalysis(`${isDemo ? "[Demo-derived Incremental Update]" : "[Incremental Update]"}\n${text}`, result));
      setUpdateDraft("");
    } else {
      setShowIncrementalInput(true);
    }
  };

  const handleNewAnalysis = () => {
    setModel(null);
    setIsDemo(false);
    setShowComparison(false);
    setComparisonData(null);
    setUpdateDraft("");
    setShowInput(true);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setCurrentAnalysisId(null);
  };

  const handleLoadFromHistory = (loadedModel: NarrativeModel, analysisId?: string) => {
    setModel(loadedModel);
    setIsDemo(analyses.find(a => a.id === analysisId)?.input_text.startsWith("[Demo-derived") ?? false);
    setUpdateDraft("");
    setCurrentAnalysisId(analysisId || null);
    setShowInput(false);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setShowComparison(false);
  };

  const handleCompare = (older: SavedAnalysis, newer: SavedAnalysis) => {
    setComparisonData({
      older: { id: older.id, model: older.analysis_result, created_at: older.created_at, input_text: older.input_text },
      newer: { id: newer.id, model: newer.analysis_result, created_at: newer.created_at, input_text: newer.input_text },
    });
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    setComparisonData(null);
  };

  const handleDeleteAnalysis = async () => {
    if (currentAnalysisId) {
      const success = await deleteAnalysis(currentAnalysisId);
      if (success) {
        setModel(null);
        setCurrentAnalysisId(null);
        setShowInput(true);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>The Narrative Engine | Strategic Narrative Intelligence</title>
        <meta name="description" content="Transform any input into dynamic, structured story models with entities, arcs, conflicts, opportunities, risks, and scenarios." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header hasModel={!!model} isDemo={isDemo} />

        {/* Utility bar */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost"
                aria-label="History" disabled={isLoading} onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                  showHistory ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="w-3 h-3" />
                <span className="hidden xs:inline">History</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost"
                aria-label="Help" onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
                title="How it works"
              >
                <HelpCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Help</span>
              </Button>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {showHistory ? (
            <div className="max-w-4xl mx-auto px-0 sm:px-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-display text-base sm:text-lg tracking-[0.15em] text-foreground">
                  ANALYSIS HISTORY
                </h2>
                <Button variant="ghost"
                  onClick={() => setShowHistory(false)}
                  className="btn-tactical text-xs"
                >
                  Back
                </Button>
              </div>
              <AnalysisHistory onLoadAnalysis={handleLoadFromHistory} onCompare={handleCompare} />

              {showComparison && comparisonData && (
                <div className="mt-6">
                  <ModelComparison
                    older={comparisonData.older}
                    newer={comparisonData.newer}
                    onClose={handleCloseComparison}
                  />
                </div>
              )}
            </div>
          ) : showInput ? (
            <EmptyState text={draft} onTextChange={setDraft} onAnalyze={handleAnalyze} onLoadDemo={handleLoadDemo} isLoading={isLoading} />
          ) : isAnalyzing ? (
            <NarrativeLoadingSkeleton />
          ) : (
            <>
              {model && (
                <AnalysisToolbar
                  model={model}
                  isDemo={isDemo}
                  canDelete={!!currentAnalysisId}
                  onDelete={handleDeleteAnalysis}
                  onNew={handleNewAnalysis}
                  onAddUpdates={() => setShowIncrementalInput(true)}
                />
              )}

              {showIncrementalInput && (
                <div className="mb-8">
                  <IncrementalUpdateInput
                    text={updateDraft}
                    onTextChange={setUpdateDraft}
                    onSubmit={handleIncrementalUpdate}
                    onCancel={() => setShowIncrementalInput(false)}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {model && <NarrativeDashboard model={model} />}
            </>
          )}
        </main>

        {/* Footer */}
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

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
    </>
  );
};

export default Index;
