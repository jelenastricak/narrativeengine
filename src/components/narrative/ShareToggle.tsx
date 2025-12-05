import { useState } from "react";
import { Share2, Lock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareToggleProps {
  analysisId: string;
  isShared: boolean;
  isOwner: boolean;
  onShareChange?: (isShared: boolean) => void;
}

export function ShareToggle({ analysisId, isShared, isOwner, onShareChange }: ShareToggleProps) {
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(isShared);

  const toggleShare = async () => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      const newSharedState = !shared;
      const { error } = await supabase
        .from("narrative_analyses")
        .update({ is_shared: newSharedState })
        .eq("id", analysisId);

      if (error) throw error;

      setShared(newSharedState);
      onShareChange?.(newSharedState);
      toast.success(newSharedState ? "Analysis shared with workspace" : "Analysis set to private");
    } catch (error) {
      console.error("Error toggling share:", error);
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Globe className="w-3 h-3" />
              Shared
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">This analysis is shared with you</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleShare}
            disabled={loading}
            className={`flex items-center gap-1 text-xs font-mono transition-colors ${
              shared
                ? "text-primary hover:text-primary/80"
                : "text-muted-foreground hover:text-foreground"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {shared ? (
              <>
                <Globe className="w-3 h-3" />
                Shared
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                Private
              </>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {shared ? "Click to make private" : "Click to share with workspace"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
