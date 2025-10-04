import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/appwrite/auth";
import { userMemoryManager } from "@/lib/memory/user-memory";
import { getUserProfile, createOrUpdateUserProfile } from "@/lib/appwrite/database";

const searchMemorySchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).optional().default(5),
  minSimilarity: z.number().min(0).max(1).optional().default(0.7),
});

const updateProfileSchema = z.object({
  preferences: z.object({
    topics: z.array(z.string()).optional(),
    communicationStyle: z.string().optional(),
    expertiseLevel: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }),
  memorySettings: z.object({
    enableMemory: z.boolean(),
    retentionDays: z.number().min(1).max(365),
    importanceThreshold: z.number().min(1).max(10),
  }),
});

// GET /api/memory - Search user memories or get user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    if (action === "profile") {
      const profile = await getUserProfile(user.id);
      return NextResponse.json({ profile });
    }
    
    if (action === "search") {
      const query = searchParams.get("query");
      const limit = searchParams.get("limit");
      const minSimilarity = searchParams.get("minSimilarity");
      
      if (!query) {
        return NextResponse.json(
          { error: "Query parameter is required for search" },
          { status: 400 }
        );
      }
      
      const validated = searchMemorySchema.parse({
        query,
        limit: limit ? parseInt(limit, 10) : undefined,
        minSimilarity: minSimilarity ? parseFloat(minSimilarity) : undefined,
      });
      
      const memories = await userMemoryManager.searchMemories(
        user.id,
        validated.query,
        validated.limit,
        validated.minSimilarity
      );
      
      return NextResponse.json({ memories });
    }
    
    if (action === "recent") {
      const limit = searchParams.get("limit");
      const recentMemories = await userMemoryManager.getRecentMemories(
        user.id,
        limit ? parseInt(limit, 10) : 10
      );
      
      return NextResponse.json({ memories: recentMemories });
    }
    
    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400 }
    );
    
  } catch (cause) {
    console.error("[API] Failed to process memory request", cause);
    
    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: cause.flatten() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process memory request" },
      { status: 500 }
    );
  }
}

// POST /api/memory - Update user profile or store new memory
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;
    
    if (action === "updateProfile") {
      const validated = updateProfileSchema.parse(body);
      
      const profile = await createOrUpdateUserProfile({
        userId: user.id,
        preferences: validated.preferences,
        memorySettings: validated.memorySettings,
      });
      
      if (!profile) {
        return NextResponse.json(
          { error: "Failed to update user profile" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ profile });
    }
    
    if (action === "storeMemory") {
      const { content, context, importance = 5, metadata = {} } = body;
      
      if (!content || !context) {
        return NextResponse.json(
          { error: "Content and context are required" },
          { status: 400 }
        );
      }
      
      await userMemoryManager.storeMemory(
        user.id,
        content,
        context,
        undefined, // sessionId
        importance,
        metadata
      );
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
    
  } catch (cause) {
    console.error("[API] Failed to process memory update", cause);
    
    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", details: cause.flatten() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process memory update" },
      { status: 500 }
    );
  }
}