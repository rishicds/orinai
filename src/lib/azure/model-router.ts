import "server-only";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ModelInvocationOptions {
  intent: "classification" | "summarization" | "generation";
  responseFormat?: "json" | "text";
  temperature?: number;
}

export interface AzureChatChoice {
  index: number;
  finish_reason: string;
  message: {
    role: "assistant";
    content: string;
  };
}

export interface AzureChatCompletionResponse {
  id: string;
  choices: AzureChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Gemini models by intent
const DEFAULT_MODEL_NAME = "gemini-2.5-flash";

function resolveApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable.");
  }
  return apiKey;
}

function resolveModelForIntent(intent: ModelInvocationOptions["intent"]): string {
  const intentModels: Record<ModelInvocationOptions["intent"], string> = {
    classification: "gemini-2.5-flash",
    summarization: "gemini-2.5-flash",
    generation: "gemini-2.5-flash",
  };

  return intentModels[intent] ?? DEFAULT_MODEL_NAME;
}

function convertMessagesToGeminiFormat(messages: ChatMessage[]): { 
  systemInstruction?: { parts: { text: string }[] },
  contents: { role: string; parts: { text: string }[] }[]
} {
  const systemMessages = messages.filter(m => m.role === "system");
  const nonSystemMessages = messages.filter(m => m.role !== "system");

  const systemInstruction = systemMessages.length > 0 
    ? { parts: [{ text: systemMessages.map(m => m.content).join("\n") }] }
    : undefined;

  const contents = nonSystemMessages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  return { systemInstruction, contents };
}

export async function invokeAzureChat(
  messages: ChatMessage[],
  options: ModelInvocationOptions
): Promise<AzureChatCompletionResponse> {
  const model = resolveModelForIntent(options.intent);
  const apiKey = resolveApiKey();

  const { systemInstruction, contents } = convertMessagesToGeminiFormat(messages);

  const generationConfig: Record<string, unknown> = {
    temperature: options.temperature ?? 0,
    candidateCount: 1,
  };

  if (options.responseFormat === "json") {
    generationConfig.responseMimeType = "application/json";
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig,
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log(`[Gemini API] Calling ${model} for intent: ${options.intent}`);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.text();
    console.error(`[Gemini API] Request failed:`, payload);
    throw new Error(
      `Gemini API request failed with status ${response.status}: ${payload}`
    );
  }

  const json = await response.json();
  
  // Log successful response
  console.log(`[Gemini API] Response received, candidates: ${json.candidates?.length || 0}`);
  
  // Convert Gemini response format to Azure-compatible format
  const convertedResponse: AzureChatCompletionResponse = {
    id: json.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 10) || "gemini-response",
    choices: json.candidates?.map((candidate: { finishReason?: string; content?: { parts?: { text: string }[] } }, index: number) => ({
      index,
      finish_reason: candidate.finishReason || "stop",
      message: {
        role: "assistant" as const,
        content: candidate.content?.parts?.map((part: { text: string }) => part.text).join("") || "",
      },
    })) || [],
    usage: json.usageMetadata ? {
      prompt_tokens: json.usageMetadata.promptTokenCount || 0,
      completion_tokens: json.usageMetadata.candidatesTokenCount || 0,
      total_tokens: json.usageMetadata.totalTokenCount || 0,
    } : undefined,
  };

  return convertedResponse;
}
