import { beforeEach, describe, expect, it, vi } from "vitest";
import { readHistory, writeHistory, STORAGE_KEY, MAX_HISTORY_ITEMS, type SavedAnalysis } from "./historyStorage";
const store = new Map<string,string>();
const setItem = vi.fn((key: string,value: string) => { store.set(key,value); });
const entry = (id: number): SavedAnalysis => ({ id: String(id), input_text: `Input ${id}`, created_at: new Date(2026,0,id+1).toISOString(), analysis_result: { entities: [], current_arcs: [], conflicts: [], opportunities: [], risks: [], future_scenarios: [], recommended_actions: [], narrative_summary: `Summary ${id}` } });
beforeEach(() => {
 store.clear(); setItem.mockReset(); setItem.mockImplementation((key,value) => { store.set(key,value); });
 vi.stubGlobal("localStorage", { getItem: (key: string) => store.get(key) ?? null, setItem });
 vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});
describe("device history", () => {
 it("keeps the 50 newest saved analyses", () => {
   const items = Array.from({length: 51},(_,i) => entry(50-i));
   expect(MAX_HISTORY_ITEMS).toBe(50);
   expect(writeHistory(items)).toHaveLength(50);
   expect(readHistory().map(a=>a.id)).not.toContain("0");
 });
 it("deletes the final entry persistently", () => {
   writeHistory([entry(1)]); writeHistory([],false);
   expect(store.get(STORAGE_KEY)).toBe("[]"); expect(readHistory()).toEqual([]);
 });
 it("rejects damaged timestamps, duplicate IDs, and invalid models without losing valid records", () => {
   store.set(STORAGE_KEY,JSON.stringify([entry(1),entry(1),{...entry(2),created_at:"invalid"},{...entry(3),analysis_result:{}}]));
   expect(readHistory().map(a=>a.id)).toEqual(["1"]);
 });
 it("evicts only the oldest item on quota failure", () => {
   setItem.mockImplementation((key,value) => { if (JSON.parse(value).length > 2) throw new DOMException("full","QuotaExceededError"); store.set(key,value); });
   expect(writeHistory([entry(3),entry(2),entry(1)]).map(a=>a.id)).toEqual(["3","2"]);
 });
 it("does not erase entries when storage is blocked", () => {
   writeHistory([entry(1)]);
   setItem.mockImplementation(() => { throw new DOMException("blocked","SecurityError"); });
   expect(() => writeHistory([entry(2),entry(1)])).toThrow();
   expect(readHistory().map(a=>a.id)).toEqual(["1"]);
 });
});
