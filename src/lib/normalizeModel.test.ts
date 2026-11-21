import { describe, it, expect } from "vitest";
import { normalizeNarrativeModel } from "./normalizeModel";

describe("normalizeNarrativeModel", () => {
  it("fills missing lists with empty arrays", () => {
    const m = normalizeNarrativeModel({ narrative_summary: "A summary" });
    expect(m.entities).toEqual([]);
    expect(m.risks).toEqual([]);
    expect(m.narrative_summary).toBe("A summary");
  });

  it("falls back to safe values for unknown labels", () => {
    const m = normalizeNarrativeModel({
      narrative_summary: "x",
      entities: [{ name: "Acme", role: "villain" }],
      risks: [{ risk_name: "R", severity: "extreme" }],
      future_scenarios: [{ scenario_name: "S", probability: "HIGH" }],
      current_arcs: [{ arc_name: "A", stage: "decision node" }],
    });
    expect(m.entities[0].role).toBe("neutral");
    expect(m.entities[0].relationships.allies).toEqual([]);
    expect(m.risks[0].severity).toBe("medium");
    expect(m.future_scenarios[0].probability).toBe("high");
    expect(m.current_arcs[0].stage).toBe("decision_node");
  });

  it("drops items without a name", () => {
    const m = normalizeNarrativeModel({ narrative_summary: "x", entities: [{ role: "neutral" }, { name: "B" }] });
    expect(m.entities.map((e) => e.name)).toEqual(["B"]);
  });

  it("rejects a reply with no usable content", () => {
    expect(() => normalizeNarrativeModel({})).toThrow();
    expect(() => normalizeNarrativeModel("nope")).toThrow();
  });

  it("keeps usable risk-only results instead of rejecting them as empty", () => {
    const model = normalizeNarrativeModel({ risks: [{ risk_name: "Launch outage", severity: "high" }] });
    expect(model.risks[0].risk_name).toBe("Launch outage");
    expect(model.risks[0].severity).toBe("high");
  });
});
