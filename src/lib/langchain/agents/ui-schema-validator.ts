import { z } from "zod";
import type { 
  DashboardOutput, 
  ClassificationResult, 
  VisualizationType,
  DashboardDataPoint,
  DashboardConfig,
  DashboardSublink,
  DashboardCitation
} from "@/types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  correctedOutput?: DashboardOutput;
}

// Schema definitions for validation
const dashboardDataPointSchema = z.object({
  label: z.string().optional(),
  value: z.number().optional(),
  category: z.string().optional(),
}).catchall(z.unknown());

const dashboardConfigSchema = z.object({
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  colors: z.array(z.string()).optional(),
  legend: z.boolean().optional(),
  animation: z.boolean().optional(),
  responsive: z.boolean().optional(),
  gridLines: z.boolean().optional(),
  dataLabels: z.boolean().optional(),
  zoom: z.boolean().optional(),
  brush: z.boolean().optional(),
  tooltip: z.object({
    enabled: z.boolean(),
    format: z.string().optional(),
    backgroundColor: z.string().optional(),
  }).optional(),
  chartSpecific: z.object({
    polarAngleAxis: z.string().optional(),
    polarRadiusAxis: z.string().optional(),
    intensity: z.string().optional(),
    size: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    gaugeTarget: z.number().optional(),
    hierarchy: z.array(z.string()).optional(),
    sankeySource: z.string().optional(),
    sankeyTarget: z.string().optional(),
    sankeyValue: z.string().optional(),
  }).optional(),
}).catchall(z.unknown());

const dashboardSublinkSchema = z.object({
  label: z.string(),
  route: z.string(),
  context: z.record(z.unknown()),
  category: z.string().optional(),
  priority: z.number().optional(),
  analytics: z.object({
    clickable: z.boolean(),
    trackingId: z.string().optional(),
  }).optional(),
});

const dashboardCitationSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string().optional(),
});

const dashboardOutputSchema: z.ZodType<DashboardOutput> = z.lazy(() => z.object({
  type: z.enum([
    "pie_chart", "bar_chart", "line_chart", "area_chart", "scatter_plot",
    "radar_chart", "treemap", "heatmap", "funnel_chart", "gauge_chart",
    "waterfall_chart", "sankey_diagram", "bubble_chart", "candlestick_chart",
    "histogram", "table", "text", "timeline", "comparison", "infographic",
    "analytics_summary"
  ]),
  title: z.string().min(1),
  data: z.array(dashboardDataPointSchema),
  config: dashboardConfigSchema.optional(),
  sublinks: z.array(dashboardSublinkSchema).optional(),
  summary: z.string().optional(),
  citations: z.array(dashboardCitationSchema).optional(),
  imageUrl: z.string().optional(),
  imagePrompt: z.string().optional(),
  mermaidDiagrams: z.array(z.string()).optional(),
  charts: z.array(dashboardOutputSchema).optional(),
}));

/**
 * UI Schema Validator Agent
 * Ensures front-end consistency and validates dashboard output structure
 */
export async function uiSchemaValidator(
  dashboardOutput: DashboardOutput,
  classification: ClassificationResult
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  console.log("[UI Validator] Validating dashboard output for type:", dashboardOutput.type);
  
  // 1. Schema validation
  try {
    dashboardOutputSchema.parse(dashboardOutput);
  } catch (schemaError) {
    if (schemaError instanceof z.ZodError) {
      schemaError.errors.forEach(err => {
        errors.push(`Schema validation error: ${err.path.join('.')} - ${err.message}`);
      });
    } else {
      errors.push(`Schema validation failed: ${schemaError}`);
    }
  }
  
  // 2. Type consistency validation
  if (dashboardOutput.type !== classification.type) {
    warnings.push(
      `Output type "${dashboardOutput.type}" doesn't match classified type "${classification.type}"`
    );
  }
  
  // 3. Data structure validation per visualization type
  validateDataStructureForType(dashboardOutput, errors, warnings, suggestions);
  
  // 4. Configuration validation
  validateConfiguration(dashboardOutput, errors, warnings, suggestions);
  
  // 5. Sublinks validation
  validateSublinks(dashboardOutput, errors, warnings, suggestions);
  
  // 6. Citations validation
  validateCitations(dashboardOutput, errors, warnings, suggestions);
  
  // 7. Content quality validation
  validateContentQuality(dashboardOutput, errors, warnings, suggestions);
  
  // 8. Frontend compatibility validation
  validateFrontendCompatibility(dashboardOutput, errors, warnings, suggestions);
  
  const isValid = errors.length === 0;
  
  // Attempt auto-correction for common issues
  let correctedOutput: DashboardOutput | undefined;
  if (!isValid) {
    correctedOutput = attemptAutoCorrection(dashboardOutput, errors);
  }
  
  console.log("[UI Validator] Validation completed:", {
    isValid,
    errorsCount: errors.length,
    warningsCount: warnings.length,
    suggestionsCount: suggestions.length,
    autoCorrected: !!correctedOutput
  });
  
  return {
    isValid,
    errors,
    warnings,
    suggestions,
    correctedOutput
  };
}

