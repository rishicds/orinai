/**
 * Multi-Agent Orchestration Test Script
 * Tests the Phase 4 implementation with various query types
 */

import { 
  executeMultiAgentPipelineWithMonitoring,
  classifyWithConfidence 
} from "../src/lib/langchain/agents";
import type { DashboardOutput } from "../src/types";

// Test queries covering different visualization types and complexities
const testQueries = [
  {
    name: "Simple Pie Chart Query",
    query: "Show me the market share breakdown of different smartphone brands",
    expectedType: "pie_chart",
    expectedComplexity: "simple"
  },
  {
    name: "Timeline Query",
    query: "Create a roadmap for implementing AI in healthcare over the next 5 years",
    expectedType: "timeline", 
    expectedComplexity: "simple"
  },
  {
    name: "Complex Comparison Query",
    query: "Compare the pros and cons of renewable energy vs fossil fuels including economic impact and environmental effects",
    expectedType: "comparison",
    expectedComplexity: "multi_chart"
  },
  {
    name: "Analytics Dashboard Query",
    query: "Show me a comprehensive dashboard with KPIs, performance metrics, and trend analysis for our quarterly business review",
    expectedType: "analytics_summary",
    expectedComplexity: "dashboard"
  },
  {
    name: "User Data Query (RAG)",
    query: "Analyze my recent conversation history and show patterns in the topics I discuss most",
    expectedType: "bar_chart",
    expectedComplexity: "simple",
    expectsRAG: true
  },
  {
    name: "External Data Query",
    query: "What are the latest trends in artificial intelligence and machine learning?",
    expectedType: "text",
    expectedComplexity: "simple", 
    expectsExternal: true
  }
];

async function testMultiAgentSystem() {
  console.log("🚀 Starting Multi-Agent Orchestration Test Suite");
  console.log("=" .repeat(60));
  
  const testUserId = "test-user-12345";
  const results: any[] = [];
  
  for (const testCase of testQueries) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`Query: "${testCase.query}"`);
    console.log("-".repeat(40));
    
    try {
      // Test classification first
      console.log("🧠 Phase 1: Classification");
      const classificationResult = await classifyWithConfidence(testCase.query);
      
      console.log(`   Type: ${classificationResult.classification.type} (confidence: ${classificationResult.confidence.toFixed(2)})`);
      console.log(`   Complexity: ${classificationResult.classification.complexity}`);
      console.log(`   Requires RAG: ${classificationResult.classification.requiresRAG}`);
      console.log(`   Requires External: ${classificationResult.classification.requiresExternal}`);
      console.log(`   Reasoning: ${classificationResult.reasoning}`);
      
      // Test full pipeline
      console.log("\n🔄 Running Full Multi-Agent Pipeline");
      const startTime = Date.now();
      
      const { output, summary } = await executeMultiAgentPipelineWithMonitoring(
        testCase.query,
        testUserId
      );
      
      const executionTime = Date.now() - startTime;
      
      console.log("✅ Pipeline completed successfully!");
      console.log(`   Execution time: ${executionTime}ms`);
      console.log(`   Final output type: ${output.type}`);
      console.log(`   Title: ${output.title}`);
      console.log(`   Data points: ${output.data?.length || 0}`);
      console.log(`   Has sublinks: ${!!(output.sublinks?.length)}`);
      console.log(`   Has charts: ${!!(output.charts?.length)}`);
      
      // Validation checks
      const validationResults = {
        typeMatch: output.type === testCase.expectedType,
        complexityMatch: classificationResult.classification.complexity === testCase.expectedComplexity,
        ragMatch: testCase.expectsRAG ? classificationResult.classification.requiresRAG : true,
        externalMatch: testCase.expectsExternal ? classificationResult.classification.requiresExternal : true
      };
      
      console.log("\n🔍 Validation Results:");
      console.log(`   Type Match: ${validationResults.typeMatch ? '✅' : '❌'} (expected: ${testCase.expectedType}, got: ${output.type})`);
      console.log(`   Complexity Match: ${validationResults.complexityMatch ? '✅' : '❌'} (expected: ${testCase.expectedComplexity}, got: ${classificationResult.classification.complexity})`);
      
      if (testCase.expectsRAG) {
        console.log(`   RAG Detection: ${validationResults.ragMatch ? '✅' : '❌'} (expected: true, got: ${classificationResult.classification.requiresRAG})`);
      }
      
      if (testCase.expectsExternal) {
        console.log(`   External Detection: ${validationResults.externalMatch ? '✅' : '❌'} (expected: true, got: ${classificationResult.classification.requiresExternal})`);
      }
      
      // Agent execution summary
      console.log("\n📊 Agent Execution Summary:");
      console.log(`   Total Time: ${summary.totalExecutionTime}ms`);
      console.log(`   Phase Breakdown:`);
      Object.entries(summary.phaseBreakdown).forEach(([phase, time]) => {
        console.log(`     ${phase}: ${time}ms`);
      });
      
      console.log(`   Agent Decisions:`);
      Object.entries(summary.agentDecisions).forEach(([agent, decisions]) => {
        console.log(`     ${agent}:`, JSON.stringify(decisions, null, 6));
      });
      
      results.push({
        testCase: testCase.name,
        success: true,
        executionTime,
        output,
        summary,
        validation: validationResults
      });
      
    } catch (error) {
      console.error("❌ Test failed:", error);
      results.push({
        testCase: testCase.name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    console.log("=".repeat(60));
  }
  
  // Final summary
  console.log("\n🎯 Test Suite Summary");
  console.log("=".repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`Tests Passed: ${successCount}/${totalCount}`);
  console.log(`Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    const avgExecutionTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.executionTime, 0) / successCount;
    
    console.log(`Average Execution Time: ${avgExecutionTime.toFixed(0)}ms`);
  }
  
  console.log("\n📋 Individual Test Results:");
  results.forEach(result => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${result.testCase}`);
    if (!result.success) {
      console.log(`       Error: ${result.error}`);
    } else {
      const allValidationsPassed = Object.values(result.validation).every(v => v === true);
      console.log(`       Validations: ${allValidationsPassed ? '✅ All passed' : '⚠️  Some failed'}`);
    }
  });
  
  console.log("\n🏁 Multi-Agent System Test Complete!");
  
  return {
    totalTests: totalCount,
    passedTests: successCount,
    failedTests: totalCount - successCount,
    successRate: (successCount / totalCount) * 100,
    results
  };
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMultiAgentSystem()
    .then(summary => {
      console.log("\n📈 Final Test Summary:", summary);
      process.exit(summary.passedTests === summary.totalTests ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Test suite failed to run:", error);
      process.exit(1);
    });
}

export { testMultiAgentSystem };