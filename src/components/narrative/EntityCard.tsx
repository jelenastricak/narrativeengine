import { Entity, EntityRole } from "@/types/narrative";
import { cn } from "@/lib/utils";
import { User, Target, AlertTriangle, Users } from "lucide-react";

interface EntityCardProps {
  entity: Entity;
}

const roleStyles: Record<EntityRole, string> = {
  protagonist: "border-foreground text-foreground",
  antagonist: "border-accent text-accent",
  wildcard: "border-orange-glow text-orange-glow",
  neutral: "border-muted-foreground text-muted-foreground",
  supporting: "border-bone-dim text-bone-dim"
};

const roleLabels: Record<EntityRole, string> = {
  protagonist: "PROTAGONIST",
  antagonist: "ANTAGONIST",
  wildcard: "WILDCARD",
  neutral: "NEUTRAL",
  supporting: "SUPPORTING"
};

export function EntityCard({ entity }: EntityCardProps) {
  const hasConflicts = entity.relationships.conflicts_with.length > 0;
  
  return (
    <div className={cn(
      "tactical-card border",
      hasConflicts ? "border-accent/50" : "border-border"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-border flex items-center justify-center bg-charcoal-light">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide">{entity.name}</h3>
            <span className={cn(
              "text-xs font-display tracking-widest uppercase px-2 py-0.5 border",
              roleStyles[entity.role]
            )}>
              {roleLabels[entity.role]}
            </span>
          </div>
        </div>
      </div>
      
      {/* Goals */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Goals</span>
        </div>
        <ul className="space-y-1">
          {entity.goals.map((goal, i) => (
            <li key={i} className="text-sm text-foreground pl-5 font-body">
              {goal}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Fears */}
      {entity.fears.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3 h-3 text-accent" />
            <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Fears</span>
          </div>
          <ul className="space-y-1">
            {entity.fears.map((fear, i) => (
              <li key={i} className="text-sm text-accent/80 pl-5 font-body">
                {fear}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Relationships */}
      <div className="border-t border-border pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Relationships</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-body">
          {entity.relationships.allies.length > 0 && (
            <div>
              <span className="text-muted-foreground">Allies: </span>
              <span className="text-foreground">{entity.relationships.allies.join(", ")}</span>
            </div>
          )}
          {entity.relationships.conflicts_with.length > 0 && (
            <div>
              <span className="text-muted-foreground">Conflicts: </span>
              <span className="text-accent">{entity.relationships.conflicts_with.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
