/**
 * Test script to verify the btoa Unicode fix in VisualizationService
 */

import { visualizationService } from "../src/lib/services/VisualizationService";

async function testUnicodeHandling() {
  console.log("🧪 Testing Unicode handling in VisualizationService");
  console.log("=" .repeat(50));
  
  try {
    // Test with queries that might contain Unicode characters
    const testQueries = [
      "AI & Machine Learning trends 📊",
      "Quantum Computing vs Classical Computing 🔬",
      "Sustainable Energy Solutions ⚡",
      "User Experience Design Process 🎨",
      "Regular query without emojis"
    ];
    
    for (const query of testQueries) {
      console.log(`\nTesting query: "${query}"`);
      
      try {
        const images = await visualizationService.fetchTopicImages(query);
        console.log(`✅ Generated ${images.length} images successfully`);
        
        // Check if base64 encoding worked
        images.forEach((image, index) => {
          if (image.url.startsWith('data:image/svg+xml;base64,')) {
            console.log(`   Image ${index + 1}: Base64 encoding successful`);
          } else {
            console.log(`   Image ${index + 1}: Different format - ${image.source}`);
          }
        });
        
      } catch (error) {
        console.error(`❌ Failed for query "${query}":`, error);
      }
    }
    
    console.log("\n🎉 Unicode handling test completed!");
    
  } catch (error) {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testUnicodeHandling();
}

export { testUnicodeHandling };