import { useState, useCallback } from "react";
import { NarrativeModel } from "@/types/narrative";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "narrative-engine-history";

export interface SavedAnalysis {
  id: string;
  input_text: string;
  analysis_result: NarrativeModel;
  created_at: string;
}

function readStore(): SavedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedAnalysis[]) : [];
  } catch {
    return [];
  }
}

function writeStore(items: SavedAnalysis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useAnalysisHistory() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalyses = useCallback(() => {
    setIsLoading(true);
    const items = readStore().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setAnalyses(items);
    setIsLoading(false);
  }, []);

  const saveAnalysis = useCallback(
    async (inputText: string, analysisResult: NarrativeModel): Promise<string | null> => {
      try {
        const entry: SavedAnalysis = {
          id: crypto.randomUUID(),
          input_text: inputText,
          analysis_result: analysisResult,
          created_at: new Date().toISOString(),
        };
        const items = [entry, ...readStore()];
        writeStore(items);
        setAnalyses(items);
        toast({ title: "Saved", description: "Analysis saved to history." });
        return entry.id;
      } catch {
        toast({
          title: "Error",
          description: "Failed to save analysis.",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const deleteAnalysis = useCallback(async (id: string) => {
    const items = readStore().filter((a) => a.id !== id);
    writeStore(items);
    setAnalyses(items);
    return true;
  }, []);

  return { analyses, isLoading, fetchAnalyses, saveAnalysis, deleteAnalysis };
}
