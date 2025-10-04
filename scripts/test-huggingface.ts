import dotenv from "dotenv";
import { HuggingFaceEmbeddings } from "@/lib/memory/huggingface-embeddings";
import { AlternativeEmbeddings } from "@/lib/memory/alternative-embeddings";

// Load environment variables
dotenv.config();

async function testHuggingFaceIntegration() {
  console.log("🤗 Testing Hugging Face Integration for RAG System\n");
  
  // Test 1: Direct Hugging Face Embeddings
  console.log("1. Testing direct Hugging Face embeddings...");
  const hfEmbeddings = new HuggingFaceEmbeddings();
  const modelInfo = hfEmbeddings.getModelInfo();
  console.log(`   Model: ${modelInfo.modelId}`);
  console.log(`   Has API Key: ${modelInfo.hasApiKey}`);
  console.log(`   Target Dimensions: ${modelInfo.dimensions}`);
  
  if (modelInfo.hasApiKey) {
    try {
      const testEmbedding = await hfEmbeddings.embedQuery("Hello, this is a test sentence for embeddings.");
      console.log(`   ✅ Embedding generated successfully`);
      console.log(`   📊 Embedding dimensions: ${testEmbedding.length}`);
      console.log(`   🔢 Sample values: [${testEmbedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}...]`);
    } catch (error) {
      console.log(`   ❌ Failed to generate embedding: ${error}`);
    }
  } else {
    console.log(`   ⚠️  No API key found, skipping direct test`);
  }
  
  // Test 2: Alternative Embeddings (with HF integration)
  console.log("\n2. Testing alternative embeddings system...");
  const altEmbeddings = new AlternativeEmbeddings();
  const connectionTest = await altEmbeddings.testConnection();
  console.log(`   Service: ${connectionTest.service}`);
  console.log(`   Model: ${connectionTest.model || 'N/A'}`);
  console.log(`   Status: ${connectionTest.success ? '✅ Connected' : '❌ Failed'}`);
  
  try {
    const embedding = await altEmbeddings.embedQuery("Quantum computing is fascinating technology.");
    console.log(`   ✅ Embedding generated via alternative system`);
    console.log(`   📊 Dimensions: ${embedding.length}`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
  }
  
  // Test 3: Performance comparison
  console.log("\n3. Testing embedding performance...");
  const testTexts = [
    "Artificial intelligence is transforming technology",
    "Machine learning algorithms can recognize patterns",
    "Deep neural networks process complex data"
  ];
  
  console.log("   Testing batch embedding performance...");
  const startTime = Date.now();
  
  try {
    const batchEmbeddings = await altEmbeddings.embedDocuments(testTexts);
    const endTime = Date.now();
    
    console.log(`   ✅ Batch embedding completed`);
    console.log(`   ⏱️  Time taken: ${endTime - startTime}ms`);
    console.log(`   📊 Generated ${batchEmbeddings.length} embeddings`);
    console.log(`   🔢 Average dimension: ${batchEmbeddings[0]?.length || 0}`);
    
  } catch (error) {
    console.log(`   ❌ Batch embedding failed: ${error}`);
  }
  
  console.log("\n🎉 Hugging Face integration test completed!");
  console.log("\n📋 Summary:");
  console.log(`   • Hugging Face API: ${modelInfo.hasApiKey ? '✅ Available' : '❌ No API key'}`);
  console.log(`   • Embedding Service: ${connectionTest.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   • Model: ${connectionTest.model || 'Fallback system'}`);
  
  if (modelInfo.hasApiKey) {
    console.log("\n💡 Your system is ready to use Hugging Face embeddings for RAG!");
    console.log("   The memory system will automatically use HF embeddings for better semantic search.");
  } else {
    console.log("\n💡 To enable Hugging Face embeddings:");
    console.log("   1. Get a free API key from https://huggingface.co/settings/tokens");
    console.log("   2. Add it to your .env file as HUGGINGFACE_API_KEY");
    console.log("   3. Restart your application");
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testHuggingFaceIntegration().catch(console.error);
}

export { testHuggingFaceIntegration };