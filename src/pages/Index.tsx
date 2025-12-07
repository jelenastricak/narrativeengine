import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/narrative/Header";
import { NarrativeInput } from "@/components/narrative/NarrativeInput";
import { NarrativeDashboard } from "@/components/narrative/NarrativeDashboard";
import { NarrativeLoadingSkeleton } from "@/components/narrative/NarrativeLoadingSkeleton";
import { AnalysisHistory } from "@/components/narrative/AnalysisHistory";
import { IncrementalUpdateInput } from "@/components/narrative/IncrementalUpdateInput";
import { ModelComparison } from "@/components/narrative/ModelComparison";
import { PresenceIndicator } from "@/components/narrative/PresenceIndicator";
import { UpgradeModal } from "@/components/narrative/UpgradeModal";
import { OnboardingModal } from "@/components/narrative/OnboardingModal";
import { mockNarrative } from "@/data/mockNarrative";
import { NarrativeModel } from "@/types/narrative";
import { Helmet } from "react-helmet-async";
import { useNarrativeAnalysis } from "@/hooks/useNarrativeAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { usePresence } from "@/hooks/usePresence";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, History, Download, FileJson, Plus, Trash2, Crown, HelpCircle, Copy, Link2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { exportToJSON, exportToPDF } from "@/utils/exportAnalysis";

const ONBOARDING_KEY = "narrative-engine-onboarding-seen";

