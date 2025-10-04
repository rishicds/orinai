import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/appwrite/auth";
import { saveChatMessage, getUserChatHistory, clearUserChatHistory, getUserChatSessions, getChatSessionMessages } from "@/lib/appwrite/database";

const saveMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  sessionId: z.string().optional(),
  dashboardData: z.string().optional(), // JSON string
});

const getHistorySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
});

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
    const { role, content, sessionId, dashboardData } = saveMessageSchema.parse(body);

    const savedMessage = await saveChatMessage({
      userId: user.id,
      role,
      content,
      sessionId,
      dashboardData,
    });

    if (!savedMessage) {
      return NextResponse.json(
        { error: "Failed to save chat message" },
        { status: 500 }
      );
    }

    return NextResponse.json(savedMessage, { status: 201 });
  } catch (cause) {
    console.error("[API] Failed to save chat message", cause);

    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", details: cause.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save chat message" },
      { status: 500 }
    );
  }
}

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
    const type = searchParams.get("type");
    const sessionId = searchParams.get("sessionId");
    const limit = searchParams.get("limit");

    if (type === "sessions") {
      // Get chat sessions
      const sessions = await getUserChatSessions(user.id);
      return NextResponse.json({ 
        sessions,
        userId: user.id 
      });
    } else if (type === "session" && sessionId) {
      // Get messages for a specific session
      const messages = await getChatSessionMessages(user.id, sessionId);
      return NextResponse.json({ 
        messages,
        sessionId,
        userId: user.id 
      });
    } else {
      // Default: get recent chat history
      const { limit: validatedLimit } = getHistorySchema.parse({
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      const chatHistory = await getUserChatHistory(user.id, validatedLimit);
      return NextResponse.json({ 
        messages: chatHistory,
        userId: user.id 
      });
    }
  } catch (cause) {
    console.error("[API] Failed to get chat history", cause);

    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: cause.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const success = await clearUserChatHistory(user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to clear chat history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Chat history cleared successfully",
      userId: user.id 
    });
  } catch (cause) {
    console.error("[API] Failed to clear chat history", cause);

    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}