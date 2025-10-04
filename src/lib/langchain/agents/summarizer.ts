import { dashboardSchema } from "@/lib/schemas/dashboard";
import type {
  ClassificationResult,
  DashboardOutput,
  RetrievalResult,
} from "@/types";
import { invokeAzureChat } from "@/lib/azure/model-router";
import { queryMultipleAIServices } from "@/lib/ai/multi-service";

export type SummarizerParams = {
  query: string;
  context: RetrievalResult | null;
  classification: ClassificationResult;
};

function buildContextString(context: RetrievalResult | null): string {
  if (!context || context.chunks.length === 0) {
    return "No additional context available.";
  }

  return context.chunks
    .map((chunk, index) => `Chunk ${index + 1}: ${chunk.text}`)
    .join("\n\n");
}

function buildComparisonNarrative(query: string): DashboardOutput {
  return {
    type: "comparison",
    title: "Comparative Analysis of F1 Implementations",
    summary:
      `F1 teams are professional motorsport organizations that design, build, and race Formula 1 cars in the championship, managing drivers, engineers, and strategy to compete for the Constructors' and Drivers' titles. This narrative is generated as an offline preview for the query "${query}".`,
    data: [
      {
        heading: "F1 in 2000",
        bullets: [
          "Ferrari – Dominant powerhouse led by Michael Schumacher, known for its fast cars and strategic excellence.",
          "McLaren – Strong contender with Mika Häkkinen and David Coulthard, famed for speed and innovation.",
          "Williams – Experienced British team with powerful BMW engines, competitive aerodynamics, and reliability.",
          "Benetton – Competitive mid-field team with a focus on driver development and clever engineering.",
          "Jordan – Known for bold strategies and punching above its weight in midfield battles.",
          "BAR (British American Racing) – Newer team making steady progress, blending British engineering with Honda engines.",
          "Sauber – Consistent midfield performer with solid engineering and occasional points finishes.",
          "Minardi – Small independent team with limited budget but strong passion and occasional surprises.",
        ],
      },
      {
        heading: "F1 in 2025",
        bullets: [
          "Red Bull Racing – Dominant modern team with cutting-edge aerodynamics, Max Verstappen as lead driver, and multiple championships.",
          "Mercedes-AMG Petronas – Highly competitive technological powerhouse, known for efficiency and driver talent.",
          "Ferrari – Resurgent contender focusing on strategy, power unit improvements, and iconic racing heritage.",
          "McLaren – Innovative squad emphasizing aerodynamics and a balanced driver lineup.",
          "Aston Martin – Ambitious team investing in facilities and veteran experience to climb the standings.",
          "Alpine – Works team building momentum through chassis refinements and engine reliability.",
          "Williams – Rebuilding era with renewed investment, data-driven strategy, and future-focused development.",
          "Visa Cash App RB – Agile outfit leveraging Red Bull technology for sharp midfield performances.",
        ],
      },
    ],
    sublinks: [
      {
        label: "View full motorsport timeline",
        route: "/dashboard/motorsport-timeline",
        context: {
          type: "timeline",
          category: "motorsport",
          teams: 8,
          seasonYear: 2024
        },
      },
    ],
  };
}

function buildChartFallback(classification: ClassificationResult, query: string): DashboardOutput {
  return {
    type: classification.type,
    title: truncateTitle(`Preview for: ${query}`),
    data: [
      { label: "Category A", value: 45 },
      { label: "Category B", value: 30 },
      { label: "Category C", value: 25 },
      { label: "Category D", value: 15 },
    ],
    summary:
      "This is a placeholder visualization. Connect Azure OpenAI and Pinecone to see live results tailored to your data.",
    sublinks: [
      {
        label: "Connect data sources",
        route: "/dashboard/setup",
        context: {
          action: "setup",
          dataSourcesNeeded: ["Azure OpenAI", "Pinecone"],
          currentStatus: "placeholder",
          nextStep: "configure_apis"
        },
      },
    ],
  };
}

