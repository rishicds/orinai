import { ID, Query } from "node-appwrite";
import { getAppwriteClients } from "./client";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "orinai";
const QUERY_COLLECTION_ID = process.env.APPWRITE_COLLECTION_QUERIES ?? "queries";
const USER_CHAT_COLLECTION_ID = process.env.APPWRITE_COLLECTION_USER_CHAT ?? "user_chat";

export interface QueryLogEntry {
  userId: string;
  query: string;
  responseType: string;
  createdAt: string;
}

export interface ChatMessage {
  $id?: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  updatedAt?: string;
  sessionId?: string;
  dashboardData?: string; // JSON string of DashboardOutput
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

export async function logQuery(entry: Omit<QueryLogEntry, "createdAt">): Promise<void> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping query log: missing server credentials");
    return;
  }

  try {
    const { databases } = getAppwriteClients();
    await databases.createDocument(DATABASE_ID, QUERY_COLLECTION_ID, ID.unique(), {
      userId: entry.userId,
      query: entry.query,
      responseType: entry.responseType,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Appwrite] Failed to log query", error);
  }
}

export async function saveChatMessage(message: Omit<ChatMessage, "$id" | "createdAt" | "updatedAt">): Promise<ChatMessage | null> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping chat message save: missing server credentials");
    return null;
  }

  try {
    const { databases } = getAppwriteClients();
    const now = new Date().toISOString();
    
    const document = await databases.createDocument(DATABASE_ID, USER_CHAT_COLLECTION_ID, ID.unique(), {
      userId: message.userId,
      role: message.role,
      content: message.content,
      sessionId: message.sessionId || null,
      dashboardData: message.dashboardData || null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      $id: document.$id,
      userId: document.userId,
      role: document.role,
      content: document.content,
      sessionId: document.sessionId,
      dashboardData: document.dashboardData,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  } catch (error) {
    console.error("[Appwrite] Failed to save chat message", error);
    return null;
  }
}

export async function getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping chat history retrieval: missing server credentials");
    return [];
  }

  try {
    const { databases } = getAppwriteClients();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_CHAT_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return response.documents.map(doc => ({
      $id: doc.$id,
      userId: doc.userId,
      role: doc.role,
      content: doc.content,
      sessionId: doc.sessionId,
      dashboardData: doc.dashboardData,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })).reverse(); // Reverse to show oldest messages first
  } catch (error) {
    console.error("[Appwrite] Failed to retrieve chat history", error);
    return [];
  }
}

export async function clearUserChatHistory(userId: string): Promise<boolean> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping chat history clear: missing server credentials");
    return false;
  }

  try {
    const { databases } = getAppwriteClients();
    
    // Get all user's chat messages
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_CHAT_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.limit(1000) // Adjust limit as needed
      ]
    );

    // Delete each message
    const deletePromises = response.documents.map(doc => 
      databases.deleteDocument(DATABASE_ID, USER_CHAT_COLLECTION_ID, doc.$id)
    );

    await Promise.all(deletePromises);
    console.log(`[Appwrite] Cleared ${response.documents.length} chat messages for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Appwrite] Failed to clear chat history", error);
    return false;
  }
}

export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping chat sessions retrieval: missing server credentials");
    return [];
  }

  try {
    const { databases } = getAppwriteClients();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_CHAT_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(1000) // Get all messages to group by sessions
      ]
    );

    // Group messages by day to create sessions
    const sessions: { [key: string]: ChatMessage[] } = {};
    
    response.documents.forEach(doc => {
      const message: ChatMessage = {
        $id: doc.$id,
        userId: doc.userId,
        role: doc.role,
        content: doc.content,
        sessionId: doc.sessionId,
        dashboardData: doc.dashboardData,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
      
      // Use sessionId if available, otherwise group by date for backward compatibility
      const sessionKey = message.sessionId || new Date(message.createdAt).toISOString().split('T')[0];
      
      if (!sessions[sessionKey]) {
        sessions[sessionKey] = [];
      }
      sessions[sessionKey].push(message);
    });

    // Convert to ChatSession format
    const chatSessions: ChatSession[] = Object.entries(sessions).map(([sessionKey, messages]) => {
      // Sort messages by time within the session
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // Find the first user message to use as title
      const firstUserMessage = messages.find(msg => msg.role === "user");
      const title = firstUserMessage 
        ? firstUserMessage.content.length > 50 
          ? firstUserMessage.content.substring(0, 50) + "..."
          : firstUserMessage.content
        : `Chat from ${new Date(messages[0].createdAt).toLocaleDateString()}`;
      
      const lastMessage = messages[messages.length - 1];
      
      return {
        id: sessionKey,
        title,
        lastMessage: lastMessage.content.length > 100 
          ? lastMessage.content.substring(0, 100) + "..."
          : lastMessage.content,
        lastMessageTime: lastMessage.createdAt,
        messageCount: messages.length
      };
    });

    // Sort sessions by last message time (most recent first)
    return chatSessions.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  } catch (error) {
    console.error("[Appwrite] Failed to retrieve chat sessions", error);
    return [];
  }
}

export async function getChatSessionMessages(userId: string, sessionId: string): Promise<ChatMessage[]> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping session messages retrieval: missing server credentials");
    return [];
  }

  try {
    const { databases } = getAppwriteClients();
    
    console.log("[Database] Getting session messages for sessionId:", sessionId, "userId:", userId);
    
    // First, get all messages for the user and filter by date
    const allMessagesResponse = await databases.listDocuments(
      DATABASE_ID,
      USER_CHAT_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderAsc("createdAt"),
        Query.limit(1000)
      ]
    );

    console.log("[Database] Total messages for user:", allMessagesResponse.documents.length);

    // Filter messages by sessionId or date (for backward compatibility)
    const sessionMessages = allMessagesResponse.documents.filter(doc => {
      // First try to match by sessionId if it exists
      if (doc.sessionId && doc.sessionId === sessionId) {
        console.log("[Database] Message matches session by sessionId:", doc.sessionId);
        return true;
      }
      
      // Fallback to date-based matching for backward compatibility
      const messageDate = new Date(doc.createdAt).toISOString().split('T')[0];
      const matches = messageDate === sessionId;
      if (matches) {
        console.log("[Database] Message matches session by date:", doc.createdAt, "->", messageDate);
      }
      return matches;
    });

    console.log("[Database] Filtered messages for session:", sessionMessages.length);

    const response = { documents: sessionMessages };

    console.log("[Database] Found", response.documents.length, "messages for session");

    return response.documents.map(doc => ({
      $id: doc.$id,
      userId: doc.userId,
      role: doc.role,
      content: doc.content,
      sessionId: doc.sessionId,
      dashboardData: doc.dashboardData,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error("[Appwrite] Failed to retrieve session messages", error);
    return [];
  }
}
