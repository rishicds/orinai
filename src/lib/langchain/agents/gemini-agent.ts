// Custom Gemini-based agent that doesn't rely on OpenAI-specific LangChain features
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { DashboardOutput } from "@/types";

export class GeminiDashboardAgent {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      throw new Error("Missing or invalid NEXT_PUBLIC_GEMINI_API_KEY");
    }

    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.1,
      apiKey: apiKey
    });
  }

  async generateDashboard(query: string, userId: string): Promise<DashboardOutput> {
    console.log("[Gemini Agent] Processing query:", query);

    // Step 1: Classification
    const classification = await this.classifyQuery(query);
    console.log("[Gemini Agent] Classification:", classification);

    // Step 2: Generate dashboard
    const dashboard = await this.generateDashboardWithContext(query, classification, userId);
    console.log("[Gemini Agent] Dashboard generated successfully");

    return dashboard;
  }

  private async classifyQuery(query: string) {
    const classificationPrompt = ChatPromptTemplate.fromTemplate(`
      Classify this query for visualization: "{query}"
      
      Return JSON with:
      - type: pie_chart|bar_chart|line_chart|table|text|timeline|comparison|infographic
      - complexity: simple|multi_chart|dashboard
      - requiresRAG: boolean
      - requiresExternal: boolean
      - requiresImage: boolean
      
      Return only valid JSON, no markdown or explanation.
    `);

    try {
      const response = await this.model.invoke(
        await classificationPrompt.format({ query })
      );
      
      const result = JSON.parse(response.content as string);
      return result;
    } catch (_error) {
      console.warn("[Gemini Agent] Classification failed, using fallback");
      return {
        type: "text",
        complexity: "simple",
        requiresRAG: false,
        requiresExternal: false,
        requiresImage: false
      };
    }
  }

  private async generateDashboardWithContext(
    query: string, 
    classification: { type: string; complexity: string; requiresRAG: boolean; requiresExternal: boolean; requiresImage: boolean }, 
    _userId: string
  ): Promise<DashboardOutput> {
    const dashboardPrompt = ChatPromptTemplate.fromTemplate(`
      Create a {type} dashboard for the query: "{query}"
      
      Generate JSON with this exact structure:
      {{
        "type": "{type}",
        "title": "descriptive title (5-120 characters)",
        "data": [
          {{"label": "Item 1", "value": 100}},
          {{"label": "Item 2", "value": 200}},
          {{"label": "Item 3", "value": 150}}
        ],
        "summary": "brief explanation of the visualization",
        "sublinks": [
          {{
            "label": "Explore Details",
            "route": "/explore/{type}",
            "context": {{
              "type": "{type}",
              "query": "{query}",
              "dataPoints": 3,
              "generated": "{timestamp}"
            }}
          }},
          {{
            "label": "Related Analysis", 
            "route": "/analyze/related",
            "context": {{
              "relatedTo": "{type}",
              "originalQuery": "{query}",
              "suggestions": ["trend analysis", "comparative study"]
            }}
          }}
        ],
        "config": {{
          "responsive": true,
          "legend": true
        }}
      }}
      
      CRITICAL REQUIREMENTS:
      1. Return ONLY valid JSON, no markdown or explanation
      2. "data" MUST be an array of objects with "label" and "value" properties
      3. "sublinks" context objects MUST NOT be empty - include meaningful data
      4. "title" must be between 5-120 characters
      5. Use "{type}" exactly as provided
      
      Generate realistic data relevant to the query.
    `);

    try {
      const response = await this.model.invoke(
        await dashboardPrompt.format({ 
          query, 
          type: classification.type,
          timestamp: new Date().toISOString()
        })
      );
      
      const content = response.content as string;
      
      // Clean up the response - remove markdown if present
      const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      const dashboard = JSON.parse(jsonContent);
      
      // Ensure required fields are present
      if (!dashboard.type) dashboard.type = classification.type;
      if (!dashboard.title) dashboard.title = `${classification.type} Analysis`;
      if (!Array.isArray(dashboard.data)) dashboard.data = [];
      if (!dashboard.summary) dashboard.summary = `Generated ${classification.type} for: ${query}`;
      
      // Ensure sublinks have proper context
      if (dashboard.sublinks) {
        dashboard.sublinks.forEach((link: { context?: Record<string, unknown> } & Record<string, unknown>) => {
          if (!link.context || Object.keys(link.context).length === 0) {
            link.context = {
              type: classification.type,
              query: query,
              fallback: true,
              generated: new Date().toISOString()
            };
          }
        });
      }
      
      return dashboard;
      
    } catch (_error) {
      console.warn("[Gemini Agent] Dashboard generation failed, using fallback");
      
      // Fallback dashboard
      return {
        type: classification.type,
        title: `${classification.type.replace('_', ' ')} Analysis`,
        data: [
          { label: "Category A", value: 40 },
          { label: "Category B", value: 35 },
          { label: "Category C", value: 25 }
        ],
        summary: `Generated ${classification.type} visualization for: ${query}`,
        sublinks: [
          {
            label: "Explore Details",
            route: `/explore/${classification.type}`,
            context: {
              type: classification.type,
              query: query,
              fallback: true,
              dataPoints: 3
            }
          }
        ],
        config: {
          responsive: true,
          legend: true
        }
      };
    }
  }
}

// Export function that matches the existing interface
export async function executeGeminiAgent(query: string, userId: string): Promise<DashboardOutput> {
  const agent = new GeminiDashboardAgent();
  return agent.generateDashboard(query, userId);
}