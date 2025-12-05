import { useEffect } from "react";
import { Clock, Trash2, Users, GitBranch, Flame } from "lucide-react";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { NarrativeModel } from "@/types/narrative";
import { format } from "date-fns";

interface AnalysisHistoryProps {
  onLoadAnalysis: (model: NarrativeModel) => void;
}

export function AnalysisHistory({ onLoadAnalysis }: AnalysisHistoryProps) {
  const { analyses, isLoading, fetchAnalyses, deleteAnalysis } = useAnalysisHistory();

  useEffect(() => {
    fetchAnalyses();
  }, []);

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
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-display text-sm uppercase tracking-widest text-foreground">
          Analysis History
        </h3>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="p-4 hover:bg-muted/20 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <button
                onClick={() => onLoadAnalysis(analysis.analysis_result)}
                className="flex-1 text-left"
              >
                <p className="text-xs text-muted-foreground font-mono mb-1">
                  {format(new Date(analysis.created_at), "MMM d, yyyy HH:mm")}
                </p>
                <p className="text-sm text-foreground font-body line-clamp-2 mb-2">
                  {analysis.input_text.substring(0, 150)}
                  {analysis.input_text.length > 150 && "..."}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              <button
                onClick={() => deleteAnalysis(analysis.id)}
                className="p-2 text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete analysis"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
