import { classifierAgent } from "@/lib/langchain/agents/classifier";
import { retrieverAgent } from "@/lib/langchain/agents/retriever";
import { summarizerAgent } from "@/lib/langchain/agents/summarizer";
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
    console.log("[Pipeline] Memory system disabled, processing query without memory");
    return processQueryWithoutMemory(query, userId);
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
    
  console.log(`[Pipeline] Processing query with user context for user ${userId}`);
  
  // Normal processing pipeline
  const classification = await classifierAgent(enhancedQuery);
  const context = await retrieverAgent(enhancedQuery, userId, classification);
  const dashboard = await summarizerAgent({ 
    query: enhancedQuery, 
    context, 
    classification
  });
  
  // Add safety check for title length before validation
  if (dashboard.title && dashboard.title.length > 120) {
    dashboard.title = dashboard.title.substring(0, 117) + '...';
  }
  
  try {
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
    console.error("[Pipeline] Validation error for dashboard:", error);
    console.error("[Pipeline] Dashboard data that failed validation:", JSON.stringify(dashboard, null, 2));
    throw error;
  }
}

// Process query without memory features
async function processQueryWithoutMemory(
  query: string, 
  userId: string
): Promise<DashboardOutput> {
  console.log(`[Pipeline] Processing query without memory for user ${userId}`);
  
  // Normal processing pipeline without memory enhancement
  const classification = await classifierAgent(query);
  const context = await retrieverAgent(query, userId, classification);
  const dashboard = await summarizerAgent({ 
    query, 
    context, 
    classification
  });
  
  // Add safety check for title length before validation
  if (dashboard.title && dashboard.title.length > 120) {
    dashboard.title = dashboard.title.substring(0, 117) + '...';
  }
  
  try {
    const validated = dashboardSchema.parse(dashboard);
    
    // Log the query
    await logQuery({
      userId,
      query,
      responseType: validated.type,
    });

    return validated;
  } catch (error) {
    console.error("[Pipeline] Validation error for dashboard:", error);
    console.error("[Pipeline] Dashboard data that failed validation:", JSON.stringify(dashboard, null, 2));
    throw error;
  }
}

// Legacy function for backward compatibility
export async function processQuery(query: string, userId: string): Promise<DashboardOutput> {
  return processQueryWithMemory(query, userId);
}