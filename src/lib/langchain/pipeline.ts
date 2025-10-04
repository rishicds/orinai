import { classifierAgent } from "@/lib/langchain/agents/classifier";
import { retrieverAgent } from "@/lib/langchain/agents/retriever";
import { summarizerAgent } from "@/lib/langchain/agents/summarizer";
import { dashboardSchema } from "@/lib/schemas/dashboard";
import { logQuery } from "@/lib/appwrite/database";
import type { DashboardOutput } from "@/types";

export async function processQuery(query: string, userId: string): Promise<DashboardOutput> {
  const classification = await classifierAgent(query);
  const context = await retrieverAgent(query, userId, classification);
  const dashboard = await summarizerAgent({ query, context, classification });
  
  try {
    const validated = dashboardSchema.parse(dashboard);
    
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
