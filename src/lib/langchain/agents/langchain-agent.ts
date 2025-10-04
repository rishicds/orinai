import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import type { DashboardOutput, ClassificationResult, RetrievalResult } from "@/types";

// LangChain Tool Definitions
class ClassifierTool extends Tool {
  name = "classify_visualization";
  description = "Classifies user query to determine optimal visualization type and requirements";

  constructor() {
    super();
  }

  async _call(query: string): Promise<string> {
    const prompt = `Classify this query for visualization: "${query}"
    
Return JSON with:
- type: pie_chart|bar_chart|line_chart|table|text|timeline|comparison|infographic
- complexity: simple|multi_chart|dashboard
- requiresRAG: boolean
- requiresExternal: boolean
- requiresImage: boolean`;

    try {
      // Use your existing Azure model infrastructure
      const { invokeAzureChat } = await import("@/lib/azure/model-router");
      
      const response = await invokeAzureChat([
        { role: "system", content: "You are a visualization classifier. Return only valid JSON." },
        { role: "user", content: prompt }
      ], { intent: "classification", responseFormat: "json", temperature: 0.1 });

      return response.choices[0]?.message?.content || '{"type":"text","complexity":"simple","requiresRAG":false,"requiresExternal":false,"requiresImage":false}';
    } catch (error) {
      console.warn("[ClassifierTool] AI failed, using fallback classification");
      
      // Simple classification logic based on keywords
      const type = query.toLowerCase().includes('pie') ? 'pie_chart' :
                   query.toLowerCase().includes('bar') ? 'bar_chart' :
                   query.toLowerCase().includes('line') ? 'line_chart' :
                   query.toLowerCase().includes('timeline') ? 'timeline' :
                   query.toLowerCase().includes('compare') ? 'comparison' : 'text';
      
      return JSON.stringify({
        type,
        complexity: "simple",
        requiresRAG: query.toLowerCase().includes('user') || query.toLowerCase().includes('my'),
        requiresExternal: query.toLowerCase().includes('latest') || query.toLowerCase().includes('current'),
        requiresImage: false
      });
    }
  }
}

class RetrieverTool extends Tool {
  name = "retrieve_context";
  description = "Retrieves relevant context from user memory (Pinecone) or external sources";
  
  constructor() {
    super();
  }

  async _call(input: string): Promise<string> {
    const { query, userId, classification } = JSON.parse(input);
    
    try {
      const { userMemoryManager } = await import("@/lib/memory/user-memory");
      
      let context: RetrievalResult = { chunks: [], citations: [] };
      
      // Try user memory first if RAG is needed
      if (classification.requiresRAG && userId) {
        const memories = await userMemoryManager.searchMemories(userId, query, 3, 0.7);
        context.chunks = memories.map(m => ({ 
          text: m.content, 
          source: `User Memory: ${m.context}`,
          relevance: m.similarity 
        }));
      }
      
      // Add external context if needed
      if (classification.requiresExternal || context.chunks.length === 0) {
        context.chunks.push({
          text: `External knowledge context for: ${query}. This would typically come from real-time APIs or web search.`,
          source: "External Knowledge",
          relevance: 0.8
        });
      }
      
      return JSON.stringify(context);
    } catch (error) {
      console.warn("[RetrieverTool] Error:", error);
      return JSON.stringify({ chunks: [], citations: [] });
    }
  }
}

class SummarizerTool extends Tool {
  name = "generate_dashboard";
  description = "Generates structured dashboard JSON with data, config, and sublinks";
  
  constructor() {
    super();
  }

  async _call(input: string): Promise<string> {
    const { query, context, classification } = JSON.parse(input);
    
    const prompt = `Create a ${classification.type} dashboard for: "${query}"

Context: ${JSON.stringify(context, null, 2)}

Generate JSON with:
- type: "${classification.type}"
- title: descriptive title
- data: array of data points with label/value
- summary: brief description
- sublinks: 2-3 related exploration links with routes like "/explore/[topic]"

Keep it concise and relevant.`;

    try {
      const { invokeAzureChat } = await import("@/lib/azure/model-router");
      
      const response = await invokeAzureChat([
        { role: "system", content: "Generate dashboard JSON. Be concise and practical." },
        { role: "user", content: prompt }
      ], { intent: "generation", responseFormat: "json", temperature: 0.3 });

      const result = response.choices[0]?.message?.content;
      
      // Basic validation and cleanup
      try {
        const parsed = JSON.parse(result || '{}');
        return JSON.stringify({
          type: classification.type,
          title: parsed.title || `${classification.type} Analysis`,
          data: parsed.data || [],
          summary: parsed.summary || `Analysis results for ${query}`,
          sublinks: parsed.sublinks || [],
          ...parsed
        });
      } catch {
        return JSON.stringify({
          type: classification.type,
          title: `${classification.type} Analysis`,
          data: [],
          summary: `Generated analysis for: ${query}`,
          sublinks: []
        });
      }
    } catch (error) {
      console.warn("[SummarizerTool] Azure model failed, using fallback generation");
      
      // Generate mock data for testing/fallback
      const mockData = classification.type === 'pie_chart' ? 
        [{ label: 'Category A', value: 40 }, { label: 'Category B', value: 35 }, { label: 'Category C', value: 25 }] :
        classification.type === 'bar_chart' ?
        [{ label: '2021', value: 100 }, { label: '2022', value: 150 }, { label: '2023', value: 200 }] :
        classification.type === 'timeline' ?
        [{ label: '1950s', value: 1, category: 'Early AI' }, { label: '1980s', value: 2, category: 'Expert Systems' }, { label: '2010s', value: 3, category: 'Deep Learning' }] :
        [{ label: 'Data Point 1', value: 100 }, { label: 'Data Point 2', value: 200 }];

      return JSON.stringify({
        type: classification.type,
        title: `${classification.type.replace('_', ' ').toUpperCase()} Analysis`,
        data: mockData,
        summary: `Generated ${classification.type} visualization for: ${query}`,
        sublinks: [
          { label: "Explore Details", route: `/explore/${classification.type}`, context: {} },
          { label: "Related Analysis", route: `/analyze/related`, context: {} }
        ]
      });
    }
  }
}

