import type { NarrativeModel } from "@/types/narrative";
import { normalizeNarrativeModel as normalize, MAX_INPUT_CHARS } from "../../supabase/functions/_shared/normalizeModel";

export { MAX_INPUT_CHARS };

/** Coerces any AI or stored result into a safe NarrativeModel. Throws if nothing usable remains. */
export function normalizeNarrativeModel(input: unknown): NarrativeModel {
  return normalize(input) as NarrativeModel;
}
