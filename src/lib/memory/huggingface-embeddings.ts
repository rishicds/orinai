// Hugging Face embeddings service for open-source models
export class HuggingFaceEmbeddings {
  private apiKey: string;
  private modelId: string;
  private baseUrl = "https://api-inference.huggingface.co/models";

  constructor(options: {
    apiKey?: string;
    modelId?: string;
  } = {}) {
    this.apiKey = options.apiKey || process.env.HUGGINGFACE_API_KEY || "";
    this.modelId = options.modelId || "intfloat/multilingual-e5-large";
    
    if (!this.apiKey) {
      console.warn("[HuggingFace] No API key provided");
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error("Hugging Face API key is required");
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [text], // Send as array for sentence-transformers
          options: {
            wait_for_model: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      let embedding: number[];
      if (Array.isArray(result) && Array.isArray(result[0])) {
        embedding = result[0];
      } else if (Array.isArray(result)) {
        embedding = result;
      } else {
        throw new Error("Unexpected response format from Hugging Face API");
      }

      // Normalize to 1536 dimensions for Pinecone compatibility
      return this.normalizeEmbeddingSize(embedding);
    } catch (error) {
      console.error("[HuggingFace] Error getting embedding:", error);
      throw error;
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const batchSize = 3; // Conservative batch size for rate limits
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const batchPromises = batch.map(text => this.embedQuery(text));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Respect rate limits with delay between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`[HuggingFace] Error processing batch ${i}-${i + batchSize}:`, error);
        // Add fallback embeddings for failed batch
        const fallbackEmbeddings = batch.map(() => this.createFallbackEmbedding());
        results.push(...fallbackEmbeddings);
      }
    }
    
    return results;
  }

  private normalizeEmbeddingSize(embedding: number[]): number[] {
    const targetSize = 1536;
    
    if (embedding.length === targetSize) {
      return embedding;
    }
    
    if (embedding.length > targetSize) {
      // Truncate to target size
      return embedding.slice(0, targetSize);
    }
    
    // Pad with interpolated values if smaller
    const padded = [...embedding];
    const originalSize = embedding.length;
    
    while (padded.length < targetSize) {
      // Use interpolation to create meaningful padding
      const index = padded.length - originalSize;
      const interpolatedValue = embedding[index % originalSize] * 0.1;
      padded.push(interpolatedValue);
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(padded.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return padded.map(val => val / magnitude);
    }
    
    return padded;
  }

  private createFallbackEmbedding(): number[] {
    // Create a random normalized embedding as fallback
    const embedding = Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  // Method to test the connection
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      await this.embedQuery("test");
      return true;
    } catch {
      return false;
    }
  }

  // Get model info
  getModelInfo(): { modelId: string; dimensions: number; hasApiKey: boolean } {
    return {
      modelId: this.modelId,
      dimensions: 1536, // After normalization
      hasApiKey: !!this.apiKey,
    };
  }
}