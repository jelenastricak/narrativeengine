import type { NarrativeModel } from "@/types/narrative";
import { normalizeNarrativeModel } from "./normalizeModel";

export const STORAGE_KEY = "narrative-engine-history";
export const HISTORY_CHANGED = "narrative-engine-history-changed";
export const MAX_HISTORY_ITEMS = 50;
export interface SavedAnalysis {
  id: string;
  input_text: string;
  analysis_result: NarrativeModel;
  created_at: string;
}

export function readHistory(): SavedAnalysis[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const ids = new Set<string>();
    const items: SavedAnalysis[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Partial<SavedAnalysis>;
      if (typeof e.id !== "string" || !e.id || ids.has(e.id) ||
          typeof e.created_at !== "string" || !Number.isFinite(Date.parse(e.created_at))) continue;
      try {
        items.push({ id: e.id, created_at: e.created_at,
          input_text: typeof e.input_text === "string" ? e.input_text : "",
          analysis_result: normalizeNarrativeModel(e.analysis_result) });
        ids.add(e.id);
      } catch { /* A damaged entry must not prevent other entries from opening. */ }
    }
    return items.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, MAX_HISTORY_ITEMS);
  } catch { return []; }
}

export function writeHistory(items: SavedAnalysis[], allowEviction = true): SavedAnalysis[] {
  let list = items.slice(0, MAX_HISTORY_ITEMS);
  for (;;) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event(HISTORY_CHANGED));
      return list;
    } catch (error) {
      const quotaError = error instanceof Error &&
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
      if (!quotaError || !allowEviction || list.length <= 1) throw error;
      list = list.slice(0, -1);
    }
  }
}