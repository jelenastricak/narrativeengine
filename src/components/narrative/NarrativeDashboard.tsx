import { NarrativeModel } from "@/types/narrative";
import { SectionHeader } from "./SectionHeader";
import { EntityCard } from "./EntityCard";
import { ArcDisplay } from "./ArcDisplay";
import { ConflictCard } from "./ConflictCard";
import { OpportunityCard } from "./OpportunityCard";
import { RiskCard } from "./RiskCard";
import { ScenarioCard } from "./ScenarioCard";
import { RecommendedActionBanner } from "./RecommendedActionBanner";
import { NarrativeSummary } from "./NarrativeSummary";

interface NarrativeDashboardProps {
  model: NarrativeModel;
}

export function NarrativeDashboard({ model }: NarrativeDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Summary */}
      <section>
        <NarrativeSummary summary={model.narrative_summary} />
      </section>
      
      {/* Recommended Actions - Priority */}
      <section>
        <SectionHeader 
          title="Recommended Actions" 
          count={model.recommended_actions.length}
          hot 
        />
        <div className="space-y-4">
          {model.recommended_actions.map((action, i) => (
            <RecommendedActionBanner key={i} action={action} index={i} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Entities */}
      <section>
        <SectionHeader title="Entities" count={model.entities.length} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {model.entities.map((entity, i) => (
            <EntityCard key={i} entity={entity} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Current Arcs */}
      <section>
        <SectionHeader title="Current Arcs" count={model.current_arcs.length} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {model.current_arcs.map((arc, i) => (
            <ArcDisplay key={i} arc={arc} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Conflicts */}
      <section>
        <SectionHeader title="Conflicts" count={model.conflicts.length} hot />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {model.conflicts.map((conflict, i) => (
            <ConflictCard key={i} conflict={conflict} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Risks */}
      <section>
        <SectionHeader title="Risks" count={model.risks.length} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {model.risks.map((risk, i) => (
            <RiskCard key={i} risk={risk} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Opportunities */}
      <section>
        <SectionHeader title="Opportunities" count={model.opportunities.length} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {model.opportunities.map((opp, i) => (
            <OpportunityCard key={i} opportunity={opp} />
          ))}
        </div>
      </section>
      
      <div className="divider" />
      
      {/* Future Scenarios */}
      <section>
        <SectionHeader title="Future Scenarios" count={model.future_scenarios.length} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {model.future_scenarios.map((scenario, i) => (
            <ScenarioCard key={i} scenario={scenario} />
          ))}
        </div>
      </section>
    </div>
  );
}
