import "server-only";

export interface PerplexitySource {
  title?: string;
  url?: string;
  snippet?: string;
}

export interface MultiServiceResponse {
  geminiContent?: string;
  perplexityContent?: string;
  huggingfaceContent?: string;
  mergedContent: string;
  sources: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

// Perplexity API integration
async function queryPerplexity(query: string): Promise<{ content: string; sources: PerplexitySource[] }> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.warn("[Perplexity] API key not configured");
      return { content: "", sources: [] };
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable research assistant. Provide comprehensive, well-structured information with specific facts and current data. Include real sources and citations when possible."
          },
          {
            role: "user",
            content: `Provide detailed information about: ${query}. Include current facts, statistics, and context. Structure your response with clear sections and key points.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        return_citations: true,
        search_domain_filter: ["perplexity.ai"]
      }),
    });

    if (!response.ok) {
      console.error("[Perplexity] API error:", response.status);
      return { content: "", sources: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const sources = data.citations || [];

    console.log("[Perplexity] Response received, length:", content.length);
    return { content, sources };
  } catch (error) {
    console.error("[Perplexity] Query failed:", error);
    return { content: "", sources: [] };
  }
}

// Hugging Face API integration
async function queryHuggingFace(query: string): Promise<string> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.warn("[HuggingFace] API key not configured");
      return "";
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Explain in detail: ${query}`,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[HuggingFace] API error:", response.status);
      return "";
    }

    const data = await response.json();
    const content = data[0]?.generated_text || "";
    
    console.log("[HuggingFace] Response received, length:", content.length);
    return content;
  } catch (error) {
    console.error("[HuggingFace] Query failed:", error);
    return "";
  }
}

// Gemini API integration (enhanced)
async function queryGemini(query: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini] API key not configured");
      return "";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create a comprehensive, well-structured article about: ${query}

Please structure your response as a detailed wiki-style article with:
1. A clear introduction and overview
2. Multiple detailed sections with headings
3. Key facts, statistics, and important details
4. Historical context where relevant
5. Current status and recent developments
6. Practical applications or implications

Make it informative, accurate, and engaging. Use clear headings and organize information logically.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      console.error("[Gemini] API error:", response.status);
      return "";
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    console.log("[Gemini] Response received, length:", content.length);
    return content;
  } catch (error) {
    console.error("[Gemini] Query failed:", error);
    return "";
  }
}

// Merge and enhance content from multiple sources
function mergeMultiServiceContent(
  geminiContent: string,
  perplexityContent: string,
  huggingfaceContent: string
): string {
  const sections: string[] = [];

  if (geminiContent) {
    sections.push("# Comprehensive Overview\n\n" + geminiContent);
  }

  if (perplexityContent) {
    sections.push("# Research & Current Information\n\n" + perplexityContent);
  }

  if (huggingfaceContent && huggingfaceContent.length > 50) {
    sections.push("# Additional Insights\n\n" + huggingfaceContent);
  }

  if (sections.length === 0) {
    return "No content could be generated from available AI services. Please check your API configurations.";
  }

  return sections.join("\n\n---\n\n");
}

export async function queryMultipleAIServices(query: string): Promise<MultiServiceResponse> {
  console.log("[MultiAI] Querying multiple AI services for:", query);

  // Run all services in parallel for better performance
  const [geminiResult, perplexityResult, huggingfaceResult] = await Promise.allSettled([
    queryGemini(query),
    queryPerplexity(query),
    queryHuggingFace(query),
  ]);

  const geminiContent = geminiResult.status === "fulfilled" ? geminiResult.value : "";
  const perplexityData = perplexityResult.status === "fulfilled" ? perplexityResult.value : { content: "", sources: [] };
  const huggingfaceContent = huggingfaceResult.status === "fulfilled" ? huggingfaceResult.value : "";

  const mergedContent = mergeMultiServiceContent(
    geminiContent,
    perplexityData.content,
    huggingfaceContent
  );

  // Convert Perplexity sources to our format
  const sources = perplexityData.sources.map((source: PerplexitySource) => ({
    title: source.title || "External Source",
    url: source.url || "#",
    snippet: source.snippet || undefined,
  }));

  return {
    geminiContent,
    perplexityContent: perplexityData.content,
    huggingfaceContent,
    mergedContent,
    sources,
  };
}