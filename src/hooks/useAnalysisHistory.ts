import { useState, useCallback } from "react";
import { NarrativeModel } from "@/types/narrative";
import { useToast } from "@/hooks/use-toast";
import { normalizeNarrativeModel } from "@/lib/normalizeModel";

const STORAGE_KEY = "narrative-engine-history";
export const MAX_HISTORY_ITEMS = 50;

export interface SavedAnalysis {
  id: string;
  input_text: string;
  analysis_result: NarrativeModel;
  created_at: string;
}

/** Reads stored history, dropping entries that are corrupt or unusable. */
export function readHistory(): SavedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: SavedAnalysis[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Partial<SavedAnalysis>;
      if (typeof e.id !== "string" || typeof e.created_at !== "string") continue;
      try {
        items.push({
          id: e.id,
          created_at: e.created_at,
          input_text: typeof e.input_text === "string" ? e.input_text : "",
          analysis_result: normalizeNarrativeModel(e.analysis_result),
        });
      } catch {
        // skip unusable entry
      }
    }
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch {
    return [];
  }
}

/** Writes history; on quota errors drops the oldest entries and retries. Returns the stored list. */
export function writeHistory(items: SavedAnalysis[]): SavedAnalysis[] {
  let list = items.slice(0, MAX_HISTORY_ITEMS);
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch {
      if (list.length === 1) break;
      list = list.slice(0, list.length - 1);
    }
  }
  throw new Error("Browser storage is full");
}

export function useAnalysisHistory() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalyses = useCallback(() => {
    setIsLoading(true);
    setAnalyses(readHistory());
    setIsLoading(false);
  }, []);

  const saveAnalysis = useCallback(
    async (inputText: string, analysisResult: NarrativeModel): Promise<string | null> => {
      const entry: SavedAnalysis = {
        id: crypto.randomUUID(),
        input_text: inputText,
        analysis_result: analysisResult,
        created_at: new Date().toISOString(),
      };
      try {
        const before = readHistory().length + 1;
        const stored = writeHistory([entry, ...readHistory()]);
        setAnalyses(stored);
        toast({
          title: "Saved",
          description:
            stored.length < before
              ? "Analysis saved. Oldest entries were removed to make room."
              : "Analysis saved to history.",
        });
        return entry.id;
      } catch {
        toast({
          title: "Not saved",
          description: "Your browser storage is full. Delete some saved analyses and try again.",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const deleteAnalysis = useCallback(
    async (id: string) => {
      try {
        setAnalyses(writeHistoryAllowEmpty(readHistory().filter((a) => a.id !== id)));
        return true;
      } catch {
        toast({ title: "Error", description: "Failed to delete analysis.", variant: "destructive" });
        return false;
      }
    },
    [toast]
  );

  return { analyses, isLoading, fetchAnalyses, saveAnalysis, deleteAnalysis };
}

function writeHistoryAllowEmpty(items: SavedAnalysis[]): SavedAnalysis[] {
  if (items.length === 0) {
    localStorage.setItem(STORAGE_KEY, "[]");
    return [];
  }
  return writeHistory(items);
}
