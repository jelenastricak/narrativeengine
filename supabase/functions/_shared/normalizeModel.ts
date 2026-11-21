// Shared by the analyze-narrative function and the web app. No dependencies.
const ROLES = ["protagonist", "antagonist", "wildcard", "neutral", "supporting"] as const;
const STAGES = ["rising_action", "tension", "decision_node", "resolution", "stagnation"] as const;
const CONFLICT_TYPES = ["resource", "alignment", "strategic", "interpersonal"] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const PROBABILITIES = ["low", "medium", "high"] as const;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter((s) => s.length > 0) : typeof v === "string" && v.trim() ? [v.trim()] : [];
function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = str(v).toLowerCase().replace(/[\s-]+/g, "_");
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}
const list = <T>(v: unknown, map: (r: Rec) => T | null): T[] =>
  Array.isArray(v) ? v.filter(isRec).map(map).filter((x): x is T => x !== null) : [];

export function normalizeNarrativeModel(input: unknown) {
  if (!isRec(input)) throw new Error("Analysis result is not an object");
  const model = {
    entities: list(input.entities, (e) => {
      const name = str(e.name);
      if (!name) return null;
      const rel = isRec(e.relationships) ? e.relationships : {};
      return {
        name,
        role: pick(e.role, ROLES, "neutral"),
        goals: strArr(e.goals),
        motivations: strArr(e.motivations),
        constraints: strArr(e.constraints),
        fears: strArr(e.fears),
        relationships: {
          allies: strArr(rel.allies),
          conflicts_with: strArr(rel.conflicts_with),
          depends_on: strArr(rel.depends_on),
          influences: strArr(rel.influences),
        },
      };
    }),
    current_arcs: list(input.current_arcs, (a) => {
      const arc_name = str(a.arc_name);
      if (!arc_name) return null;
      return { arc_name, stage: pick(a.stage, STAGES, "rising_action"), description: str(a.description), evidence: strArr(a.evidence) };
    }),
    conflicts: list(input.conflicts, (c) => {
      const conflict_name = str(c.conflict_name);
      if (!conflict_name) return null;
      return {
        conflict_name,
        type: pick(c.type, CONFLICT_TYPES, "strategic"),
        drivers: strArr(c.drivers),
        pressure_points: strArr(c.pressure_points),
        possible_breaks: strArr(c.possible_breaks),
      };
    }),
    opportunities: list(input.opportunities, (o) => {
      const opportunity_name = str(o.opportunity_name);
      if (!opportunity_name) return null;
      return {
        opportunity_name,
        conditions: strArr(o.conditions),
        required_actions: strArr(o.required_actions),
        potential_outcome: str(o.potential_outcome),
      };
    }),
    risks: list(input.risks, (r) => {
      const risk_name = str(r.risk_name);
      if (!risk_name) return null;
      return {
        risk_name,
        severity: pick(r.severity, SEVERITIES, "medium"),
        indicators: strArr(r.indicators),
        preventive_actions: strArr(r.preventive_actions),
      };
    }),
    future_scenarios: list(input.future_scenarios, (s) => {
      const scenario_name = str(s.scenario_name);
      if (!scenario_name) return null;
      return {
        scenario_name,
        probability: pick(s.probability, PROBABILITIES, "medium"),
        summary: str(s.summary),
        domino_path: strArr(s.domino_path),
      };
    }),
    recommended_actions: list(input.recommended_actions, (a) => {
      const action = str(a.action);
      if (!action) return null;
      return { action, expected_effect: str(a.expected_effect), risk_if_ignored: str(a.risk_if_ignored) };
    }),
    narrative_summary: str(input.narrative_summary),
  };
  const empty =
    !model.narrative_summary &&
    model.entities.length + model.current_arcs.length + model.conflicts.length + model.recommended_actions.length + model.risks.length + model.opportunities.length + model.future_scenarios.length === 0;
  if (empty) throw new Error("Analysis result contained no usable content");
  return model;
}

export const MAX_INPUT_CHARS = 100_000;

export const MIN_INPUT_CHARS = 20;