class ValidatorTool extends Tool {
  name = "validate_dashboard";
  description = "Validates and corrects dashboard output for frontend consistency";
  
  constructor() {
    super();
  }

  async _call(dashboardJson: string): Promise<string> {
    try {
      const dashboard = JSON.parse(dashboardJson);
      
      // Basic validation
      const errors: string[] = [];
      
      if (!dashboard.title) errors.push("Missing title");
      if (!Array.isArray(dashboard.data)) errors.push("Invalid data array");
      if (dashboard.sublinks && !Array.isArray(dashboard.sublinks)) errors.push("Invalid sublinks");
      
      // Auto-fix common issues
      if (!dashboard.title) dashboard.title = "Generated Analysis";
      if (!dashboard.data) dashboard.data = [];
      if (!dashboard.config) dashboard.config = { responsive: true };
      
      return JSON.stringify({
        isValid: errors.length === 0,
        errors,
        dashboard
      });
    } catch (error) {
      return JSON.stringify({
        isValid: false,
        errors: ["Invalid JSON format"],
        dashboard: null
      });
    }
  }
}

// LangChain Agent System
export class LangChainMultiAgent {
  private agent?: AgentExecutor;
  private tools: Tool[];

  constructor() {
    this.tools = [
      new ClassifierTool(),
      new RetrieverTool(), 
      new SummarizerTool(),
      new ValidatorTool()
    ];
  }

  async initialize() {
    // Use a lightweight model or fallback for LangChain agent
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY || "dummy-key"
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a dashboard generation agent. Use the available tools to:
1. Classify the user query with classify_visualization
2. Retrieve relevant context with retrieve_context  
3. Generate dashboard with generate_dashboard
4. Validate output with validate_dashboard

Work step by step and return the final validated dashboard JSON.`],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"]
    ]);

    try {
      const agentRunnable = await createOpenAIFunctionsAgent({
        llm: model,
        tools: this.tools,
        prompt
      });

      this.agent = new AgentExecutor({
        agent: agentRunnable,
        tools: this.tools,
        verbose: true
      });
    } catch (error) {
      console.warn("[LangChain] OpenAI agent failed, using simplified approach");
      // Fallback to direct tool usage
    }
  }

  async process(query: string, userId: string): Promise<DashboardOutput> {
    console.log("[LangChain MultiAgent] Processing:", query);

    try {
      // If agent is available, use it
      if (this.agent) {
        const result = await this.agent.invoke({
          input: `Generate a dashboard for: ${query} (userId: ${userId})`
        });

        return JSON.parse(result.output);
      }

      // Fallback: Direct tool chain execution
      return await this.directToolChain(query, userId);

    } catch (error) {
      console.error("[LangChain MultiAgent] Error:", error);
      return await this.directToolChain(query, userId);
    }
  }

  private async directToolChain(query: string, userId: string): Promise<DashboardOutput> {
    console.log("[LangChain] Using direct tool chain");
    
    // Step 1: Classification
    const classificationResult = await this.tools[0].invoke(query);
    const classification = JSON.parse(classificationResult);
    
    // Step 2: Retrieval
    const retrievalInput = JSON.stringify({ query, userId, classification });
    const contextResult = await this.tools[1].invoke(retrievalInput);
    const context = JSON.parse(contextResult);
    
    // Step 3: Generation
    const generationInput = JSON.stringify({ query, context, classification });
    const dashboardResult = await this.tools[2].invoke(generationInput);
    
    // Step 4: Validation
    const validationResult = await this.tools[3].invoke(dashboardResult);
    const validation = JSON.parse(validationResult);
    
    return validation.dashboard || JSON.parse(dashboardResult);
  }
}

// Main export function
export async function executeLangChainAgent(query: string, userId: string): Promise<DashboardOutput> {
  const agent = new LangChainMultiAgent();
  await agent.initialize();
  return agent.process(query, userId);
}