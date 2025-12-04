import { Opportunity } from "@/types/narrative";
import { Lightbulb, ArrowRight } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <div className="tactical-card border-opportunity">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 border border-opportunity flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-opportunity" />
        </div>
        <h3 className="font-display text-sm tracking-[0.15em] text-foreground">
          {opportunity.opportunity_name}
        </h3>
      </div>
      
      {/* Conditions */}
      <div className="mb-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Conditions</span>
        <ul className="mt-2 space-y-1">
          {opportunity.conditions.map((condition, i) => (
            <li key={i} className="text-sm text-foreground/80 font-body flex items-start gap-2">
              <span className="text-opportunity">○</span>
              {condition}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Required Actions */}
      <div className="mb-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Required Actions</span>
        <ul className="mt-2 space-y-1">
          {opportunity.required_actions.map((action, i) => (
            <li key={i} className="text-sm text-foreground font-body flex items-start gap-2">
              <span className="text-foreground font-mono">{i + 1}.</span>
              {action}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Outcome */}
      <div className="border-t border-border pt-3 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-opportunity" />
        <span className="text-sm font-body text-opportunity">{opportunity.potential_outcome}</span>
      </div>
    </div>
  );
}
