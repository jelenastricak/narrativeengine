import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a strategic narrative intelligence analyst. Your job is to parse input text and extract a structured narrative model.

Given ANY text input (notes, documents, updates, transcripts, goals, market data, friction logs, etc.), extract:
1. Entities (actors with roles, goals, motivations, constraints, fears, relationships)
2. Current narrative arcs (with stage: rising_action, tension, decision_node, resolution, stagnation)
3. Conflicts (resource, alignment, strategic, interpersonal)
4. Opportunities (with conditions, required actions, potential outcomes)
5. Risks (with severity: low, medium, high, critical)
6. Future scenarios (with probability: low, medium, high)
7. Recommended actions
8. A narrative summary

Be analytical, tactical, and precise. Extract only what is supported by the evidence in the text.
Do not embellish or create fictional elements not present in the input.

You MUST respond with valid JSON matching this exact schema:
{
  "entities": [
    {
      "name": "string",
      "role": "protagonist | antagonist | wildcard | neutral | supporting",
      "goals": ["string"],
      "motivations": ["string"],
      "constraints": ["string"],
      "fears": ["string"],
      "relationships": {
        "allies": ["string"],
        "conflicts_with": ["string"],
        "depends_on": ["string"],
        "influences": ["string"]
      }
    }
  ],
  "current_arcs": [
    {
      "arc_name": "string",
      "stage": "rising_action | tension | decision_node | resolution | stagnation",
      "description": "string",
      "evidence": ["string"]
    }
  ],
  "conflicts": [
    {
      "conflict_name": "string",
      "type": "resource | alignment | strategic | interpersonal",
      "drivers": ["string"],
      "pressure_points": ["string"],
      "possible_breaks": ["string"]
    }
  ],
  "opportunities": [
    {
      "opportunity_name": "string",
      "conditions": ["string"],
      "required_actions": ["string"],
      "potential_outcome": "string"
    }
  ],
  "risks": [
    {
      "risk_name": "string",
      "severity": "low | medium | high | critical",
      "indicators": ["string"],
      "preventive_actions": ["string"]
    }
  ],
  "future_scenarios": [
    {
      "scenario_name": "string",
      "probability": "low | medium | high",
      "summary": "string",
      "domino_path": ["string"]
    }
  ],
  "recommended_actions": [
    {
      "action": "string",
      "expected_effect": "string",
      "risk_if_ignored": "string"
    }
  ],
  "narrative_summary": "string"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing narrative for text of length:', text.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze the following text and extract a structured narrative model:\n\n${text}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing JSON...');

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const narrativeModel = JSON.parse(jsonContent);
    console.log('Narrative model parsed successfully');

    return new Response(
      JSON.stringify(narrativeModel),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-narrative:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
