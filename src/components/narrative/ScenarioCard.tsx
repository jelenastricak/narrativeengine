import { FutureScenario, Probability } from "@/types/narrative";
import { cn } from "@/lib/utils";
import { GitBranch, ArrowDown } from "lucide-react";

interface ScenarioCardProps {
  scenario: FutureScenario;
}

const probStyles: Record<Probability, { text: string; border: string }> = {
  low: { text: "text-muted-foreground", border: "border-muted-foreground" },
  medium: { text: "text-foreground", border: "border-foreground" },
  high: { text: "text-accent", border: "border-accent" }
};

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const styles = probStyles[scenario.probability];
  
  return (
    <div className={cn("tactical-card", styles.border)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GitBranch className={cn("w-5 h-5", styles.text)} />
          <h3 className={cn("font-display text-sm tracking-[0.15em]", styles.text)}>
            {scenario.scenario_name}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground block">
            Probability
          </span>
          <span className={cn("font-mono text-sm", styles.text)}>
            {scenario.probability.toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Summary */}
      <p className="text-sm text-foreground/80 font-body mb-4">
        {scenario.summary}
      </p>
      
      {/* Domino Path */}
      <div className="border-t border-border pt-4">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-3 block">
          Domino Path
        </span>
        <div className="space-y-2">
          {scenario.domino_path.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={cn(
                "w-6 h-6 flex items-center justify-center font-mono text-xs border",
                i === 0 ? "border-foreground text-foreground" : 
                i === scenario.domino_path.length - 1 ? "border-accent text-accent bg-accent/10" :
                "border-muted-foreground text-muted-foreground"
              )}>
                {i + 1}
              </span>
              <span className={cn(
                "text-sm font-body flex-1",
                i === scenario.domino_path.length - 1 ? "text-accent font-medium" : "text-foreground/80"
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
