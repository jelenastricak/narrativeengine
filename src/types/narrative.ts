export type EntityRole = 'protagonist' | 'antagonist' | 'wildcard' | 'neutral' | 'supporting';
export type ArcStage = 'rising_action' | 'tension' | 'decision_node' | 'resolution' | 'stagnation';
export type ConflictType = 'resource' | 'alignment' | 'strategic' | 'interpersonal';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Probability = 'low' | 'medium' | 'high';

export interface Entity {
  name: string;
  role: EntityRole;
  goals: string[];
  motivations: string[];
  constraints: string[];
  fears: string[];
  relationships: {
    allies: string[];
    conflicts_with: string[];
    depends_on: string[];
    influences: string[];
  };
}

export interface NarrativeArc {
  arc_name: string;
  stage: ArcStage;
  description: string;
  evidence: string[];
}

export interface Conflict {
  conflict_name: string;
  type: ConflictType;
  drivers: string[];
  pressure_points: string[];
  possible_breaks: string[];
}

export interface Opportunity {
  opportunity_name: string;
  conditions: string[];
  required_actions: string[];
  potential_outcome: string;
}

export interface Risk {
  risk_name: string;
  severity: Severity;
  indicators: string[];
  preventive_actions: string[];
}

export interface FutureScenario {
  scenario_name: string;
  probability: Probability;
  summary: string;
  domino_path: string[];
}

export interface RecommendedAction {
  action: string;
  expected_effect: string;
  risk_if_ignored: string;
}

export interface NarrativeModel {
  entities: Entity[];
  current_arcs: NarrativeArc[];
  conflicts: Conflict[];
  opportunities: Opportunity[];
  risks: Risk[];
  future_scenarios: FutureScenario[];
  recommended_actions: RecommendedAction[];
  narrative_summary: string;
}
