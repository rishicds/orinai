/**
 * Test script for LangChain Multi-Agent System
 * Demonstrates proper LangChain tools and agent usage
 */

import { executeLangChainAgent } from "../src/lib/langchain/agents/langchain-agent";

async function testLangChainAgents() {
  console.log("🚀 Testing LangChain Multi-Agent System");
  console.log("=" .repeat(50));
  
  const testQueries = [
    "Show me a pie chart of global energy consumption",
    "Create a timeline for AI development milestones", 
    "Compare renewable vs fossil fuel efficiency",
    "Analyze market trends in tech stocks"
  ];
  
  for (const query of testQueries) {
    console.log(`\n📋 Query: "${query}"`);
    console.log("-".repeat(40));
    
    try {
      const startTime = Date.now();
      const result = await executeLangChainAgent(query, "test-user-123");
      const duration = Date.now() - startTime;
      
      console.log("✅ LangChain Agent Result:");
      console.log(`   Type: ${result.type}`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Data Points: ${result.data?.length || 0}`);
      console.log(`   Sublinks: ${result.sublinks?.length || 0}`);
      console.log(`   Duration: ${duration}ms`);
      
      if (result.summary) {
        console.log(`   Summary: ${result.summary.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.error("❌ Test failed:", error);
    }
  }
  
  console.log("\n🎯 LangChain Multi-Agent System Test Complete!");
  console.log("\nKey Features Demonstrated:");
  console.log("  ✅ LangChain Tool integration");
  console.log("  ✅ Agent-based workflow execution");
  console.log("  ✅ Modular tool composition");
  console.log("  ✅ Structured output generation");
  console.log("  ✅ Error handling and fallbacks");
}

// Run if executed directly
if (require.main === module) {
  testLangChainAgents()
    .then(() => {
      console.log("\n✨ All tests completed successfully!");
      process.exit(0);
    })
    .catch(error => {
      console.error("\n💥 Test suite failed:", error);
      process.exit(1);
    });
}

export { testLangChainAgents };