/**
 * Validate data structure requirements for specific visualization types
 */
function validateDataStructureForType(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  const { type, data } = dashboard;
  
  switch (type) {
    case "pie_chart":
      if (data.some(d => typeof d.value !== 'number')) {
        errors.push("Pie chart requires numeric 'value' field in all data points");
      }
      if (data.some(d => !d.label)) {
        errors.push("Pie chart requires 'label' field in all data points");
      }
      break;
      
    case "bar_chart":
    case "line_chart":
      if (data.some(d => typeof d.value !== 'number')) {
        errors.push(`${type} requires numeric 'value' field in all data points`);
      }
      if (data.some(d => !d.label && !d.category)) {
        warnings.push(`${type} should have 'label' or 'category' field for x-axis`);
      }
      break;
      
    case "table":
      if (data.length === 0) {
        errors.push("Table visualization requires at least one data point");
      }
      // Tables are flexible with data structure
      break;
      
    case "timeline":
      if (data.some(d => !d.label)) {
        errors.push("Timeline requires 'label' field for event descriptions");
      }
      suggestions.push("Consider adding date/time information in data points");
      break;
      
    case "text":
      if (!dashboard.summary && data.length === 0) {
        warnings.push("Text visualization should have either summary or data content");
      }
      break;
      
    case "comparison":
      if (data.length < 2) {
        warnings.push("Comparison visualization works best with multiple data sections");
      }
      break;
      
    default:
      // Generic validation for other chart types
      if (data.length === 0) {
        warnings.push(`${type} visualization has no data points`);
      }
  }
}

/**
 * Validate configuration object for consistency
 */
function validateConfiguration(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  const { config, type } = dashboard;
  
  if (!config) {
    suggestions.push("Consider adding configuration for better visualization control");
    return;
  }
  
  // Validate colors array
  if (config.colors) {
    const invalidColors = config.colors.filter(color => 
      !/^#[0-9A-F]{6}$/i.test(color) && !/^rgb\(/i.test(color)
    );
    if (invalidColors.length > 0) {
      warnings.push(`Invalid color formats detected: ${invalidColors.join(', ')}`);
    }
  }
  
  // Type-specific config validation
  if (type === "gauge_chart" && config.chartSpecific) {
    const { min, max, gaugeTarget } = config.chartSpecific;
    if (typeof min === 'number' && typeof max === 'number' && min >= max) {
      errors.push("Gauge chart: min value must be less than max value");
    }
    if (typeof gaugeTarget === 'number' && typeof min === 'number' && typeof max === 'number') {
      if (gaugeTarget < min || gaugeTarget > max) {
        warnings.push("Gauge target value is outside min/max range");
      }
    }
  }
}

/**
 * Validate sublinks structure and content
 */
