import { userMemoryManager } from "@/lib/memory/user-memory";

async function testMemorySystem() {
  console.log("Testing User Memory System...");
  
  const testUserId = "test-user-123";
  
  try {
    // Test storing a memory
    console.log("1. Storing test memory...");
    await userMemoryManager.storeMemory(
      testUserId,
      "I am interested in quantum computing and machine learning",
      "User preferences and interests",
      undefined,
      8,
      {
        queryType: "preference",
        entities: ["quantum computing", "machine learning"],
        keywords: ["interested", "quantum", "computing", "machine", "learning"],
        topic: "technology"
      }
    );
    
    // Wait a moment for indexing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test searching memories
    console.log("2. Searching for relevant memories...");
    const memories = await userMemoryManager.searchMemories(
      testUserId,
      "Tell me about quantum computing",
      3,
      0.5
    );
    
    console.log("Found memories:", memories.length);
    memories.forEach((memory, index) => {
      console.log(`Memory ${index + 1}:`, {
        content: memory.content,
        context: memory.context,
        similarity: memory.similarity,
        timestamp: memory.timestamp
      });
    });
    
    // Test building user context
    console.log("3. Building user context...");
    const context = await userMemoryManager.buildUserContext(
      testUserId,
      "Explain quantum machine learning"
    );
    
    console.log("User context:", context);
    
    console.log("✅ Memory system test completed successfully!");
    
  } catch (error) {
    console.error("❌ Memory system test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMemorySystem();
}

export { testMemorySystem };