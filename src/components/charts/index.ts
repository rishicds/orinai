// Chart Components Index
export { default as BarChartRenderer } from "./BarChartRenderer";
export { default as PieChartRenderer } from "./PieChartRenderer";
export { default as LineChartRenderer } from "./LineChartRenderer";
export { default as AreaChartRenderer } from "./AreaChartRenderer";
export { default as ScatterPlotRenderer } from "./ScatterPlotRenderer";
export { default as RadarChartRenderer } from "./RadarChartRenderer";
export { default as TreemapRenderer } from "./TreemapRenderer";
export { default as HeatmapRenderer } from "./HeatmapRenderer";
export { default as GaugeChartRenderer } from "./GaugeChartRenderer";
export { default as FunnelChartRenderer } from "./FunnelChartRenderer";
export { default as AnalyticsSummaryRenderer } from "./AnalyticsSummaryRenderer";

// Chart Management
export { ChartManager, detectOptimalChartType, detectChartConfig } from "./ChartManager";

// Supported chart types list
export const SUPPORTED_CHART_TYPES = [
  "bar_chart",
  "pie_chart", 
  "line_chart",
  "area_chart",
  "scatter_plot",
  "radar_chart",
  "treemap",
  "heatmap",
  "gauge_chart",
  "funnel_chart",
  "analytics_summary"
] as const;

// Chart type metadata for auto-detection
export const CHART_TYPE_METADATA = {
  bar_chart: {
    bestFor: ["categorical data", "comparisons", "rankings"],
    dataRequirements: { minPoints: 2, maxPoints: 50, requiresLabels: true },
    performance: "high"
  },
  pie_chart: {
    bestFor: ["parts of whole", "percentages", "small datasets"],
    dataRequirements: { minPoints: 2, maxPoints: 8, requiresLabels: true },
    performance: "high"
  },
  line_chart: {
    bestFor: ["trends over time", "continuous data", "large datasets"],
    dataRequirements: { minPoints: 3, maxPoints: 1000, requiresOrder: true },
    performance: "medium"
  },
  area_chart: {
    bestFor: ["trends with magnitude", "cumulative data", "emphasis on total"],
    dataRequirements: { minPoints: 3, maxPoints: 500, requiresOrder: true },
    performance: "medium"
  },
  scatter_plot: {
    bestFor: ["correlation", "distribution", "outlier detection"],
    dataRequirements: { minPoints: 5, maxPoints: 500, requiresXY: true },
    performance: "medium"
  },
  radar_chart: {
    bestFor: ["multivariate data", "skill assessment", "comparisons"],
    dataRequirements: { minPoints: 3, maxPoints: 10, requiresMultipleMetrics: true },
    performance: "medium"
  },
  treemap: {
    bestFor: ["hierarchical data", "size comparison", "space efficiency"],
    dataRequirements: { minPoints: 4, maxPoints: 100, requiresSize: true },
    performance: "high"
  },
  heatmap: {
    bestFor: ["density visualization", "pattern discovery", "large datasets"],
    dataRequirements: { minPoints: 10, maxPoints: 10000, requiresIntensity: true },
    performance: "low"
  },
  gauge_chart: {
    bestFor: ["KPIs", "single metrics", "goal tracking"],
    dataRequirements: { minPoints: 1, maxPoints: 1, requiresTarget: false },
    performance: "high"
  },
  funnel_chart: {
    bestFor: ["process flows", "conversion rates", "sequential data"],
    dataRequirements: { minPoints: 3, maxPoints: 10, requiresOrder: true },
    performance: "high"
  },
  analytics_summary: {
    bestFor: ["overview", "multiple metrics", "dashboard"],
    dataRequirements: { minPoints: 1, maxPoints: 1000, requiresNothing: true },
    performance: "high"
  }
} as const;