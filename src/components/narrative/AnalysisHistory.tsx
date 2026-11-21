import { useState } from "react";
import { Clock, Trash2, Users, GitBranch, Flame, TrendingUp } from "lucide-react";
import { useAnalysisHistory, type SavedAnalysis } from "@/hooks/useAnalysisHistory";
import type { NarrativeModel } from "@/types/narrative";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface AnalysisHistoryProps {
  onLoadAnalysis: (model: NarrativeModel, analysisId?: string) => void;
  onCompare?: (older: SavedAnalysis, newer: SavedAnalysis) => void;
}

export function AnalysisHistory({ onLoadAnalysis, onCompare }: AnalysisHistoryProps) {
  const { analyses, deleteAnalysis } = useAnalysisHistory();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const selected = selectedIds.filter(id => analyses.some(a => a.id === id));
  const toggleSelect = (id: string) => setSelectedIds(selected.includes(id)
    ? selected.filter(item => item !== id) : [...selected.slice(-1), id]);
  const cancelCompare = () => { setCompareMode(false); setSelectedIds([]); };
  const compare = () => {
    const items = analyses.filter(a => selected.includes(a.id)).sort((a,b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    const [older, newer] = items;
    if (!older || !newer || !onCompare) return;
    onCompare(older, newer); cancelCompare();
  };
  if (analyses.length === 0) return (
    <div className="border border-border p-6 text-center">
      <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground font-body">No saved analyses yet.</p>
      <p className="text-xs text-muted-foreground mt-2">History is stored only in this browser on this device.</p>
    </div>
  );
  return (
    <div className="border border-border">
      <div className="border-b border-border px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm uppercase tracking-widest">Analysis History</h3>
        {onCompare && <div className="flex items-center gap-2">
          {compareMode ? <>
            <span className="text-xs text-muted-foreground font-mono">{selected.length}/2</span>
            <Button variant="hot" size="sm" onClick={compare} disabled={selected.length !== 2}>Compare</Button>
            <Button variant="tactical" size="sm" onClick={cancelCompare}>Cancel</Button>
          </> : <Button variant="ghost" size="sm" onClick={() => setCompareMode(true)} disabled={analyses.length < 2}>
            <TrendingUp className="w-3 h-3" />Compare
          </Button>}
        </div>}
      </div>
      <p className="px-3 sm:px-4 py-2 text-xs text-muted-foreground border-b border-border">Saved only in this browser on this device.</p>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {analyses.map(analysis => <div key={analysis.id} className={`p-3 sm:p-4 flex items-start gap-3 ${selected.includes(analysis.id) ? "bg-accent/10" : "hover:bg-muted/20"}`}>
          {compareMode && <Checkbox checked={selected.includes(analysis.id)} onCheckedChange={() => toggleSelect(analysis.id)} aria-label={`Select analysis ${analysis.input_text.slice(0, 60)}`} className="mt-1 shrink-0" />}
          <Button variant="ghost" className="flex-1 h-auto p-0 text-left whitespace-normal block hover:bg-transparent" onClick={() => compareMode ? toggleSelect(analysis.id) : onLoadAnalysis(analysis.analysis_result, analysis.id)}>
            <span className="block text-xs text-muted-foreground font-mono mb-1">{format(new Date(analysis.created_at), "MMM d, yyyy HH:mm")}</span>
            <span className="block text-sm font-body line-clamp-2 mb-2">{analysis.input_text.slice(0,100)}{analysis.input_text.length > 100 ? "…" : ""}</span>
            <span className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users />{analysis.analysis_result.entities.length}</span>
              <span className="flex items-center gap-1"><GitBranch />{analysis.analysis_result.current_arcs.length}</span>
              <span className="flex items-center gap-1"><Flame />{analysis.analysis_result.conflicts.length}</span>
            </span>
          </Button>
          {!compareMode && <Button variant="ghost" size="icon" onClick={() => setPendingDelete(analysis.id)} aria-label="Delete analysis" title="Delete analysis" className="shrink-0 text-muted-foreground hover:text-accent"><Trash2 /></Button>}
        </div>)}
      </div>
      <AlertDialog open={pendingDelete !== null} onOpenChange={open => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent className="bg-background border-border max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>DELETE ANALYSIS</AlertDialogTitle><AlertDialogDescription>This permanently removes the analysis from this browser's history. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (pendingDelete) void deleteAnalysis(pendingDelete); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
