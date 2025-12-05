import { NarrativeModel, Entity, NarrativeArc, Conflict } from "@/types/narrative";
import { X, ArrowRight, Plus, Minus, Equal, Users, GitBranch, Flame, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface ComparisonItem {
  id: string;
  model: NarrativeModel;
  created_at: string;
  input_text: string;
}

interface ModelComparisonProps {
  older: ComparisonItem;
  newer: ComparisonItem;
  onClose: () => void;
}

function getEntityDiff(older: Entity[], newer: Entity[]) {
  const olderNames = new Set(older.map(e => e.name.toLowerCase()));
  const newerNames = new Set(newer.map(e => e.name.toLowerCase()));
  
  const added = newer.filter(e => !olderNames.has(e.name.toLowerCase()));
  const removed = older.filter(e => !newerNames.has(e.name.toLowerCase()));
  const unchanged = newer.filter(e => olderNames.has(e.name.toLowerCase()));
  
  return { added, removed, unchanged };
}

function getArcDiff(older: NarrativeArc[], newer: NarrativeArc[]) {
  const olderNames = new Set(older.map(a => a.arc_name.toLowerCase()));
  const newerNames = new Set(newer.map(a => a.arc_name.toLowerCase()));
  
  const added = newer.filter(a => !olderNames.has(a.arc_name.toLowerCase()));
  const removed = older.filter(a => !newerNames.has(a.arc_name.toLowerCase()));
  const unchanged = newer.filter(a => olderNames.has(a.arc_name.toLowerCase()));
  
  return { added, removed, unchanged };
}

function getConflictDiff(older: Conflict[], newer: Conflict[]) {
  const olderNames = new Set(older.map(c => c.conflict_name.toLowerCase()));
  const newerNames = new Set(newer.map(c => c.conflict_name.toLowerCase()));
  
  const added = newer.filter(c => !olderNames.has(c.conflict_name.toLowerCase()));
  const removed = older.filter(c => !newerNames.has(c.conflict_name.toLowerCase()));
  const unchanged = newer.filter(c => olderNames.has(c.conflict_name.toLowerCase()));
  
  return { added, removed, unchanged };
}

function DiffBadge({ type }: { type: 'added' | 'removed' | 'unchanged' }) {
  if (type === 'added') {
    return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30"><Plus className="w-3 h-3" />NEW</span>;
  }
  if (type === 'removed') {
    return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-accent/20 text-accent border border-accent/30"><Minus className="w-3 h-3" />REMOVED</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-muted text-muted-foreground"><Equal className="w-3 h-3" />SAME</span>;
}

function StatComparison({ label, icon: Icon, older, newer }: { label: string; icon: React.ElementType; older: number; newer: number }) {
  const diff = newer - older;
  const diffColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-accent' : 'text-muted-foreground';
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-display uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-muted-foreground">{older}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-foreground">{newer}</span>
        {diff !== 0 && (
          <span className={`font-mono text-xs ${diffColor}`}>
            ({diff > 0 ? '+' : ''}{diff})
          </span>
        )}
      </div>
    </div>
  );
}

export function ModelComparison({ older, newer, onClose }: ModelComparisonProps) {
  const entityDiff = getEntityDiff(older.model.entities || [], newer.model.entities || []);
  const arcDiff = getArcDiff(older.model.current_arcs || [], newer.model.current_arcs || []);
  const conflictDiff = getConflictDiff(older.model.conflicts || [], newer.model.conflicts || []);

  return (
    <div className="border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="font-display text-sm uppercase tracking-widest">
            Model Comparison
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Timeline */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 p-3 bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground font-mono block mb-1">OLDER</span>
            <span className="text-sm font-mono text-foreground">
              {format(new Date(older.created_at), "MMM d, yyyy HH:mm")}
            </span>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {older.input_text.substring(0, 80)}...
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-accent flex-shrink-0" />
          <div className="flex-1 p-3 bg-accent/10 border border-accent/30">
            <span className="text-xs text-accent font-mono block mb-1">NEWER</span>
            <span className="text-sm font-mono text-foreground">
              {format(new Date(newer.created_at), "MMM d, yyyy HH:mm")}
            </span>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {newer.input_text.substring(0, 80)}...
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-border space-y-2">
        <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3">
          Overview Changes
        </h4>
        <StatComparison 
          label="Entities" 
          icon={Users} 
          older={older.model.entities?.length || 0} 
          newer={newer.model.entities?.length || 0} 
        />
        <StatComparison 
          label="Arcs" 
          icon={GitBranch} 
          older={older.model.current_arcs?.length || 0} 
          newer={newer.model.current_arcs?.length || 0} 
        />
        <StatComparison 
          label="Conflicts" 
          icon={Flame} 
          older={older.model.conflicts?.length || 0} 
          newer={newer.model.conflicts?.length || 0} 
        />
        <StatComparison 
          label="Opportunities" 
          icon={Target} 
          older={older.model.opportunities?.length || 0} 
          newer={newer.model.opportunities?.length || 0} 
        />
        <StatComparison 
          label="Risks" 
          icon={AlertTriangle} 
          older={older.model.risks?.length || 0} 
          newer={newer.model.risks?.length || 0} 
        />
      </div>

      {/* Detailed Diff */}
      <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto">
        {/* Entities Diff */}
        {(entityDiff.added.length > 0 || entityDiff.removed.length > 0) && (
          <div>
            <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-3 h-3" /> Entity Changes
            </h4>
            <div className="space-y-2">
              {entityDiff.added.map((entity, i) => (
                <div key={`added-${i}`} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-body">{entity.name}</span>
                  <DiffBadge type="added" />
                </div>
              ))}
              {entityDiff.removed.map((entity, i) => (
                <div key={`removed-${i}`} className="flex items-center justify-between p-2 bg-accent/10 border border-accent/20">
                  <span className="text-sm font-body line-through opacity-60">{entity.name}</span>
                  <DiffBadge type="removed" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arcs Diff */}
        {(arcDiff.added.length > 0 || arcDiff.removed.length > 0) && (
          <div>
            <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <GitBranch className="w-3 h-3" /> Arc Changes
            </h4>
            <div className="space-y-2">
              {arcDiff.added.map((arc, i) => (
                <div key={`added-${i}`} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20">
                  <div>
                    <span className="text-sm font-body block">{arc.arc_name}</span>
                    <span className="text-xs text-muted-foreground">Stage: {arc.stage}</span>
                  </div>
                  <DiffBadge type="added" />
                </div>
              ))}
              {arcDiff.removed.map((arc, i) => (
                <div key={`removed-${i}`} className="flex items-center justify-between p-2 bg-accent/10 border border-accent/20">
                  <span className="text-sm font-body line-through opacity-60">{arc.arc_name}</span>
                  <DiffBadge type="removed" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts Diff */}
        {(conflictDiff.added.length > 0 || conflictDiff.removed.length > 0) && (
          <div>
            <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="w-3 h-3" /> Conflict Changes
            </h4>
            <div className="space-y-2">
              {conflictDiff.added.map((conflict, i) => (
                <div key={`added-${i}`} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20">
                  <div>
                    <span className="text-sm font-body block">{conflict.conflict_name}</span>
                    <span className="text-xs text-muted-foreground">Type: {conflict.type}</span>
                  </div>
                  <DiffBadge type="added" />
                </div>
              ))}
              {conflictDiff.removed.map((conflict, i) => (
                <div key={`removed-${i}`} className="flex items-center justify-between p-2 bg-accent/10 border border-accent/20">
                  <span className="text-sm font-body line-through opacity-60">{conflict.conflict_name}</span>
                  <DiffBadge type="removed" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Comparison */}
        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3">
            Narrative Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 border border-border">
              <span className="text-xs text-muted-foreground font-mono block mb-2">OLDER</span>
              <p className="text-xs text-foreground font-body line-clamp-4">
                {older.model.narrative_summary || "No summary"}
              </p>
            </div>
            <div className="p-3 bg-accent/5 border border-accent/20">
              <span className="text-xs text-accent font-mono block mb-2">NEWER</span>
              <p className="text-xs text-foreground font-body line-clamp-4">
                {newer.model.narrative_summary || "No summary"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
