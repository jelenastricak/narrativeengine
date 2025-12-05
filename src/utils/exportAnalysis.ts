import { NarrativeModel } from "@/types/narrative";

export function exportToJSON(model: NarrativeModel, filename = "narrative-analysis") {
  const dataStr = JSON.stringify(model, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPDF(model: NarrativeModel, filename = "narrative-analysis") {
  // Dynamic import to prevent blocking initial render
  const { default: jsPDF } = await import("jspdf");
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.5;
    }
    y += 4;
  };

  const addSection = (title: string) => {
    y += 6;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(192, 64, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    addText(title.toUpperCase(), 14, true);
    y += 2;
  };

  // Title
  doc.setTextColor(10, 10, 10);
  addText("THE NARRATIVE ENGINE", 18, true);
  addText("Strategic Narrative Intelligence Report", 10, false);
  y += 4;

  // Summary
  addSection("NARRATIVE SUMMARY");
  addText(model.narrative_summary, 10);

  // Entities
  if (model.entities.length > 0) {
    addSection("ENTITIES");
    for (const entity of model.entities) {
      addText(`${entity.name} [${entity.role.toUpperCase()}]`, 11, true);
      if (entity.goals.length) addText(`Goals: ${entity.goals.join(", ")}`, 9);
      if (entity.motivations.length) addText(`Motivations: ${entity.motivations.join(", ")}`, 9);
      if (entity.constraints.length) addText(`Constraints: ${entity.constraints.join(", ")}`, 9);
      y += 4;
    }
  }

  // Arcs
  if (model.current_arcs.length > 0) {
    addSection("CURRENT ARCS");
    for (const arc of model.current_arcs) {
      addText(`${arc.arc_name} — ${arc.stage.replace("_", " ").toUpperCase()}`, 11, true);
      addText(arc.description, 9);
      if (arc.evidence.length) addText(`Evidence: ${arc.evidence.join("; ")}`, 9);
      y += 4;
    }
  }

  // Conflicts
  if (model.conflicts.length > 0) {
    addSection("CONFLICTS");
    for (const conflict of model.conflicts) {
      addText(`${conflict.conflict_name} [${conflict.type.toUpperCase()}]`, 11, true);
      if (conflict.drivers.length) addText(`Drivers: ${conflict.drivers.join(", ")}`, 9);
      if (conflict.pressure_points.length) addText(`Pressure Points: ${conflict.pressure_points.join(", ")}`, 9);
      y += 4;
    }
  }

  // Opportunities
  if (model.opportunities.length > 0) {
    addSection("OPPORTUNITIES");
    for (const opp of model.opportunities) {
      addText(opp.opportunity_name, 11, true);
      addText(`Outcome: ${opp.potential_outcome}`, 9);
      if (opp.required_actions.length) addText(`Actions: ${opp.required_actions.join(", ")}`, 9);
      y += 4;
    }
  }

  // Risks
  if (model.risks.length > 0) {
    addSection("RISKS");
    for (const risk of model.risks) {
      addText(`${risk.risk_name} [${risk.severity.toUpperCase()}]`, 11, true);
      if (risk.indicators.length) addText(`Indicators: ${risk.indicators.join(", ")}`, 9);
      if (risk.preventive_actions.length) addText(`Prevention: ${risk.preventive_actions.join(", ")}`, 9);
      y += 4;
    }
  }

  // Future Scenarios
  if (model.future_scenarios.length > 0) {
    addSection("FUTURE SCENARIOS");
    for (const scenario of model.future_scenarios) {
      addText(`${scenario.scenario_name} [${scenario.probability.toUpperCase()} probability]`, 11, true);
      addText(scenario.summary, 9);
      if (scenario.domino_path.length) addText(`Path: ${scenario.domino_path.join(" → ")}`, 9);
      y += 4;
    }
  }

  // Recommended Actions
  if (model.recommended_actions.length > 0) {
    addSection("RECOMMENDED ACTIONS");
    for (const action of model.recommended_actions) {
      addText(action.action, 11, true);
      addText(`Expected Effect: ${action.expected_effect}`, 9);
      addText(`Risk if Ignored: ${action.risk_if_ignored}`, 9);
      y += 4;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`NARRATIVE ENGINE — Page ${i} of ${pageCount}`, margin, 290);
    doc.text(new Date().toISOString().split("T")[0], pageWidth - margin - 20, 290);
  }

  doc.save(`${filename}.pdf`);
}
