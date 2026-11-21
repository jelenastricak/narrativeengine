import { useState, useCallback, useEffect } from "react";
import type { NarrativeModel } from "@/types/narrative";
import { toast } from "sonner";
import { readHistory, writeHistory, HISTORY_CHANGED, STORAGE_KEY, type SavedAnalysis } from "@/lib/historyStorage";
export { readHistory, writeHistory, MAX_HISTORY_ITEMS } from "@/lib/historyStorage";
export type { SavedAnalysis } from "@/lib/historyStorage";

export function useAnalysisHistory() {
  const [analyses, setAnalyses] = useState(readHistory);
  const fetchAnalyses = useCallback(() => setAnalyses(readHistory()), []);
  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== STORAGE_KEY && event.key !== null) return;
      fetchAnalyses();
    };
    window.addEventListener("storage", sync);
    window.addEventListener(HISTORY_CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(HISTORY_CHANGED, sync);
    };
  }, [fetchAnalyses]);
  const saveAnalysis = useCallback(async (inputText: string, analysisResult: NarrativeModel): Promise<string | null> => {
    const entry: SavedAnalysis = { id: crypto.randomUUID(), input_text: inputText,
      analysis_result: analysisResult, created_at: new Date().toISOString() };
    try {
      const previous = readHistory();
      const stored = writeHistory([entry, ...previous]);
      setAnalyses(stored);
      toast.success("Saved", { description: stored.length < previous.length + 1
        ? "Analysis saved. Oldest entries were removed to make room."
        : "Analysis saved in this browser on this device." });
      return entry.id;
    } catch {
      toast.error("Not saved", { description: "Browser storage is full or unavailable. Download this analysis to keep it." });
      return null;
    }
  }, []);
  const deleteAnalysis = useCallback(async (id: string) => {
    try {
      setAnalyses(writeHistory(readHistory().filter(a => a.id !== id), false));
      toast.success("Deleted", { description: "Analysis removed from this browser's history." });
      return true;
    } catch {
      toast.error("Not deleted", { description: "Browser storage is unavailable. The saved analysis was not changed." });
      return false;
    }
  }, []);
  return { analyses, isLoading: false, fetchAnalyses, saveAnalysis, deleteAnalysis };
}
