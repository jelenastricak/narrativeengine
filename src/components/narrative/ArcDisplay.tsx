import { NarrativeArc, ArcStage } from "@/types/narrative";
import { cn } from "@/lib/utils";

interface ArcDisplayProps {
  arc: NarrativeArc;
}

const stages: ArcStage[] = ['rising_action', 'tension', 'decision_node', 'resolution', 'stagnation'];
const stageLabels: Record<ArcStage, string> = {
  rising_action: "RISING",
  tension: "TENSION",
  decision_node: "DECISION",
  resolution: "RESOLUTION",
  stagnation: "STAGNATION"
};

export function ArcDisplay({ arc }: ArcDisplayProps) {
  const currentStageIndex = stages.indexOf(arc.stage);
  const isHot = arc.stage === 'tension' || arc.stage === 'decision_node';
  
  return (
    <div className={cn(
      "tactical-card",
      isHot && "border-accent"
    )}>
      {/* Arc Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          "font-display text-sm tracking-[0.15em]",
          isHot ? "text-accent" : "text-foreground"
        )}>
          {arc.arc_name}
        </h3>
        <span className={cn(
          "font-mono text-xs px-2 py-1 border",
          isHot ? "border-accent text-accent" : "border-border text-muted-foreground"
        )}>
          {stageLabels[arc.stage]}
        </span>
      </div>
      
      {/* Stage Timeline */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            
            return (
              <div key={stage} className="flex flex-col items-center">
                <div className={cn(
                  "w-3 h-3 border transition-colors",
                  isActive && "bg-accent border-accent",
                  isPast && "bg-foreground border-foreground",
                  !isActive && !isPast && "border-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] mt-1 font-display tracking-wider",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}>
                  {stageLabels[stage].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Connecting Line */}
        <div className="absolute top-1.5 left-0 right-0 h-px bg-border -z-10" />
        <div 
          className="absolute top-1.5 left-0 h-px bg-foreground -z-10 transition-all"
          style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
        />
      </div>
      
      {/* Description */}
      <p className="text-sm text-foreground/90 font-body mb-3">
        {arc.description}
      </p>
      
      {/* Evidence */}
      <div className="border-t border-border pt-3">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Evidence</span>
        <ul className="mt-2 space-y-1">
          {arc.evidence.map((ev, i) => (
            <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-2">
              <span className="text-foreground">—</span>
              {ev}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
