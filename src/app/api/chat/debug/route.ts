import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/appwrite/auth";
import { getUserChatHistory, getUserChatSessions } from "@/lib/appwrite/database";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all chat history
    const allMessages = await getUserChatHistory(user.id, 1000);
    
    // Get sessions
    const sessions = await getUserChatSessions(user.id);

    // Group messages by date for debugging
    const messagesByDate: { [key: string]: any[] } = {};
    allMessages.forEach(msg => {
      const date = new Date(msg.createdAt).toISOString().split('T')[0];
      if (!messagesByDate[date]) {
        messagesByDate[date] = [];
      }
      messagesByDate[date].push({
        id: msg.$id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
      });
    });

    return NextResponse.json({
      userId: user.id,
      totalMessages: allMessages.length,
      totalSessions: sessions.length,
      sessions: sessions,
      messagesByDate: messagesByDate,
      allMessages: allMessages.map(msg => ({
        id: msg.$id,
        role: msg.role,
        content: msg.content.substring(0, 100) + "...",
        createdAt: msg.createdAt
      }))
    });
  } catch (error) {
    console.error("[API] Failed to debug chat data", error);
    return NextResponse.json(
      { error: "Failed to debug chat data" },
      { status: 500 }
    );
  }
}