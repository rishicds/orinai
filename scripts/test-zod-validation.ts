// Test script to reproduce the Zod validation error
import { dashboardSchema } from "../src/lib/schemas/dashboard";

// Simulate the problematic response that's causing validation errors
const problematicDashboard = {
  type: "pie_chart",
  title: "Test Dashboard",
  data: [
    { label: "Category A", value: 40 },
    { label: "Category B", value: 35 }, 
    { label: "Category C", value: 25 }
  ],
  sublinks: [
    { 
      label: "Explore Details", 
      route: "/explore/test",
      context: undefined  // This causes the validation error
    },
    { 
      label: "Related Analysis", 
      route: "/analyze/related",
      context: undefined  // This causes the validation error
    },
    {
      label: "More Info",
      route: "/info/more", 
      context: undefined  // This causes the validation error
    }
  ]
};

console.log("Testing dashboard validation...");

try {
  const validated = dashboardSchema.parse(problematicDashboard);
  console.log("✅ Validation passed!");
  console.log(JSON.stringify(validated, null, 2));
} catch (error) {
  console.log("❌ Validation failed:");
  console.error(error);
}

// Test the fixed version
const fixedDashboard = {
  ...problematicDashboard,
  sublinks: [
    { 
      label: "Explore Details", 
      route: "/explore/test",
      context: {
        type: "pie_chart",
        category: "test",
        dataPoints: 3
      }
    },
    { 
      label: "Related Analysis", 
      route: "/analyze/related",
      context: {
        relatedTo: "pie_chart",
        analysisType: "comparative"
      }
    },
    {
      label: "More Info",
      route: "/info/more", 
      context: {
        infoType: "detailed",
        source: "dashboard"
      }
    }
  ]
};

console.log("\nTesting fixed dashboard validation...");

try {
  const validated = dashboardSchema.parse(fixedDashboard);
  console.log("✅ Fixed validation passed!");
} catch (error) {
  console.log("❌ Fixed validation failed:");
  console.error(error);
}