interface ComparisonItem {
  id: string;
  model: NarrativeModel;
  created_at: string;
  input_text: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<NarrativeModel | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showIncrementalInput, setShowIncrementalInput] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ older: ComparisonItem; newer: ComparisonItem } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastInputText, setLastInputText] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { analyzeNarrative, isLoading } = useNarrativeAnalysis();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { saveAnalysis, deleteAnalysis } = useAnalysisHistory();
  const { subscription, canAnalyze, remainingAnalyses, incrementUsage, isLoading: subLoading } = useSubscription();
  const { presence } = usePresence(
    currentAnalysisId,
    user?.id || null,
    user?.email || null
  );
  
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

  // Show onboarding for new users
  useEffect(() => {
    if (user && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };
  
  const handleAnalyze = async (text: string) => {
    // Check if user can analyze
    if (!canAnalyze) {
      setShowUpgradeModal(true);
      return;
    }

    setShowInput(false);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setIsAnalyzing(true);
    setLastInputText(text);
    const result = await analyzeNarrative(text);
    setIsAnalyzing(false);
    if (result) {
      setModel(result);
      // Increment usage for free tier
      if (subscription?.plan === "free") {
        await incrementUsage();
      }
      // Save to history and capture ID
      if (user) {
        const analysisId = await saveAnalysis(text, result, user.id);
        if (analysisId) {
          setCurrentAnalysisId(analysisId);
        }
      }
    } else {
      setShowInput(true);
    }
  };

  const handleIncrementalUpdate = async (text: string) => {
    if (!model) return;
    
    // Check if user can analyze (paid plans or still has free analyses)
    if (!canAnalyze) {
      setShowUpgradeModal(true);
      return;
    }
    
    setShowIncrementalInput(false);
    setIsAnalyzing(true);
    const result = await analyzeNarrative(text, model);
    setIsAnalyzing(false);
    if (result) {
      setModel(result);
      // Increment usage for free tier
      if (subscription?.plan === "free") {
        await incrementUsage();
      }
      // Save merged model to history and capture ID
      if (user) {
        const analysisId = await saveAnalysis(`[Incremental Update]\n${text}`, result, user.id);
        if (analysisId) {
          setCurrentAnalysisId(analysisId);
        }
      }
    }
  };
  
  const handleNewAnalysis = () => {
    setShowInput(true);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setCurrentAnalysisId(null);
  };

  const handleLoadFromHistory = (loadedModel: NarrativeModel, analysisId?: string) => {
    setModel(loadedModel);
    setCurrentAnalysisId(analysisId || null);
    setShowInput(false);
    setShowHistory(false);
    setShowIncrementalInput(false);
    setShowComparison(false);
  };

  const handleCompare = (older: { id: string; analysis_result: NarrativeModel; created_at: string; input_text: string }, newer: { id: string; analysis_result: NarrativeModel; created_at: string; input_text: string }) => {
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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
          <div className="container mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] sm:max-w-none">
                {user.email}
              </span>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                  showHistory ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="w-3 h-3" />
                <span className="hidden xs:inline">History</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Upgrade Button - Only show for free users */}
              {subscription?.plan === "free" && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="btn-hot flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <Crown className="w-3 h-3" />
                  <span>Upgrade</span>
                  {remainingAnalyses !== null && (
                    <span className="opacity-80">({remainingAnalyses} left)</span>
                  )}
                </button>
              )}
              {/* Plan Badge for paid users */}
              {subscription?.plan !== "free" && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="flex items-center gap-1 text-xs font-mono text-accent"
                >
                  <Crown className="w-3 h-3" />
                  <span className="uppercase">
                    {subscription?.plan === "lifetime" ? "Lifetime" : "Pro"}
                  </span>
                </button>
              )}
              {/* Help Button */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
                title="How it works"
              >
                <HelpCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden xs:inline">Sign Out</span>
              </button>
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
                <button
                  onClick={() => setShowHistory(false)}
                  className="btn-tactical text-xs"
                >
                  Back
                </button>
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
            <div className="max-w-4xl mx-auto">
              {/* Welcome Panel */}
              <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
                <h2 className="font-display text-xl sm:text-2xl tracking-[0.1em] sm:tracking-[0.15em] text-foreground mb-2">
                  NARRATIVE ANALYSIS
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-body max-w-2xl mx-auto">
                  Input any text—notes, documents, updates, transcripts, market data—and the engine will extract entities, arcs, conflicts, opportunities, risks, and future scenarios.
                </p>
              </div>
              
              <NarrativeInput onSubmit={handleAnalyze} isLoading={isLoading} />
              
              {/* Demo Button */}
              <div className="mt-4 sm:mt-6 text-center">
                <button 
                  onClick={() => {
                    setModel(mockNarrative);
                    setShowInput(false);
                  }}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-body underline underline-offset-4 transition-colors"
                >
                  Load demo narrative model (free preview)
                </button>
              </div>
            </div>
          ) : isAnalyzing ? (
            <NarrativeLoadingSkeleton />
          ) : (
            <>
              {/* Analysis Controls */}
              <div className="mb-6 sm:mb-8 border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div>
                      <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">
                        Active Narrative Model
                      </span>
                      <p className="text-xs sm:text-sm text-foreground font-mono">
                        {model?.entities.length} entities • {model?.current_arcs.length} arcs • {model?.conflicts.length} conflicts
                      </p>
                    </div>
                    {currentAnalysisId && user && (
                      <PresenceIndicator
                        users={presence.users}
                        currentUserId={user.id}
                        isConnected={presence.isConnected}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Download Dropdown */}
                    <div className="relative group">
                      <button
                        className="btn-hot flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        title="Download Analysis"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                        {/* Share Link - only if analysis is saved */}
                        {currentAnalysisId && (
                          <button
                            onClick={async () => {
                              // First, enable sharing
                              const { error } = await supabase
                                .from("narrative_analyses")
                                .update({ is_shared: true })
                                .eq("id", currentAnalysisId);
                              
                              if (error) {
                                import("sonner").then(({ toast }) => {
                                  toast.error("Failed to enable sharing");
                                });
                                return;
                              }
                              
                              const shareUrl = `${window.location.origin}/shared/${currentAnalysisId}`;
                              navigator.clipboard.writeText(shareUrl);
                              import("sonner").then(({ toast }) => {
                                toast.success("Share link copied to clipboard");
                              });
                            }}
                            className="w-full px-3 py-2 text-xs font-mono text-left hover:bg-muted flex items-center gap-2 border-b border-border"
                          >
                            <Link2 className="w-3 h-3" />
                            Share Link
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (model) {
                              navigator.clipboard.writeText(JSON.stringify(model, null, 2));
                              import("sonner").then(({ toast }) => {
                                toast.success("Copied to clipboard");
                              });
                            }
                          }}
                          className="w-full px-3 py-2 text-xs font-mono text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Copy className="w-3 h-3" />
                          Copy JSON
                        </button>
                        <button
                          onClick={() => model && exportToJSON(model)}
                          className="w-full px-3 py-2 text-xs font-mono text-left hover:bg-muted flex items-center gap-2"
                        >
                          <FileJson className="w-3 h-3" />
                          JSON File
                        </button>
                        <button
                          onClick={() => model && exportToPDF(model)}
                          className="w-full px-3 py-2 text-xs font-mono text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Download className="w-3 h-3" />
                          PDF File
                        </button>
                      </div>
                    </div>
                    {currentAnalysisId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="btn-tactical flex items-center gap-1 sm:gap-2 text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
                            title="Delete Analysis"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border-border mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display tracking-widest text-sm sm:text-base">DELETE ANALYSIS</AlertDialogTitle>
                            <AlertDialogDescription className="font-body text-xs sm:text-sm">
                              This action cannot be undone. This will permanently delete this narrative analysis from your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="btn-tactical">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAnalysis} className="btn-hot">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <button 
                      onClick={handleNewAnalysis}
                      className="btn-tactical text-xs sm:text-sm"
                    >
                      New
                    </button>
                    <button 
                      onClick={() => setShowIncrementalInput(true)}
                      className="btn-hot flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Updates</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {showIncrementalInput && (
                <div className="mb-8">
                  <IncrementalUpdateInput 
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
    </>
  );
};

export default Index;
