import { useEffect, useState } from "react";
import { Clock, Trash2, Users, GitBranch, Flame, CheckSquare, Square, TrendingUp, Globe } from "lucide-react";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { useAuth } from "@/hooks/useAuth";
import { NarrativeModel } from "@/types/narrative";
import { format } from "date-fns";
import { ShareToggle } from "./ShareToggle";

interface SavedAnalysis {
  id: string;
  user_id: string;
  input_text: string;
  analysis_result: NarrativeModel;
  created_at: string;
  is_shared: boolean;
}

interface AnalysisHistoryProps {
  onLoadAnalysis: (model: NarrativeModel, analysisId?: string) => void;
  onCompare?: (older: SavedAnalysis, newer: SavedAnalysis) => void;
}

export function AnalysisHistory({ onLoadAnalysis, onCompare }: AnalysisHistoryProps) {
  const { analyses, isLoading, fetchAnalyses, deleteAnalysis } = useAnalysisHistory();
  const { user } = useAuth();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length !== 2 || !onCompare) return;
    
    const selected = analyses.filter(a => selectedIds.includes(a.id));
    const sorted = selected.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    onCompare(sorted[0] as SavedAnalysis, sorted[1] as SavedAnalysis);
    setCompareMode(false);
    setSelectedIds([]);
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <div className="border border-border p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="border border-border p-6 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-body">
          No saved analyses yet. Run your first analysis to start building your history.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="border-b border-border px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xs sm:text-sm uppercase tracking-widest text-foreground">
          Analysis History
        </h3>
        {onCompare && (
          <div className="flex items-center gap-2">
            {compareMode ? (
              <>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedIds.length}/2
                </span>
                <button
                  onClick={handleCompare}
                  disabled={selectedIds.length !== 2}
                  className="btn-hot text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare
                </button>
                <button
                  onClick={handleCancelCompare}
                  className="btn-tactical text-xs"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setCompareMode(true)}
                disabled={analyses.length < 2}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors disabled:opacity-50"
              >
                <TrendingUp className="w-3 h-3" />
                <span className="hidden xs:inline">Compare</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="divide-y divide-border max-h-80 sm:max-h-96 overflow-y-auto">
        {analyses.map((analysis) => {
          const isSelected = selectedIds.includes(analysis.id);
          
          return (
            <div
              key={analysis.id}
              className={`p-3 sm:p-4 transition-colors group ${
                compareMode 
                  ? isSelected 
                    ? 'bg-accent/10' 
                    : 'hover:bg-muted/20 cursor-pointer'
                  : 'hover:bg-muted/20'
              }`}
              onClick={compareMode ? () => handleToggleSelect(analysis.id) : undefined}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                {compareMode && (
                  <div className="pt-1 flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
                <button
                  onClick={compareMode ? undefined : () => onLoadAnalysis(analysis.analysis_result, analysis.id)}
                  className="flex-1 text-left min-w-0"
                  disabled={compareMode}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-xs text-muted-foreground font-mono">
                      {format(new Date(analysis.created_at), "MMM d, HH:mm")}
                    </p>
                    {analysis.is_shared && analysis.user_id !== user?.id && (
                      <span className="flex items-center gap-1 text-xs text-primary font-mono">
                        <Globe className="w-3 h-3" />
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-body line-clamp-2 mb-2">
                    {analysis.input_text.substring(0, 100)}
                    {analysis.input_text.length > 100 && "..."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {analysis.analysis_result.entities?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {analysis.analysis_result.current_arcs?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {analysis.analysis_result.conflicts?.length || 0}
                    </span>
                  </div>
                </button>
                {!compareMode && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <ShareToggle
                      analysisId={analysis.id}
                      isShared={analysis.is_shared}
                      isOwner={analysis.user_id === user?.id}
                      onShareChange={() => fetchAnalyses()}
                    />
                    {analysis.user_id === user?.id && (
                      <button
                        onClick={() => deleteAnalysis(analysis.id)}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-accent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Delete analysis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
