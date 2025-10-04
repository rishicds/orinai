import type { ClassificationResult, RetrievalResult } from "@/types";

/**
 * Placeholder retriever agent for Phase 1. Returns empty context until RAG is enabled.
 */
export async function retrieverAgent(
  _query: string,
  _userId: string,
  classification: ClassificationResult
): Promise<RetrievalResult> {
  if (classification.requiresRAG || classification.requiresExternal) {
    console.info(
      "[Retriever] RAG/external retrieval requested but not yet implemented in this phase."
    );
  }

  return {
    chunks: [],
    citations: [],
  };
}
