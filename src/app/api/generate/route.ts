import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/appwrite/auth";
import { processQueryWithMemory, processQuery } from "@/lib/langchain/pipeline-with-memory";

const requestSchema = z.object({
  query: z.string().min(1).max(1000), // Allow 1-1000 characters
  useMemory: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Received generate request");
    const body = await request.json();
    console.log("[API] Request body:", { query: body.query?.substring(0, 100), useMemory: body.useMemory });
    
    const { query, useMemory } = requestSchema.parse(body);
    console.log("[API] Request validation passed");

    const user = await getUser();
    const userId = user?.id ?? "anonymous";
    console.log("[API] User info:", { hasUser: !!user, userId: userId.substring(0, 20) });

    if (!user) {
      console.info("[API] Proceeding with anonymous dashboard generation");
    }

    // Use memory-enhanced pipeline for authenticated users
    console.log("[API] Calling pipeline with memory:", user && useMemory);
    const dashboard = user && useMemory 
      ? await processQueryWithMemory(query, userId)
      : await processQuery(query, userId);
    
    console.log("[API] Pipeline completed successfully");
    return NextResponse.json(dashboard);
  } catch (cause) {
    console.error("[API] Failed to process query", cause);

    if (cause instanceof z.ZodError) {
      const validationError = cause as z.ZodError;
      console.error("[API] Validation error details:", validationError.flatten());
      return NextResponse.json(
        { error: "Invalid request payload", details: validationError.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate dashboard", details: cause instanceof Error ? cause.message : String(cause) },
      { status: 500 }
    );
  }
}
