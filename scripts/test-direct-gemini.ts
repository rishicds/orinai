// Test direct Gemini agent with explicit env loading
import 'dotenv/config';
import { executeGeminiAgent } from "../src/lib/langchain/agents/gemini-agent";

async function testDirectGemini() {
  console.log("🧪 Testing direct Gemini agent...");
  
  // Check env vars
  console.log("📋 Environment check:");
  console.log("  NEXT_PUBLIC_GEMINI_API_KEY:", process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Found' : 'Not found');
  console.log("  GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
  
  try {
    const testQuery = "Create a bar chart showing global renewable energy adoption by region";
    const testUserId = "test-user-456";
    
    console.log(`\n📝 Query: ${testQuery}`);
    console.log(`👤 User ID: ${testUserId}`);
    console.log("⏳ Processing with direct Gemini agent...\n");
    
    const result = await executeGeminiAgent(testQuery, testUserId);
    
    console.log("✅ Direct Gemini agent completed successfully!");
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
          console.log("🎉 Zod validation issue should be FIXED!");
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
testDirectGemini().catch(console.error);