function validateSublinks(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  if (!dashboard.sublinks || dashboard.sublinks.length === 0) {
    suggestions.push("Consider adding sublinks for better user exploration");
    return;
  }
  
  dashboard.sublinks.forEach((sublink, index) => {
    if (!sublink.label || sublink.label.trim().length === 0) {
      errors.push(`Sublink ${index + 1}: Label is required and cannot be empty`);
    }
    
    if (!sublink.route || sublink.route.trim().length === 0) {
      errors.push(`Sublink ${index + 1}: Route is required and cannot be empty`);
    }
    
    if (sublink.route && !sublink.route.startsWith('/')) {
      warnings.push(`Sublink ${index + 1}: Route should start with '/' for proper routing`);
    }
    
    if (!sublink.context || Object.keys(sublink.context).length === 0) {
      warnings.push(`Sublink ${index + 1}: Context object is empty - consider adding relevant data`);
    }
  });
  
  // Check for duplicate routes
  const routes = dashboard.sublinks.map(s => s.route);
  const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate sublink routes detected: ${[...new Set(duplicates)].join(', ')}`);
  }
}

/**
 * Validate citations structure and URLs
 */
function validateCitations(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  if (!dashboard.citations) {
    return;
  }
  
  dashboard.citations.forEach((citation, index) => {
    if (!citation.title || citation.title.trim().length === 0) {
      errors.push(`Citation ${index + 1}: Title is required`);
    }
    
    try {
      new URL(citation.url);
    } catch {
      errors.push(`Citation ${index + 1}: Invalid URL format`);
    }
    
    if (citation.snippet && citation.snippet.length > 500) {
      warnings.push(`Citation ${index + 1}: Snippet is quite long, consider shortening for better UX`);
    }
  });
}

/**
 * Validate content quality and completeness
 */
function validateContentQuality(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  // Title validation
  if (!dashboard.title || dashboard.title.trim().length === 0) {
    errors.push("Dashboard title is required");
  } else if (dashboard.title.length > 100) {
    warnings.push("Dashboard title is quite long, consider shortening for better display");
  }
  
  // Summary validation
  if (dashboard.summary && dashboard.summary.length > 2000) {
    warnings.push("Dashboard summary is very long, consider breaking into sections");
  }
  
  // Data completeness
  if (dashboard.data.length === 0 && !dashboard.summary && dashboard.type !== 'text') {
    warnings.push("Dashboard has no data points or summary content");
  }
  
  // Mermaid diagrams validation
  if (dashboard.mermaidDiagrams) {
    dashboard.mermaidDiagrams.forEach((diagram, index) => {
      if (!diagram.includes('graph') && !diagram.includes('sequenceDiagram') && 
          !diagram.includes('gantt') && !diagram.includes('pie')) {
        warnings.push(`Mermaid diagram ${index + 1}: May not be valid Mermaid syntax`);
      }
    });
  }
}

/**
 * Validate frontend compatibility and requirements
 */
function validateFrontendCompatibility(
  dashboard: DashboardOutput,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  // Check for unsupported visualization types in current frontend
  const supportedTypes = [
    "pie_chart", "bar_chart", "line_chart", "table", "text", 
    "timeline", "comparison", "infographic", "analytics_summary"
  ];
  
  if (!supportedTypes.includes(dashboard.type)) {
    errors.push(`Visualization type "${dashboard.type}" is not supported by current frontend`);
  }
  
  // Check for nested charts complexity
  if (dashboard.charts && dashboard.charts.length > 5) {
    warnings.push("Dashboard has many nested charts, may impact performance");
  }
  
  // Validate image URLs if present
  if (dashboard.imageUrl) {
    try {
      new URL(dashboard.imageUrl);
    } catch {
      errors.push("Invalid image URL format");
    }
  }
  
  // Check data size for performance
  if (dashboard.data.length > 1000) {
    warnings.push("Large dataset detected, consider pagination or data reduction for better performance");
  }
}

/**
 * Attempt to auto-correct common validation issues
 */
function attemptAutoCorrection(
  dashboard: DashboardOutput,
  _errors: string[]
): DashboardOutput | undefined {
  const corrected = { ...dashboard };
  let hasCorrected = false;
  
  // Auto-correct empty title
  if (!corrected.title || corrected.title.trim().length === 0) {
    corrected.title = `${corrected.type.replace('_', ' ')} Analysis`;
    hasCorrected = true;
  }
  
  // Auto-correct missing labels in data points for charts that need them
  if (['pie_chart', 'bar_chart'].includes(corrected.type)) {
    corrected.data = corrected.data.map((point, index) => {
      if (!point.label) {
        return { ...point, label: `Item ${index + 1}` };
      }
      return point;
    });
    hasCorrected = true;
  }
  
  // Auto-correct sublink routes
  if (corrected.sublinks) {
    corrected.sublinks = corrected.sublinks.map(sublink => {
      if (sublink.route && !sublink.route.startsWith('/')) {
        return { ...sublink, route: `/${sublink.route}` };
      }
      return sublink;
    });
    hasCorrected = true;
  }
  
  // Auto-correct configuration for responsive charts
  if (!corrected.config) {
    corrected.config = { responsive: true, animation: true };
    hasCorrected = true;
  } else if (corrected.config.responsive === undefined) {
    corrected.config = { ...corrected.config, responsive: true };
    hasCorrected = true;
  }
  
  return hasCorrected ? corrected : undefined;
}