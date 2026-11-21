import type { NarrativeModel } from "@/types/narrative";
import { X, ArrowRight, Plus, Minus, Equal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compareItems } from "@/lib/compareModels";
import { format } from "date-fns";

interface ComparisonItem { id: string; model: NarrativeModel; created_at: string; input_text: string; }
interface ModelComparisonProps { older: ComparisonItem; newer: ComparisonItem; onClose: () => void; }

function DiffBadge({ type }: { type: "added" | "removed" | "changed" | "unchanged" }) {
  const Icon = type === "added" ? Plus : type === "removed" ? Minus : type === "changed" ? ArrowRight : Equal;
  return <span className={`inline-flex shrink-0 items-center gap-1 text-xs px-1.5 py-0.5 border ${type === "removed" || type === "changed" ? "text-accent border-accent/30 bg-accent/10" : "text-foreground border-border bg-muted"}`}><Icon className="w-3 h-3" />{type === "added" ? "NEW" : type.toUpperCase()}</span>;
}
function display(value: unknown): string {
  if (Array.isArray(value)) return value.join("; ") || "None";
  if (value && typeof value === "object") return Object.entries(value).map(([key, val]) => `${key.replace(/_/g, " ")}: ${display(val)}`).join(" | ");
  return typeof value === "string" && value ? value.replace(/_/g, " ") : "None";
}
function DiffSection<T extends object>({ title, older, newer, name }: { title: string; older: T[]; newer: T[]; name: (item: T) => string }) {
  const diff = compareItems(older, newer, name);
  const count = diff.added.length + diff.removed.length + diff.changed.length;
  return <section className="space-y-3">
    <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground">{title} · {count} changes</h4>
    {!count && <p className="text-xs text-muted-foreground">No changes.</p>}
    {diff.added.map((item, i) => <div key={`add-${i}`} className="flex items-start justify-between gap-2 p-2 border border-border"><span className="text-sm">{name(item)}</span><DiffBadge type="added" /></div>)}
    {diff.removed.map((item, i) => <div key={`remove-${i}`} className="flex items-start justify-between gap-2 p-2 border border-accent/20"><span className="text-sm line-through text-muted-foreground">{name(item)}</span><DiffBadge type="removed" /></div>)}
    {diff.changed.map((item, i) => {
      const previous = older.find(old => name(old).toLowerCase().trim() === name(item).toLowerCase().trim());
      if (!previous) return null;
      const oldFields = previous as Record<string, unknown>;
      const fields = Object.entries(item).filter(([key, value]) => JSON.stringify(oldFields[key]) !== JSON.stringify(value));
      return <div key={`change-${i}`} className="border border-accent/30 p-3 space-y-2">
        <div className="flex justify-between items-start gap-2"><span className="text-sm">{name(item)}</span><DiffBadge type="changed" /></div>
        {fields.map(([key, value]) => <div key={key} className="text-xs border-t border-border pt-2">
          <span className="font-display uppercase text-muted-foreground">{key.replace(/_/g, " ")}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1"><p><span className="text-muted-foreground">Older: </span>{display(oldFields[key])}</p><p><span className="text-accent">Newer: </span>{display(value)}</p></div>
        </div>)}
      </div>;
    })}
  </section>;
}
export function ModelComparison({ older, newer, onClose }: ModelComparisonProps) {
  const stats = [["Entities", older.model.entities.length, newer.model.entities.length], ["Arcs", older.model.current_arcs.length, newer.model.current_arcs.length], ["Conflicts", older.model.conflicts.length, newer.model.conflicts.length], ["Opportunities", older.model.opportunities.length, newer.model.opportunities.length], ["Risks", older.model.risks.length, newer.model.risks.length]] as const;
  return <div className="border border-border bg-card">
    <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-2"><h3 className="font-display text-sm uppercase flex items-center gap-3"><TrendingUp className="w-4 h-4 text-accent" />Model Comparison</h3><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close comparison" title="Close comparison"><X /></Button></div>
    <div className="p-4 border-b border-border grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
      {[older, newer].map((item, index) => <div key={item.id} className={`min-w-0 p-3 border ${index ? "border-accent/30" : "border-border"}`}><span className="text-xs text-muted-foreground font-mono block">{index ? "NEWER" : "OLDER"}</span><p className="text-sm font-mono">{format(new Date(item.created_at), "MMM d, yyyy HH:mm")}</p><p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.input_text}</p></div>)}
    </div>
    <div className="p-4 border-b border-border space-y-2">{stats.map(([label, before, after]) => <div key={label} className="flex justify-between items-center gap-2 text-sm"><span className="font-display uppercase">{label}</span><span className="font-mono flex items-center gap-3"><span className="text-muted-foreground">{before}</span><ArrowRight className="w-3 h-3" />{after}<span className="text-xs text-accent w-8">{after !== before ? `${after > before ? "+" : ""}${after-before}` : ""}</span></span></div>)}</div>
    <div className="p-4 space-y-6">
      <DiffSection title="Entities" older={older.model.entities} newer={newer.model.entities} name={e => e.name} />
      <DiffSection title="Arcs" older={older.model.current_arcs} newer={newer.model.current_arcs} name={a => a.arc_name} />
      <DiffSection title="Conflicts" older={older.model.conflicts} newer={newer.model.conflicts} name={c => c.conflict_name} />
      <DiffSection title="Opportunities" older={older.model.opportunities} newer={newer.model.opportunities} name={o => o.opportunity_name} />
      <DiffSection title="Risks" older={older.model.risks} newer={newer.model.risks} name={r => r.risk_name} />
      <DiffSection title="Future Scenarios" older={older.model.future_scenarios} newer={newer.model.future_scenarios} name={s => s.scenario_name} />
      <DiffSection title="Recommended Actions" older={older.model.recommended_actions} newer={newer.model.recommended_actions} name={a => a.action} />
      <section><h4 className="text-xs font-display uppercase text-muted-foreground mb-3">Narrative Summary</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[older,newer].map((item,index) => <div key={item.id} className="border border-border p-3"><span className="text-xs font-mono text-muted-foreground">{index ? "NEWER" : "OLDER"}</span><p className="text-sm mt-2">{item.model.narrative_summary || "No summary"}</p></div>)}</div></section>
    </div>
  </div>;
}