function fallbackDashboard(classification: ClassificationResult, query: string): DashboardOutput {
  const normalized = query.toLowerCase();

  if (normalized.includes("f1") || normalized.includes("formula 1")) {
    return dashboardSchema.parse(buildComparisonNarrative(query));
  }

  const textualTypes: ClassificationResult["type"][] = [
    "text",
    "comparison",
    "timeline",
    "infographic",
  ];

  if (textualTypes.includes(classification.type)) {
    return {
      type: classification.type,
      title: truncateTitle(`Narrative preview: ${query}`),
      data: [
        {
          heading: "Key takeaways",
          bullets: [
            `This offline preview outlines the main aspects related to "${query}".`,
            "Connect your Azure OpenAI deployment to replace this placeholder narrative with live insights.",
            "Link real datasets in Appwrite or your preferred vector store to ground the analysis with facts.",
          ],
        },
        {
          heading: "What to do next",
          bullets: [
            "Add your domain documents to the retrieval pipeline.",
            "Map critical KPIs and labels so charts stay consistent across queries.",
            "Iterate on prompt templates to fine-tune tone and fidelity.",
          ],
        },
      ],
      summary:
        "This is an offline narrative preview. Once Azure OpenAI is configured, the assistant will generate domain-specific insights with citations and context-aware drill downs.",
      sublinks: [
        {
          label: "Enable Azure OpenAI",
          route: "/dashboard/setup/llm",
          context: {
            service: "Azure OpenAI",
            setupType: "llm_configuration",
            priority: "high",
            requiredFor: "domain_specific_insights"
          },
        },
      ],
    } satisfies DashboardOutput;
  }

  return buildChartFallback(classification, query);
}

// Enhanced wiki content generation using multiple AI services
async function generateWikiContent(query: string): Promise<DashboardOutput> {
  try {
    console.log("[Summarizer] Generating comprehensive wiki content for:", query);
    
    const multiServiceResult = await queryMultipleAIServices(query);
    
    // Parse the merged content into structured sections
    const sections = parseContentIntoSections(multiServiceResult.mergedContent);
    
    return {
      type: "text",
      title: generateWikiTitle(query),
      data: sections,
      summary: generateSummaryFromContent(multiServiceResult.mergedContent),
      citations: multiServiceResult.sources.length > 0 ? multiServiceResult.sources : undefined,
    };
  } catch (error) {
    console.error("[Summarizer] Multi-service generation failed:", error);
    // Fallback to single service or offline content
    return generateFallbackWikiContent(query);
  }
}

function truncateTitle(title: string, maxLength: number = 120): string {
  if (title.length <= maxLength) {
    return title;
  }
  return title.substring(0, maxLength - 3) + '...';
}

function generateWikiTitle(query: string): string {
  // Capitalize first letter and clean up the query for a nice title
  const cleaned = query.trim();
  const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return truncateTitle(title);
}

function generateSummaryFromContent(content: string): string {
  // Extract first paragraph or first 200 characters as summary
  const firstParagraph = content.split('\n\n')[0];
  if (firstParagraph && firstParagraph.length > 20) {
    return firstParagraph.replace(/^#+\s*/, '').trim();
  }
  
  const truncated = content.substring(0, 200).trim();
  return truncated + (content.length > 200 ? '...' : '');
}

function parseContentIntoSections(content: string): Array<Record<string, unknown>> {
  const sections: Array<Record<string, unknown>> = [];
  
  // Split content by headers or major sections
  const parts = content.split(/(?:^|\n)(?:#{1,3}\s*(.+?)(?:\n|$))/gm);
  
  let currentSection: Record<string, unknown> = {};
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]?.trim();
    if (!part) continue;
    
    // Check if this looks like a header
    if (part.length < 100 && !part.includes('\n')) {
      // Save previous section if it has content
      if (Object.keys(currentSection).length > 0) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        heading: part,
      };
    } else {
      // This is body content
      const bullets = extractBulletPoints(part);
      if (bullets.length > 0) {
        currentSection.bullets = bullets;
      } else {
        currentSection.description = part;
      }
    }
  }
  
  // Add the last section
  if (Object.keys(currentSection).length > 0) {
    sections.push(currentSection);
  }
  
  // If no structured sections found, create a basic structure
  if (sections.length === 0) {
    return [
      {
        heading: "Overview",
        description: content.substring(0, 1000),
      }
    ];
  }
  
  return sections;
}

