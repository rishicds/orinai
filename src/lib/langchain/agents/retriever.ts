import type { ClassificationResult, RetrievalResult } from "@/types";
import { userMemoryManager, type MemorySearchResult } from "@/lib/memory/user-memory";

/**
 * Enhanced Retriever Agent for Multi-Agent Architecture
 * Chooses between Pinecone (user memory) vs external sources based on classification
 */
export async function retrieverAgent(
  query: string,
  userId: string,
  classification: ClassificationResult
): Promise<RetrievalResult> {
  console.log("[Retriever] Processing query:", query);
  console.log("[Retriever] Classification:", {
    requiresRAG: classification.requiresRAG,
    requiresExternal: classification.requiresExternal,
    type: classification.type
  });

  const result: RetrievalResult = {
    chunks: [],
    citations: []
  };

  try {
    // Strategy 1: User Memory (Pinecone) Retrieval
    if (classification.requiresRAG && userId) {
      console.log("[Retriever] Attempting user memory retrieval from Pinecone");
      
      try {
        const memoryResults = await userMemoryManager.searchMemories(userId, query, 5, 0.7);

        if (memoryResults.length > 0) {
          console.log("[Retriever] Found", memoryResults.length, "relevant memory chunks");
          
          result.chunks = memoryResults.map((memory: MemorySearchResult) => ({
            text: memory.content,
            source: `User Memory (${memory.context})`,
            relevance: memory.similarity
          }));

          // Add memory-based citations
          result.citations = memoryResults
            .filter((memory: MemorySearchResult) => memory.metadata?.topic)
            .map((memory: MemorySearchResult) => ({
              title: memory.context,
              url: "#user-memory",
              snippet: memory.content.substring(0, 200) + "..."
            }));
        } else {
          console.log("[Retriever] No relevant user memory found");
        }
      } catch (error) {
        console.warn("[Retriever] User memory retrieval failed:", error);
        // Continue with external retrieval as fallback
      }
    }

    // Strategy 2: External Knowledge Retrieval
    if (classification.requiresExternal || (classification.requiresRAG && result.chunks.length === 0)) {
      console.log("[Retriever] Attempting external knowledge retrieval");
      
      // Simulate external knowledge retrieval based on query type
      const externalChunks = await simulateExternalRetrieval(query, classification);
      
      result.chunks.push(...externalChunks.chunks);
      result.citations.push(...externalChunks.citations);
    }

    // Strategy 3: Context Enhancement for specific visualization types
    if (result.chunks.length > 0) {
      result.chunks = enhanceContextForVisualization(result.chunks, classification.type);
    }

    console.log("[Retriever] Final result:", {
      chunksCount: result.chunks.length,
      citationsCount: result.citations.length
    });

    return result;

  } catch (error) {
    console.error("[Retriever] Retrieval failed:", error);
    
    // Return empty result with error indication
    return {
      chunks: [{
        text: `Retrieval temporarily unavailable. Proceeding with general knowledge for: ${query}`,
        source: "System",
        relevance: 0.1
      }],
      citations: []
    };
  }
}

/**
 * Simulate external knowledge retrieval for topics requiring external data
 */
async function simulateExternalRetrieval(
  query: string, 
  classification: ClassificationResult
): Promise<RetrievalResult> {
  const queryLower = query.toLowerCase();
  
  // Simulate different external sources based on query content
  if (queryLower.includes('market') || queryLower.includes('stock') || queryLower.includes('financial')) {
    return {
      chunks: [
        {
          text: "Current market analysis shows significant volatility in technology sectors with emerging opportunities in AI and renewable energy markets.",
          source: "Financial Data Provider",
          relevance: 0.9
        },
        {
          text: "Global economic indicators suggest continued growth with careful monitoring of inflation rates and employment statistics.",
          source: "Economic Research Institute",
          relevance: 0.8
        }
      ],
      citations: [
        {
          title: "Market Analysis Report",
          url: "https://example-financial-data.com/market-report",
          snippet: "Comprehensive analysis of current market conditions..."
        }
      ]
    };
  }
  
  if (queryLower.includes('climate') || queryLower.includes('environment') || queryLower.includes('sustainability')) {
    return {
      chunks: [
        {
          text: "Climate change data indicates rising global temperatures with significant impacts on weather patterns and ecosystem stability.",
          source: "Environmental Research Center",
          relevance: 0.95
        },
        {
          text: "Renewable energy adoption rates have increased by 15% globally, with solar and wind leading the transition.",
          source: "Energy Statistics Bureau",
          relevance: 0.88
        }
      ],
      citations: [
        {
          title: "Global Climate Report 2024",
          url: "https://example-climate-org.com/report-2024",
          snippet: "Annual assessment of global climate conditions and trends..."
        }
      ]
    };
  }
  
  if (queryLower.includes('technology') || queryLower.includes('ai') || queryLower.includes('innovation')) {
    return {
      chunks: [
        {
          text: "Artificial Intelligence development continues to accelerate with major breakthroughs in natural language processing and computer vision.",
          source: "Technology Research Institute",
          relevance: 0.92
        },
        {
          text: "Innovation in quantum computing and edge AI is creating new possibilities for distributed computing architectures.",
          source: "Computing Innovation Lab",
          relevance: 0.85
        }
      ],
      citations: [
        {
          title: "AI Innovation Trends 2024",
          url: "https://example-tech-research.com/ai-trends",
          snippet: "Analysis of emerging AI technologies and their applications..."
        }
      ]
    };
  }
  
  // Default general knowledge retrieval
  return {
    chunks: [
      {
        text: `General knowledge context for ${query}: This topic encompasses multiple aspects that can be analyzed from various perspectives including historical context, current trends, and future implications.`,
        source: "Knowledge Base",
        relevance: 0.6
      }
    ],
    citations: []
  };
}

/**
 * Enhance retrieved context based on the target visualization type
 */
function enhanceContextForVisualization(
  chunks: Array<{ text: string; source?: string; relevance?: number }>,
  visualizationType: string
): Array<{ text: string; source?: string; relevance?: number }> {
  return chunks.map(chunk => {
    let enhancedText = chunk.text;
    
    // Add visualization-specific context hints
    switch (visualizationType) {
      case 'pie_chart':
        enhancedText += " [Note: Focus on proportional relationships and percentage breakdowns for pie chart visualization]";
        break;
      case 'bar_chart':
        enhancedText += " [Note: Emphasize comparative values and categorical data for bar chart representation]";
        break;
      case 'line_chart':
        enhancedText += " [Note: Highlight trends over time and sequential data points for line chart display]";
        break;
      case 'timeline':
        enhancedText += " [Note: Organize information chronologically with key dates and milestones]";
        break;
      case 'table':
        enhancedText += " [Note: Structure data in rows and columns with clear headers and relationships]";
        break;
      case 'comparison':
        enhancedText += " [Note: Emphasize contrasts, similarities, and side-by-side analysis points]";
        break;
      default:
        enhancedText += ` [Note: Optimize content for ${visualizationType} visualization format]`;
    }
    
    return {
      ...chunk,
      text: enhancedText
    };
  });
}
