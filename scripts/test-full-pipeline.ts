// Test the full pipeline with memory to see if it works end-to-end
import 'dotenv/config';
import { processQueryWithMemory } from "../src/lib/langchain/pipeline-with-memory";

async function testFullPipeline() {
  console.log("🧪 Testing full pipeline with Gemini integration...");
  
  try {
    const testQuery = "Show me a timeline of major AI milestones";
    const testUserId = "test-user-789";
    
    console.log(`📝 Query: ${testQuery}`);
    console.log(`👤 User ID: ${testUserId}`);
    console.log("⏳ Processing through full pipeline...\n");
    
    const result = await processQueryWithMemory(testQuery, testUserId);
    
    console.log("✅ Full pipeline completed successfully!");
    console.log("📊 Result preview:");
    console.log(`  📈 Type: ${result.type}`);
    console.log(`  📝 Title: ${result.title}`);
    console.log(`  📊 Data points: ${result.data?.length || 0}`);
    console.log(`  🔗 Sublinks: ${result.sublinks?.length || 0}`);
    
    if (result.sublinks && result.sublinks.length > 0) {
      console.log("  📋 Sublink context check:");
      result.sublinks.forEach((link, i) => {
        const hasContext = link.context && Object.keys(link.context).length > 0;
        console.log(`    ${i + 1}. ${link.label}: ${hasContext ? '✅' : '❌'} context`);
      });
    }
    
    console.log("\n🎉 System is ready! The Zod validation errors should be resolved.");
    
  } catch (error) {
    console.error("❌ Full pipeline test failed:");
    console.error(error);
  }
}

// Run the test
testFullPipeline().catch(console.error);