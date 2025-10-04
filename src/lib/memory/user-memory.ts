import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { updateMemoryAccess, saveMemoryMetadata } from "@/lib/appwrite/database";
import { AlternativeEmbeddings } from "./alternative-embeddings";

interface UserMemoryEntry {
  id: string;
  userId: string;
  content: string;
  context: string; // Topic/subject of the conversation
  timestamp: string;
  sessionId?: string;
  importance: number; // 1-10 scale for memory importance
  metadata: {
    queryType?: string;
    entities?: string[]; // Named entities extracted
    keywords?: string[];
    topic?: string;
  };
}

interface MemorySearchResult {
  content: string;
  context: string;
  similarity: number;
  timestamp: string;
  metadata: UserMemoryEntry['metadata'];
}

export type { MemorySearchResult };

export class UserMemoryManager {
  private pinecone: Pinecone | null;
  private embeddings: OpenAIEmbeddings | AlternativeEmbeddings;
  private indexName = "orinai-user-memory"; // Use the existing index we created
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!process.env.PINECONE_API_KEY;
    
    if (this.isEnabled) {
      try {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY!,
        });
        console.log("[UserMemory] Pinecone initialized successfully");
      } catch (error) {
        console.error("[UserMemory] Failed to initialize Pinecone:", error);
        this.pinecone = null;
        this.isEnabled = false;
      }
    } else {
      console.warn("[UserMemory] Pinecone API key not found, memory features disabled");
      this.pinecone = null;
    }
    
    // Prefer Hugging Face embeddings, then OpenAI, then fallback
    if (process.env.HUGGINGFACE_API_KEY) {
      console.log("[UserMemory] Using Hugging Face embeddings");
      this.embeddings = new AlternativeEmbeddings();
    } else if (process.env.OPENAI_API_KEY) {
      console.log("[UserMemory] Using OpenAI embeddings");
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
      });
    } else {
      console.warn("[UserMemory] No API keys found, using fallback embeddings for development");
      this.embeddings = new AlternativeEmbeddings();
    }
  }

  /**
   * Check if memory system is enabled and available
   */
  isMemoryEnabled(): boolean {
    return this.isEnabled && this.pinecone !== null;
  }

  /**
   * Store a new memory for a user
   */
  async storeMemory(
    userId: string,
    content: string,
    context: string,
    sessionId?: string,
    importance: number = 5,
    metadata: UserMemoryEntry['metadata'] = {}
  ): Promise<void> {
    if (!this.isMemoryEnabled()) {
      console.log("[UserMemory] Memory storage disabled, skipping");
      return;
    }
    
    try {
      const index = this.pinecone!.index(this.indexName);
      
      // Generate embedding for the content
      const embedding = await this.embeddings.embedQuery(content);
      
      const memoryEntry: UserMemoryEntry = {
        id: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        content,
        context,
        timestamp: new Date().toISOString(),
        sessionId,
        importance,
        metadata,
      };

      // Store in Pinecone
      await index.upsert([
        {
          id: memoryEntry.id,
          values: embedding,
          metadata: {
            userId,
            content,
            context,
            timestamp: memoryEntry.timestamp,
            sessionId: sessionId || "",
            importance,
            ...metadata,
          },
        },
      ]);

      console.log(`[UserMemory] Stored memory for user ${userId}: ${context}`);
    } catch (error) {
      console.error("[UserMemory] Failed to store memory:", error);
    }
  }

  /**
   * Search for relevant memories for a user based on query
   */
  async searchMemories(
    userId: string,
    query: string,
    limit: number = 5,
    minSimilarity: number = 0.7
  ): Promise<MemorySearchResult[]> {
    if (!this.isMemoryEnabled()) {
      console.log("[UserMemory] Memory search disabled, returning empty results");
      return [];
    }
    
    try {
      const index = this.pinecone!.index(this.indexName);
      
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Search in Pinecone
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: limit * 2, // Get more results to filter by similarity
        filter: {
          userId: { $eq: userId },
        },
        includeMetadata: true,
      });

      // Filter by similarity threshold and format results
      const memories: MemorySearchResult[] = searchResults.matches
        ?.filter((match) => (match.score || 0) >= minSimilarity)
        .slice(0, limit)
        .map((match) => ({
          content: match.metadata?.content as string || "",
          context: match.metadata?.context as string || "",
          similarity: match.score || 0,
          timestamp: match.metadata?.timestamp as string || "",
          metadata: {
            queryType: match.metadata?.queryType as string,
            entities: match.metadata?.entities as string[],
            keywords: match.metadata?.keywords as string[],
            topic: match.metadata?.topic as string,
          },
        })) || [];

      console.log(`[UserMemory] Found ${memories.length} relevant memories for user ${userId}`);
      return memories;
    } catch (error) {
      console.error("[UserMemory] Failed to search memories:", error);
      return [];
    }
  }

  /**
   * Get user's recent memories for context
   */
  async getRecentMemories(
    userId: string,
    limit: number = 10
  ): Promise<MemorySearchResult[]> {
    if (!this.isMemoryEnabled()) {
      console.log("[UserMemory] Memory retrieval disabled, returning empty results");
      return [];
    }
    
    try {
      const index = this.pinecone!.index(this.indexName);
      
      // We'll use a generic query to get recent memories
      const genericEmbedding = await this.embeddings.embedQuery("user conversation history");
      
      const searchResults = await index.query({
        vector: genericEmbedding,
        topK: limit,
        filter: {
          userId: { $eq: userId },
        },
        includeMetadata: true,
      });

      const memories: MemorySearchResult[] = searchResults.matches
        ?.map((match) => ({
          content: match.metadata?.content as string || "",
          context: match.metadata?.context as string || "",
          similarity: match.score || 0,
          timestamp: match.metadata?.timestamp as string || "",
          metadata: {
            queryType: match.metadata?.queryType as string,
            entities: match.metadata?.entities as string[],
            keywords: match.metadata?.keywords as string[],
            topic: match.metadata?.topic as string,
          },
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

      return memories;
    } catch (error) {
      console.error("[UserMemory] Failed to get recent memories:", error);
      return [];
    }
  }

  /**
   * Process and store conversation as memories
   */
  async processConversation(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    sessionId?: string,
    context?: string
  ): Promise<void> {
    try {
      // Extract context and importance from the conversation
      const conversationContext = context || this.extractContext(userMessage);
      const importance = this.calculateImportance(userMessage, assistantResponse);
      const entities = this.extractEntities(userMessage);
      const keywords = this.extractKeywords(userMessage);
      
      // Store user message as memory
      await this.storeMemory(
        userId,
        userMessage,
        `User asked: ${conversationContext}`,
        sessionId,
        importance,
        {
          queryType: "user_question",
          entities,
          keywords,
          topic: conversationContext,
        }
      );

      // Store assistant response as memory
      await this.storeMemory(
        userId,
        assistantResponse,
        `Assistant answered: ${conversationContext}`,
        sessionId,
        importance,
        {
          queryType: "assistant_response",
          entities: this.extractEntities(assistantResponse),
          keywords: this.extractKeywords(assistantResponse),
          topic: conversationContext,
        }
      );
    } catch (error) {
      console.error("[UserMemory] Failed to process conversation:", error);
    }
  }

  /**
   * Build context from memories for new queries
   */
  async buildUserContext(userId: string, currentQuery: string): Promise<string> {
    try {
      const relevantMemories = await this.searchMemories(userId, currentQuery, 3);
      const recentMemories = await this.getRecentMemories(userId, 5);

      let context = "";

      if (relevantMemories.length > 0) {
        context += "## Relevant Previous Conversations:\n";
        relevantMemories.forEach((memory, index) => {
          context += `${index + 1}. ${memory.context}\n   User: ${memory.content}\n\n`;
        });
      }

      if (recentMemories.length > 0) {
        context += "## Recent Conversation Context:\n";
        recentMemories.slice(0, 3).forEach((memory, index) => {
          context += `${index + 1}. ${memory.context}\n`;
        });
      }

      return context;
    } catch (error) {
      console.error("[UserMemory] Failed to build user context:", error);
      return "";
    }
  }

  // Helper methods for processing
  private extractContext(message: string): string {
    // Simple keyword-based context extraction
    const words = message.toLowerCase().split(' ');
    const topics = ['science', 'technology', 'history', 'art', 'music', 'literature', 'politics', 'economics', 'health', 'education'];
    
    for (const topic of topics) {
      if (words.some(word => word.includes(topic))) {
        return topic;
      }
    }
    
    // Return first few words as context if no topic found
    return words.slice(0, 3).join(' ');
  }

  private calculateImportance(userMessage: string, assistantResponse: string): number {
    // Calculate importance based on message length and keywords
    let importance = 5; // Base importance
    
    const importantKeywords = ['remember', 'important', 'preference', 'like', 'dislike', 'always', 'never'];
    const userWords = userMessage.toLowerCase();
    
    // Increase importance if user mentions memory-related keywords
    if (importantKeywords.some(keyword => userWords.includes(keyword))) {
      importance += 2;
    }
    
    // Increase importance for longer, more detailed responses
    if (assistantResponse.length > 500) {
      importance += 1;
    }
    
    return Math.min(importance, 10);
  }

  private extractEntities(text: string): string[] {
    // Simple entity extraction (can be enhanced with NLP libraries)
    const words = text.split(' ');
    const entities = words.filter(word => 
      word.length > 3 && 
      word[0] === word[0].toUpperCase() &&
      !['The', 'This', 'That', 'What', 'When', 'Where', 'How', 'Why'].includes(word)
    );
    
    return [...new Set(entities)]; // Remove duplicates
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return [...new Set(words)].slice(0, 10); // Top 10 unique keywords
  }
}

// Create singleton only when needed
let _userMemoryManager: UserMemoryManager | null = null;

export const getUserMemoryManager = (): UserMemoryManager => {
  if (!_userMemoryManager) {
    _userMemoryManager = new UserMemoryManager();
  }
  return _userMemoryManager;
};

// For backward compatibility
export const userMemoryManager = getUserMemoryManager();