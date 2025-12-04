import { NarrativeModel } from '@/types/narrative';

export const mockNarrative: NarrativeModel = {
  entities: [
    {
      name: "APEX CORP",
      role: "protagonist",
      goals: ["Market dominance in Q3", "Acquisition of TechStart"],
      motivations: ["Shareholder pressure", "Competitive threat from NEXUS"],
      constraints: ["Regulatory scrutiny", "Capital allocation limits"],
      fears: ["Market share erosion", "Key talent departure"],
      relationships: {
        allies: ["BoardCo Ventures", "Senator Mills"],
        conflicts_with: ["NEXUS INC", "Regulatory Commission"],
        depends_on: ["Supply Chain Partners", "Key Engineering Team"],
        influences: ["Media narratives", "Industry standards"]
      }
    },
    {
      name: "NEXUS INC",
      role: "antagonist",
      goals: ["Disrupt APEX market position", "IPO by end of year"],
      motivations: ["VC pressure for growth", "Founder's vision"],
      constraints: ["Burn rate concerns", "Talent competition"],
      fears: ["Funding dry-up", "APEX acquisition of key partners"],
      relationships: {
        allies: ["Sovereign Wealth Fund Alpha", "Tech Media"],
        conflicts_with: ["APEX CORP", "Legacy Suppliers"],
        depends_on: ["Cloud Infrastructure", "Developer Community"],
        influences: ["Startup ecosystem", "Tech journalism"]
      }
    },
    {
      name: "REGULATORY COMMISSION",
      role: "neutral",
      goals: ["Market stability", "Consumer protection"],
      motivations: ["Political mandate", "Public interest"],
      constraints: ["Limited enforcement resources", "Political pressure"],
      fears: ["Market manipulation", "Systemic risk"],
      relationships: {
        allies: [],
        conflicts_with: [],
        depends_on: ["Congressional funding", "Legal framework"],
        influences: ["Both APEX and NEXUS operations"]
      }
    },
    {
      name: "KEY ENGINEER (CHEN)",
      role: "wildcard",
      goals: ["Technical excellence", "Career advancement"],
      motivations: ["Innovation drive", "Recognition"],
      constraints: ["Non-compete clause", "Family obligations"],
      fears: ["Stagnation", "Being caught in corporate crossfire"],
      relationships: {
        allies: ["Engineering team", "Industry peers"],
        conflicts_with: [],
        depends_on: ["APEX employment"],
        influences: ["Critical IP development"]
      }
    }
  ],
  current_arcs: [
    {
      arc_name: "THE ACQUISITION GAMBIT",
      stage: "tension",
      description: "APEX moves toward TechStart acquisition while NEXUS attempts counter-positioning",
      evidence: ["Board meeting minutes show acceleration", "NEXUS PR campaign intensifies"]
    },
    {
      arc_name: "TALENT WAR",
      stage: "rising_action",
      description: "Competition for key engineering talent reaches critical phase",
      evidence: ["Chen receives competing offers", "Retention packages being deployed"]
    },
    {
      arc_name: "REGULATORY RECKONING",
      stage: "decision_node",
      description: "Commission review enters final determination phase",
      evidence: ["Hearing scheduled for next month", "Both parties filing responses"]
    }
  ],
  conflicts: [
    {
      conflict_name: "MARKET POSITION WARFARE",
      type: "strategic",
      drivers: ["Overlapping customer base", "Limited market expansion room", "Investor expectations"],
      pressure_points: ["Enterprise client renewals in Q2", "Product launch timing"],
      possible_breaks: ["Market segmentation agreement", "One party exits segment"]
    },
    {
      conflict_name: "TALENT RESOURCE COMPETITION",
      type: "resource",
      drivers: ["Limited senior engineering talent", "Competitive compensation escalation"],
      pressure_points: ["Chen's contract renewal", "Team morale at both companies"],
      possible_breaks: ["Chen departure resolves tension", "Industry-wide hiring freeze"]
    },
    {
      conflict_name: "REGULATORY ALIGNMENT",
      type: "alignment",
      drivers: ["Different compliance interpretations", "Lobbying conflicts"],
      pressure_points: ["Upcoming hearing", "Public perception"],
      possible_breaks: ["Clear regulatory guidance", "Settlement agreement"]
    }
  ],
  opportunities: [
    {
      opportunity_name: "PARTNERSHIP PIVOT",
      conditions: ["NEXUS burn rate creates vulnerability", "Market conditions favor consolidation"],
      required_actions: ["Initiate back-channel discussions", "Prepare partnership framework"],
      potential_outcome: "Strategic alliance replacing competition"
    },
    {
      opportunity_name: "CHEN RETENTION WIN",
      conditions: ["Counter-offer window open", "Chen values stability"],
      required_actions: ["Accelerate equity package", "Define clear growth path"],
      potential_outcome: "Secure critical IP and team stability"
    }
  ],
  risks: [
    {
      risk_name: "CHEN DEPARTURE",
      severity: "high",
      indicators: ["Reduced meeting attendance", "Updated LinkedIn profile", "Recruiter activity"],
      preventive_actions: ["Immediate retention conversation", "Accelerate promotion timeline"]
    },
    {
      risk_name: "REGULATORY ADVERSE RULING",
      severity: "critical",
      indicators: ["Unfavorable preliminary findings", "Political climate shift"],
      preventive_actions: ["Intensify lobbying", "Prepare compliance pivot plan"]
    },
    {
      risk_name: "NEXUS MARKET DISRUPTION",
      severity: "medium",
      indicators: ["New product announcements", "Pricing pressure signals"],
      preventive_actions: ["Accelerate own product roadmap", "Strengthen customer relationships"]
    }
  ],
  future_scenarios: [
    {
      scenario_name: "HOSTILE TAKEOVER CASCADE",
      probability: "medium",
      summary: "APEX acquisition triggers NEXUS defensive measures leading to industry consolidation",
      domino_path: [
        "APEX announces TechStart acquisition",
        "NEXUS seeks emergency funding",
        "Sovereign fund demands board seats",
        "Market perceives instability",
        "Industry consolidation accelerates"
      ]
    },
    {
      scenario_name: "TALENT EXODUS EVENT",
      probability: "low",
      summary: "Key departures create cascading team instability across both organizations",
      domino_path: [
        "Chen accepts NEXUS offer",
        "APEX team members follow",
        "IP development stalls",
        "Market confidence drops",
        "Both companies weakened"
      ]
    },
    {
      scenario_name: "REGULATORY RESET",
      probability: "high",
      summary: "New regulatory framework forces both parties to restructure operations",
      domino_path: [
        "Commission issues new guidelines",
        "Both companies must pivot",
        "Compliance costs increase",
        "Market dynamics shift",
        "New equilibrium emerges"
      ]
    }
  ],
  recommended_actions: [
    {
      action: "INITIATE CHEN RETENTION PROTOCOL IMMEDIATELY",
      expected_effect: "Secures critical talent and IP, stabilizes team morale",
      risk_if_ignored: "Potential 40% productivity loss and competitive intelligence leak"
    },
    {
      action: "PREPARE REGULATORY CONTINGENCY FRAMEWORK",
      expected_effect: "Enables rapid pivot regardless of ruling outcome",
      risk_if_ignored: "6-month operational paralysis if adverse ruling"
    }
  ],
  narrative_summary: "APEX CORP faces a critical inflection point. The convergence of three active arcs—acquisition, talent retention, and regulatory review—creates a high-stakes environment requiring immediate action. The Chen situation represents the highest-leverage intervention point. Failure to act within the next 14 days significantly increases probability of the TALENT EXODUS scenario, which would compound losses across all other arcs."
};
