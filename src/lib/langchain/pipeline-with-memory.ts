import { dashboardSchema } from "@/lib/schemas/dashboard";
import { logQuery } from "@/lib/appwrite/database";
import { userMemoryManager, type MemorySearchResult } from "@/lib/memory/user-memory";
import type { DashboardOutput } from "@/types";

export async function processQueryWithMemory(
  query: string, 
  userId: string
): Promise<DashboardOutput> {
  
  // Check if memory system is available
  if (!userMemoryManager.isMemoryEnabled()) {
    console.log("[Pipeline] Memory system disabled, using LangChain agent without memory");
    const { executeLangChainAgent } = await import("./agents/langchain-agent");
    return await executeLangChainAgent(query, userId);
  }
  
  let userContext = "";
  let similarMemories: MemorySearchResult[] = [];
  
  try {
    // Build user context from memory
    userContext = await userMemoryManager.buildUserContext(userId, query);
    
    // Search for similar queries in user's memory
    similarMemories = await userMemoryManager.searchMemories(userId, query, 3, 0.75);
  } catch (error) {
    console.error("[Pipeline] Memory operations failed, continuing without memory:", error);
  }
  
  // Check if we can answer from memory first
  if (similarMemories.length > 0) {
    const highSimilarityMemory = similarMemories.find(memory => memory.similarity > 0.9);
    
    if (highSimilarityMemory) {
      console.log(`[Pipeline] Found high similarity memory for user ${userId}: ${highSimilarityMemory.similarity}`);
      
      // Return a direct answer from memory instead of generating a dashboard
      const memoryAnswer = `Based on our previous conversation: ${highSimilarityMemory.context}`;
      
      const memoryResponse = {
        type: "text" as const,
        title: "From Memory",
        summary: memoryAnswer,
        isFromMemory: true, // Flag to indicate this is from memory
        data: [],
        config: {}
      };
      
      // Store the fact that we used memory for this query
      await userMemoryManager.processConversation(
        userId,
        query,
        memoryAnswer,
        undefined,
        `memory_retrieval: ${highSimilarityMemory.context}`
      );
      
      return memoryResponse;
    }
  }
  
  // Enhanced query with user context
  const enhancedQuery = userContext 
    ? `${query}\n\n## User Context:\n${userContext}` 
    : query;
    
    console.log(`[Pipeline] Processing query with LangChain multi-agent system for user ${userId}`);
  
  try {
    // Use the new LangChain-based multi-agent system
    const { executeLangChainAgent } = await import("./agents/langchain-agent");
    const dashboard = await executeLangChainAgent(enhancedQuery, userId);
    
    console.log("[Pipeline] LangChain agent completed successfully");    // Add safety check for title length before validation
    if (dashboard.title && dashboard.title.length > 120) {
      dashboard.title = dashboard.title.substring(0, 117) + '...';
    }
    
    const validated = dashboardSchema.parse(dashboard);
    
    // Log the query
    await logQuery({
      userId,
      query,
      responseType: validated.type,
    });

    // Store the conversation in memory
    try {
      const responseContent = JSON.stringify(validated);
      await userMemoryManager.processConversation(
        userId,
        query,
        responseContent,
        undefined,
        `${validated.type}: ${validated.title}`
      );
    } catch (error) {
      console.error("[Pipeline] Failed to store conversation in memory:", error);
      // Continue without storing in memory
    }

    return validated;
    
  } catch (error) {
    console.error("[Pipeline] Multi-agent pipeline failed:", error);
    console.error("[Pipeline] Error details:", error);
    throw error;
  }
}

// Process query without memory features using LangChain agents
async function processQueryWithoutMemory(
  query: string, 
  userId: string
): Promise<DashboardOutput> {
  console.log(`[Pipeline] Processing query with LangChain agents (no memory) for user ${userId}`);
  
  try {
    // Use the LangChain-based agent system
    const { executeLangChainAgent } = await import("./agents/langchain-agent");
    const dashboard = await executeLangChainAgent(query, userId);
    
    // Add safety check for title length before validation
    if (dashboard.title && dashboard.title.length > 120) {
      dashboard.title = dashboard.title.substring(0, 117) + '...';
    }
    
    const validated = dashboardSchema.parse(dashboard);
    
    // Log the query
    await logQuery({
      userId,
      query,
      responseType: validated.type,
    });

    return validated;
    
  } catch (error) {
    console.error("[Pipeline] Multi-agent pipeline failed:", error);
    console.error("[Pipeline] Error details:", error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function processQuery(query: string, userId: string): Promise<DashboardOutput> {
  return processQueryWithMemory(query, userId);
}