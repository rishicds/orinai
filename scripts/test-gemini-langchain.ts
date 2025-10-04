// Test script to verify Gemini 2.5 Flash integration with LangChain
import { executeLangChainAgent } from "../src/lib/langchain/agents/langchain-agent";

async function testGeminiLangChain() {
  console.log("🧪 Testing Gemini 2.5 Flash with LangChain agent...");
  
  try {
    const testQuery = "Create a pie chart showing the distribution of renewable energy sources";
    const testUserId = "test-user-123";
    
    console.log(`📝 Query: ${testQuery}`);
    console.log(`👤 User ID: ${testUserId}`);
    console.log("⏳ Processing...\n");
    
    const result = await executeLangChainAgent(testQuery, testUserId);
    
    console.log("✅ LangChain with Gemini completed successfully!");
    console.log("📊 Result:");
    console.log(JSON.stringify(result, null, 2));
    
    // Validate the result structure
    if (result.type && result.title && Array.isArray(result.data)) {
      console.log("\n✅ Dashboard structure is valid!");
      console.log(`📈 Type: ${result.type}`);
      console.log(`📝 Title: ${result.title}`);
      console.log(`📊 Data points: ${result.data.length}`);
      
      if (result.sublinks && Array.isArray(result.sublinks)) {
        console.log(`🔗 Sublinks: ${result.sublinks.length}`);
        
        // Check if sublinks have proper context objects
        const hasValidContext = result.sublinks.every(link => 
          link.context && typeof link.context === 'object' && Object.keys(link.context).length > 0
        );
        
        if (hasValidContext) {
          console.log("✅ All sublinks have valid context objects!");
        } else {
          console.log("❌ Some sublinks have empty or invalid context objects");
        }
      }
    } else {
      console.log("❌ Dashboard structure is invalid");
    }
    
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error);
  }
}

// Run the test
testGeminiLangChain().catch(console.error);