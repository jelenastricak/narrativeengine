import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NarrativeModel } from "@/types/narrative";
import { toast } from "sonner";

export function useNarrativeAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNarrative = async (
    text: string, 
    existingModel?: NarrativeModel
  ): Promise<NarrativeModel | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-narrative', {
        body: { text, existingModel }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const successMessage = existingModel 
        ? "Narrative model updated with new insights" 
        : "Narrative analysis complete";
      toast.success(successMessage);
      return data as NarrativeModel;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
      } else if (message.includes('Usage limit')) {
        toast.error("Usage limit reached. Please add credits to continue.");
      } else {
        toast.error(`Analysis failed: ${message}`);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeNarrative, isLoading, error };
}
