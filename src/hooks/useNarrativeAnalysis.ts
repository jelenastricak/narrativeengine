import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NarrativeModel } from "@/types/narrative";
import { MAX_INPUT_CHARS, MIN_INPUT_CHARS, normalizeNarrativeModel } from "@/lib/normalizeModel";
import { toast } from "sonner";

export { MIN_INPUT_CHARS } from "@/lib/normalizeModel";

async function extractErrorMessage(fnError: unknown): Promise<string> {
  const ctx = (fnError as { context?: unknown })?.context;
  if (ctx instanceof Response) {
    try {
      const body = await ctx.clone().json();
      if (body && typeof body.error === "string") return body.error;
    } catch {
      // ignore
    }
  }
  return fnError instanceof Error ? fnError.message : "Analysis failed";
}

export function useNarrativeAnalysis() {
  const inFlight = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNarrative = async (text: string, existingModel?: NarrativeModel): Promise<NarrativeModel | null> => {
    if (inFlight.current) return null;
    const trimmed = text.trim();
    if (trimmed.length < MIN_INPUT_CHARS) {
      toast.error(`Please provide at least ${MIN_INPUT_CHARS} characters of text.`);
      return null;
    }
    if (trimmed.length > MAX_INPUT_CHARS) {
      toast.error(`Text is too long (max ${MAX_INPUT_CHARS.toLocaleString()} characters).`);
      return null;
    }

    inFlight.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-narrative", {
        body: { text: trimmed, existingModel },
        signal: AbortSignal.timeout(150_000),
      });
      if (fnError) throw new Error(await extractErrorMessage(fnError));
      if (data?.error) throw new Error(data.error);

      const model = normalizeNarrativeModel(data);
      toast.success(existingModel ? "Narrative model updated with new insights" : "Narrative analysis complete");
      return model;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      toast.error(message.startsWith("Analysis") ? message : `Analysis failed: ${message}`);
      return null;
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  };

  return { analyzeNarrative, isLoading, error };
}
