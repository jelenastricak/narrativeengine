import { Risk, Severity } from "@/types/narrative";
import { cn } from "@/lib/utils";
import { AlertOctagon } from "lucide-react";

interface RiskCardProps {
  risk: Risk;
}

const severityStyles: Record<Severity, { text: string; border: string; bg: string }> = {
  low: { text: "text-muted-foreground", border: "border-muted-foreground", bg: "bg-muted" },
  medium: { text: "text-foreground", border: "border-foreground", bg: "bg-charcoal-lighter" },
  high: { text: "text-accent", border: "border-accent", bg: "bg-accent/10" },
  critical: { text: "text-accent", border: "border-accent", bg: "bg-accent/20" }
};

export function RiskCard({ risk }: RiskCardProps) {
  const styles = severityStyles[risk.severity];
  const isCritical = risk.severity === 'critical' || risk.severity === 'high';
  
  return (
    <div className={cn("tactical-card", styles.border)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 flex items-center justify-center", styles.bg)}>
            <AlertOctagon className={cn("w-4 h-4", styles.text)} />
          </div>
          <h3 className={cn("font-display text-sm tracking-[0.15em]", styles.text)}>
            {risk.risk_name}
          </h3>
        </div>
        <span className={cn(
          "text-xs font-display tracking-widest uppercase px-2 py-1 border",
          styles.text,
          styles.border,
          isCritical && "animate-pulse-hot"
        )}>
          {risk.severity.toUpperCase()}
        </span>
      </div>
      
      {/* Indicators */}
      <div className="mb-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Indicators</span>
        <ul className="mt-2 space-y-1">
          {risk.indicators.map((indicator, i) => (
            <li key={i} className={cn("text-sm font-body flex items-start gap-2", styles.text)}>
              <span className="font-mono">!</span>
              {indicator}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Preventive Actions */}
      <div className="border-t border-border pt-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Preventive Actions</span>
        <ul className="mt-2 space-y-1">
          {risk.preventive_actions.map((action, i) => (
            <li key={i} className="text-xs text-foreground/70 font-body">
              → {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
