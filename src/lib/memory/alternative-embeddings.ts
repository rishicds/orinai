// Alternative embeddings implementation with Hugging Face
import { HuggingFaceEmbeddings } from "./huggingface-embeddings";

export class AlternativeEmbeddings {
  private hfEmbeddings: HuggingFaceEmbeddings;
  private hasHfApiKey: boolean;

  constructor() {
    this.hfEmbeddings = new HuggingFaceEmbeddings();
    this.hasHfApiKey = !!process.env.HUGGINGFACE_API_KEY;
    
    if (!this.hasHfApiKey) {
      console.warn("[AlternativeEmbeddings] No Hugging Face API key found, using deterministic fallback");
    } else {
      console.log("[AlternativeEmbeddings] Using Hugging Face embeddings");
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    if (this.hasHfApiKey) {
      try {
        return await this.hfEmbeddings.embedQuery(text);
      } catch (error) {
        console.error("[AlternativeEmbeddings] Hugging Face failed, using fallback:", error);
        return this.createSimpleEmbedding(text);
      }
    }
    return this.createSimpleEmbedding(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (this.hasHfApiKey) {
      try {
        return await this.hfEmbeddings.embedDocuments(texts);
      } catch (error) {
        console.error("[AlternativeEmbeddings] Hugging Face batch failed, using fallback:", error);
        return Promise.all(texts.map(text => this.createSimpleEmbedding(text)));
      }
    }
    
    return Promise.all(texts.map(text => this.createSimpleEmbedding(text)));
  }

  // Test the Hugging Face connection
  async testConnection(): Promise<{ success: boolean; service: string; model?: string }> {
    if (this.hasHfApiKey) {
      const success = await this.hfEmbeddings.testConnection();
      const modelInfo = this.hfEmbeddings.getModelInfo();
      return {
        success,
        service: "Hugging Face",
        model: modelInfo.modelId,
      };
    }
    
    return {
      success: true,
      service: "Fallback (deterministic)",
    };
  }

  private createSimpleEmbedding(text: string): number[] {
    // Create a simple deterministic embedding for testing
    // This is not suitable for production - use proper embeddings service
    const hash = this.simpleHash(text.toLowerCase());
    const embedding: number[] = new Array(1536).fill(0);
    
    // Use hash to seed some values
    for (let i = 0; i < Math.min(text.length, 100); i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * i) % 1536;
      embedding[index] = Math.sin(charCode * 0.1) * 0.5;
    }
    
    // Add some random-like but deterministic values based on text
    for (let i = 0; i < 50; i++) {
      const index = (hash + i * 7) % 1536;
      embedding[index] = Math.cos(hash * 0.01 + i) * 0.3;
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}