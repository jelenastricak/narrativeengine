import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NarrativeModel } from "@/types/narrative";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface SavedAnalysis {
  id: string;
  input_text: string;
  analysis_result: NarrativeModel;
  created_at: string;
}

export function useAnalysisHistory() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalyses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("narrative_analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load analysis history.",
        variant: "destructive",
      });
    } else {
      setAnalyses((data as unknown as SavedAnalysis[]) || []);
    }
    setIsLoading(false);
  };

  const saveAnalysis = async (inputText: string, analysisResult: NarrativeModel, userId: string) => {
    const { error } = await supabase
      .from("narrative_analyses")
      .insert([{
        user_id: userId,
        input_text: inputText,
        analysis_result: JSON.parse(JSON.stringify(analysisResult)) as Json,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Saved",
      description: "Analysis saved to history.",
    });
    return true;
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase
      .from("narrative_analyses")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive",
      });
      return false;
    }
    
    setAnalyses(prev => prev.filter(a => a.id !== id));
    return true;
  };

  return { analyses, isLoading, fetchAnalyses, saveAnalysis, deleteAnalysis };
}
