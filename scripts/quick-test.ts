/**
 * Quick test script to validate the multi-agent system is working
 */

import { classifierAgent } from "../src/lib/langchain/agents/classifier";
import { retrieverAgent } from "../src/lib/langchain/agents/retriever";

async function quickTest() {
  console.log("🧪 Quick Multi-Agent System Test");
  console.log("=" .repeat(40));
  
  try {
    // Test classifier
    console.log("Testing Classifier Agent...");
    const classification = await classifierAgent("Show me a pie chart of market shares");
    console.log("✅ Classifier result:", classification);
    
    // Test retriever
    console.log("\nTesting Retriever Agent...");
    const retrieval = await retrieverAgent("Show me market data", "test-user", classification);
    console.log("✅ Retriever result:", {
      chunksCount: retrieval.chunks.length,
      citationsCount: retrieval.citations.length
    });
    
    console.log("\n🎉 Basic agents are working!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

quickTest();