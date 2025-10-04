import { dashboardSchema } from "@/lib/schemas/dashboard";
import { logQuery } from "@/lib/appwrite/database";
import type { DashboardOutput } from "@/types";

/**
 * Main query processing pipeline using LangChain agents
 * This is the primary entry point for processing user queries
 */
export async function processQuery(query: string, userId: string): Promise<DashboardOutput> {
  console.log(`[Pipeline] Processing query with LangChain agent system: "${query}"`);
  
  try {
    // Use the LangChain-based agent system
    const { executeLangChainAgent } = await import("./agents/langchain-agent");
    const dashboard = await executeLangChainAgent(query, userId);
    
    // Add safety check for title length before validation
    if (dashboard.title && dashboard.title.length > 120) {
      dashboard.title = dashboard.title.substring(0, 117) + '...';
    }
    
    // Validate the output against our schema
    const validated = dashboardSchema.parse(dashboard);
    
    // Log the query for analytics
    await logQuery({
      userId,
      query,
      responseType: validated.type,
    });

    console.log(`[Pipeline] Successfully processed query with result type: ${validated.type}`);
    return validated;
    
  } catch (error) {
    console.error("[Pipeline] Multi-agent pipeline failed:", error);
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error("[Pipeline] Error message:", error.message);
      console.error("[Pipeline] Error stack:", error.stack);
    }
    
    throw error;
  }
}
