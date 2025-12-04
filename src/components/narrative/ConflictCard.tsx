import { Conflict, ConflictType } from "@/types/narrative";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface ConflictCardProps {
  conflict: Conflict;
}

const typeLabels: Record<ConflictType, string> = {
  resource: "RESOURCE",
  alignment: "ALIGNMENT",
  strategic: "STRATEGIC",
  interpersonal: "INTERPERSONAL"
};

export function ConflictCard({ conflict }: ConflictCardProps) {
  return (
    <div className="tactical-card border-accent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent-foreground" />
          </div>
          <h3 className="font-display text-sm tracking-[0.15em] text-accent">
            {conflict.conflict_name}
          </h3>
        </div>
        <span className="text-xs font-display tracking-widest text-accent border border-accent px-2 py-0.5">
          {typeLabels[conflict.type]}
        </span>
      </div>
      
      {/* Drivers */}
      <div className="mb-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Drivers</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {conflict.drivers.map((driver, i) => (
            <span 
              key={i} 
              className="text-xs font-body text-foreground border border-border px-2 py-1"
            >
              {driver}
            </span>
          ))}
        </div>
      </div>
      
      {/* Pressure Points */}
      <div className="mb-3">
        <span className="text-xs font-display uppercase tracking-wider text-accent">Pressure Points</span>
        <ul className="mt-2 space-y-1">
          {conflict.pressure_points.map((point, i) => (
            <li key={i} className="text-sm text-accent/90 font-body flex items-start gap-2">
              <span className="text-accent font-mono">▸</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Possible Breaks */}
      <div className="border-t border-accent/30 pt-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Possible Breaks</span>
        <ul className="mt-2 space-y-1">
          {conflict.possible_breaks.map((breakPoint, i) => (
            <li key={i} className="text-xs text-muted-foreground font-body">
              → {breakPoint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
