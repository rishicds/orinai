import { classificationSchema } from "@/lib/schemas/dashboard";
import type { ClassificationResult } from "@/types";
import { invokeAzureChat } from "@/lib/azure/model-router";

const ENHANCED_SYSTEM_PROMPT = `You are an intelligent visualization classifier for a multi-agent dashboard generation system. Your job is to analyze user queries and determine the optimal visualization approach.

CLASSIFICATION CRITERIA:

Visualization Types (choose ONE):
- "pie_chart": Proportions, percentages, parts of whole, market share, budget breakdown
- "bar_chart": Comparisons between categories, rankings, performance metrics
- "line_chart": Trends over time, growth patterns, temporal data, forecasts
- "table": Detailed data listings, structured information, multiple attributes
- "text": Explanations, summaries, concepts without quantitative data
- "timeline": Chronological events, project schedules, historical progressions
- "comparison": Side-by-side analysis, before/after, pros/cons
- "infographic": Visual summaries mixing charts, text, and graphics
- "analytics_summary": KPI dashboards, business metrics, performance overviews

Complexity Levels:
- "simple": Single chart or basic visualization
- "multi_chart": Multiple related visualizations
- "dashboard": Comprehensive multi-panel display with interactivity

Data Requirements:
- requiresRAG: true if query references user's specific data ("my data", "our company", "my files")
- requiresExternal: true if query needs current/external information ("latest", "current market", "recent news")
- requiresImage: true if query needs generated diagrams or illustrations

ANALYSIS APPROACH:
1. Identify key intent (comparison, trend analysis, breakdown, explanation)
2. Determine data complexity and visualization needs
3. Assess whether user or external data is required
4. Choose appropriate visualization type and complexity

Return ONLY valid JSON:
{
  "type": "selected_type",
  "complexity": "selected_complexity", 
  "requiresRAG": boolean,
  "requiresExternal": boolean,
  "requiresImage": boolean
}`;

/**
 * Enhanced heuristic fallback with better pattern recognition
 */
function enhancedHeuristicFallback(query: string): ClassificationResult {
  const normalized = query.toLowerCase();
  
  // Advanced pattern matching
  const patterns = {
    // Data source indicators
    requiresRAG: /\b(my|mine|our|company|organization|team|personal|custom|uploaded|dataset)\b/i,
    requiresExternal: /\b(latest|current|recent|news|market|trends|today|now|updated|live)\b/i,
    requiresImage: /\b(diagram|illustration|visualize|draw|graphic|image|chart|plot)\b/i,
    
    // Visualization type patterns
    pieChart: /\b(distribution|percentage|proportion|share|breakdown|composition|allocation|budget|spending)\b/i,
    barChart: /\b(compare|comparison|versus|vs|ranking|performance|metrics|categories|between)\b/i,
    lineChart: /\b(trend|growth|time|progress|over|forecast|projection|timeline|evolution|change)\b/i,
    table: /\b(list|table|data|details|records|entries|rows|columns|structured)\b/i,
    timeline: /\b(schedule|roadmap|chronology|history|sequence|events|milestones|phases)\b/i,
    comparison: /\b(compare|contrast|difference|similarity|versus|vs|pros|cons|advantages|disadvantages)\b/i,
    analytics: /\b(kpi|metrics|performance|dashboard|analytics|summary|overview|statistics)\b/i,
    infographic: /\b(infographic|visual|summary|overview|explanation|guide|process)\b/i
  };
  
  // Determine visualization type
  let type: ClassificationResult["type"] = "text";
  let complexity: ClassificationResult["complexity"] = "simple";
  
  if (patterns.analytics.test(normalized)) {
    type = "analytics_summary";
    complexity = "dashboard";
  } else if (patterns.pieChart.test(normalized)) {
    type = "pie_chart";
  } else if (patterns.lineChart.test(normalized)) {
    type = "line_chart";
  } else if (patterns.barChart.test(normalized)) {
    type = "bar_chart";
  } else if (patterns.timeline.test(normalized)) {
    type = "timeline";
  } else if (patterns.comparison.test(normalized)) {
    type = "comparison";
  } else if (patterns.table.test(normalized)) {
    type = "table";
  } else if (patterns.infographic.test(normalized)) {
    type = "infographic";
    complexity = "multi_chart";
  }
  
  // Determine complexity based on query length and multiple concepts
  const wordCount = normalized.split(/\s+/).length;
  const hasMultipleConcepts = /\band\b|\bor\b|\balso\b|\bplus\b|\btoo\b|\bincluding\b/i.test(normalized);
  
  if (wordCount > 20 || hasMultipleConcepts) {
    complexity = complexity === "simple" ? "multi_chart" : complexity;
  }
  
  if (/dashboard|comprehensive|detailed|full|complete/i.test(normalized)) {
    complexity = "dashboard";
  }
  
  return {
    type,
    complexity,
    requiresRAG: patterns.requiresRAG.test(normalized),
    requiresExternal: patterns.requiresExternal.test(normalized),
    requiresImage: patterns.requiresImage.test(normalized),
  };
}

/**
 * Enhanced Classifier Agent with improved reasoning
 */
export async function classifierAgent(query: string): Promise<ClassificationResult> {
  console.log("[Classifier] Analyzing query:", query);
  
  try {
    // First attempt: AI-powered classification
    const response = await invokeAzureChat(
      [
        { role: "system", content: ENHANCED_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze and classify this user query: "${query}"

Consider:
1. What type of visualization would best represent the answer?
2. How complex should the output be?
3. Does this need user-specific data or external/current information?
4. Would diagrams or images enhance understanding?

Respond with valid JSON only.`
        },
      ],
      { 
        intent: "classification", 
        responseFormat: "json", 
        temperature: 0.1
      }
    );

    const raw = response.choices[0]?.message?.content ?? "";
    console.log("[Classifier] AI response:", raw);
    
    const parsed = JSON.parse(raw);
    const validated = classificationSchema.parse(parsed);
    
    console.log("[Classifier] Classification result:", validated);
    return validated;
    
  } catch (error) {
    console.warn("[Classifier] AI classification failed, using enhanced heuristic:", error);
    
    // Fallback to enhanced heuristic
    const heuristicResult = enhancedHeuristicFallback(query);
    const validated = classificationSchema.parse(heuristicResult);
    
    console.log("[Classifier] Heuristic classification result:", validated);
    return validated;
  }
}

/**
 * Get classification confidence score for debugging/monitoring
 */
export async function classifyWithConfidence(query: string): Promise<{
  classification: ClassificationResult;
  confidence: number;
  reasoning: string;
}> {
  try {
    const classification = await classifierAgent(query);
    
    // Simple confidence scoring based on query clarity and pattern matches
    const normalized = query.toLowerCase();
    let confidence = 0.7; // Base confidence
    
    // Increase confidence for clear patterns
    if (/\b(chart|graph|plot|visualize|show|display)\b/i.test(normalized)) {
      confidence += 0.2;
    }
    
    // Decrease confidence for ambiguous queries
    if (normalized.split(/\s+/).length < 3) {
      confidence -= 0.2;
    }
    
    const reasoning = `Classification based on query patterns and visualization requirements. ` +
                     `Type: ${classification.type}, Complexity: ${classification.complexity}`;
    
    return {
      classification,
      confidence: Math.min(Math.max(confidence, 0.1), 1.0),
      reasoning
    };
    
  } catch (error) {
    const fallback = enhancedHeuristicFallback(query);
    return {
      classification: classificationSchema.parse(fallback),
      confidence: 0.3,
      reasoning: `Fallback classification due to error: ${error}`
    };
  }
}
