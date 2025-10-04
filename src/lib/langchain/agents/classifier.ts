import { classificationSchema } from "@/lib/schemas/dashboard";
import type { ClassificationResult } from "@/types";
import { invokeAzureChat } from "@/lib/azure/model-router";

const systemPrompt = `You are a visualization classifier. Analyze the query and determine the best output type.

VALID VALUES ONLY:
- type: MUST be one of: "pie_chart", "bar_chart", "line_chart", "table", "text", "timeline", "comparison", "infographic"
- complexity: MUST be one of: "simple", "multi_chart", "dashboard"
- requiresRAG: boolean (true if user data needed)
- requiresExternal: boolean (true if external data needed)
- requiresImage: boolean (true if image generation needed)

Chart type guidelines:
- pie_chart: distributions, percentages, breakdowns, shares
- bar_chart: comparisons between categories
- line_chart: trends over time, growth, progress
- table: detailed data listings
- timeline: chronological events, schedules, roadmaps
- comparison: side-by-side analysis
- text: explanations, summaries without data
- infographic: visual summaries with mixed content

Return ONLY valid JSON matching this exact structure:
{
  "type": "pie_chart",
  "complexity": "simple",
  "requiresRAG": false,
  "requiresExternal": false,
  "requiresImage": false
}`;

function heuristicFallback(query: string): ClassificationResult {
  const normalized = query.toLowerCase();
  const requiresImage = /diagram|illustration|visualize/.test(normalized);
  const requiresExternal = /trend|research|latest|news/.test(normalized);
  const requiresRAG = /my |mine |our |company|dataset/.test(normalized);
  let type: ClassificationResult["type"] = "text";

  if (/compare|vs|versus/.test(normalized)) {
    type = "bar_chart";
  } else if (/timeline|schedule|roadmap/.test(normalized)) {
    type = "timeline";
  } else if (/spend|budget|distribution|share|breakdown/.test(normalized)) {
    type = "pie_chart";
  } else if (/growth|trend|progress/.test(normalized)) {
    type = "line_chart";
  }

  return {
    type,
    complexity: "simple",
    requiresExternal,
    requiresImage,
    requiresRAG,
  };
}

export async function classifierAgent(query: string): Promise<ClassificationResult> {
  try {
    const response = await invokeAzureChat(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Classify this query: "${query}"

Remember:
- type MUST be: "pie_chart", "bar_chart", "line_chart", "table", "text", "timeline", "comparison", or "infographic"
- complexity MUST be: "simple", "multi_chart", or "dashboard"
- All booleans must be true or false

Return ONLY valid JSON with exactly these keys: type, complexity, requiresRAG, requiresExternal, requiresImage

Example: {"type": "bar_chart", "complexity": "simple", "requiresRAG": false, "requiresExternal": false, "requiresImage": false}`,
        },
      ],
      { intent: "classification", responseFormat: "json", temperature: 0 }
    );

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw);
    return classificationSchema.parse(parsed);
  } catch (error) {
    console.warn("[Classifier] Falling back to heuristic classifier", error);
    return classificationSchema.parse(heuristicFallback(query));
  }
}