function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match bullet points (-, *, •, numbers, etc.)
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
    }
  }
  
  return bullets;
}

function generateFallbackWikiContent(query: string): DashboardOutput {
  return {
    type: "text",
    title: generateWikiTitle(query),
    data: [
      {
        heading: "About " + query,
        description: `This is a comprehensive overview of ${query}. The content generation is currently using fallback mode.`,
        bullets: [
          "Multi-service AI integration is being configured",
          "Connect your Gemini, Perplexity, and HuggingFace API keys for enhanced content",
          "This fallback provides basic structure and formatting"
        ]
      },
      {
        heading: "Key Features",
        bullets: [
          "Real-time content generation from multiple AI sources",
          "Comprehensive research and fact-checking capabilities", 
          "Wiki-style formatting with citations and references",
          "Structured sections with headings and bullet points"
        ]
      }
    ],
    summary: `Comprehensive information about ${query} generated using AI-powered research and analysis.`,
  };
}

export async function summarizerAgent({
  query,
  context,
  classification,
}: SummarizerParams): Promise<DashboardOutput> {
  const contextString = buildContextString(context);

  // For text-based content types, use multi-service wiki generation
  const textualTypes: ClassificationResult["type"][] = [
    "text",
    "comparison", 
    "timeline",
    "infographic",
  ];

  if (textualTypes.includes(classification.type)) {
    return await generateWikiContent(query);
  }

  // For chart types, use the existing chart generation logic
  try {
    const systemPrompt = `You are a data visualization expert. Convert queries into structured dashboard JSON.

REQUIRED SCHEMA:
{
  "type": "pie_chart" | "bar_chart" | "line_chart" | "table" | "text" | "timeline" | "comparison" | "infographic",
  "title": "string (5-120 chars)",
  "data": [
    {"label": "Item 1", "value": 100},
    {"label": "Item 2", "value": 200}
  ],
  "summary": "Brief explanation (optional)",
  "config": {"xAxis": "string", "yAxis": "string", "colors": ["#hex"], "legend": true} (optional),
  "sublinks": [{"label": "text", "route": "/path", "context": {}}] (optional)
}

CRITICAL RULES:
1. "data" MUST be an ARRAY of objects, NOT a single object
2. "type" MUST match one of the exact enum values above
3. "title" is REQUIRED and must be 5-120 characters
4. Each data item should have at least "label" and "value" keys
5. Return ONLY valid JSON, no markdown or explanation`;

    const response = await invokeAzureChat(
      [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Query: "${query}"
Visualization Type: ${classification.type}
Context: ${contextString}

Generate dashboard JSON with:
- type: "${classification.type}" (use this exact value)
- title: descriptive title about "${query}" (MAX 120 characters)
- data: ARRAY of at least 3-5 data objects with label and value
- summary: brief explanation (optional)

Example for pie_chart:
{
  "type": "pie_chart",
  "title": "Sample Distribution Analysis",
  "data": [
    {"label": "Category A", "value": 45},
    {"label": "Category B", "value": 30},
    {"label": "Category C", "value": 25}
  ],
  "summary": "Distribution shows..."
}

Return ONLY the JSON:`,
        },
      ],
      {
        intent: "summarization",
        responseFormat: "json",
        temperature: 0.2,
      }
    );

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw);
    
    // Ensure title doesn't exceed 120 characters before schema validation
    if (parsed.title && typeof parsed.title === 'string') {
      parsed.title = truncateTitle(parsed.title);
    }
    
    return dashboardSchema.parse(parsed);
  } catch (error) {
    console.error("[Summarizer] Falling back to offline dashboard", error);
    return dashboardSchema.parse(fallbackDashboard(classification, query));
  }
}
