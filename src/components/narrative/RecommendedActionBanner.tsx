import { RecommendedAction } from "@/types/narrative";
import { AlertTriangle, ArrowRight, Shield } from "lucide-react";

interface RecommendedActionBannerProps {
  action: RecommendedAction;
  index: number;
}

export function RecommendedActionBanner({ action, index }: RecommendedActionBannerProps) {
  return (
    <div className="border-2 border-accent bg-accent/5 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent flex items-center justify-center">
          <span className="font-display text-lg text-accent-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <h3 className="font-display text-lg tracking-[0.1em] text-accent flex-1">
          {action.action}
        </h3>
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-13">
        <div className="flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-display uppercase tracking-wider text-muted-foreground block mb-1">
              Expected Effect
            </span>
            <p className="text-sm font-body text-foreground">
              {action.expected_effect}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-display uppercase tracking-wider text-accent block mb-1">
              Risk If Ignored
            </span>
            <p className="text-sm font-body text-accent/90">
              {action.risk_if_ignored}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
