export type VisualizationType =
  | "pie_chart"
  | "bar_chart"
  | "line_chart"
  | "area_chart"
  | "scatter_plot"
  | "radar_chart"
  | "treemap"
  | "heatmap"
  | "funnel_chart"
  | "gauge_chart"
  | "waterfall_chart"
  | "sankey_diagram"
  | "bubble_chart"
  | "candlestick_chart"
  | "histogram"
  | "table"
  | "text"
  | "timeline"
  | "comparison"
  | "infographic"
  | "analytics_summary";

export interface DashboardSublink {
  label: string;
  route: string;
  context: Record<string, unknown>;
  category?: string;
  priority?: number;
  analytics?: {
    clickable: boolean;
    trackingId?: string;
  };
}

export interface DashboardCitation {
  title: string;
  url: string;
  snippet?: string;
}

export interface DashboardDataPoint {
  label?: string;
  value?: number;
  category?: string;
  [key: string]: unknown;
}

export interface DashboardConfig {
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  legend?: boolean;
  animation?: boolean;
  responsive?: boolean;
  gridLines?: boolean;
  dataLabels?: boolean;
  zoom?: boolean;
  brush?: boolean;
  tooltip?: {
    enabled: boolean;
    format?: string;
    backgroundColor?: string;
  };
  chartSpecific?: {
    // For radar charts
    polarAngleAxis?: string;
    polarRadiusAxis?: string;
    // For heatmaps
    intensity?: string;
    // For scatter plots
    size?: string;
    // For gauges
    min?: number;
    max?: number;
    gaugeTarget?: number;
    // For treemaps
    hierarchy?: string[];
    // For sankey
    sankeySource?: string;
    sankeyTarget?: string;
    sankeyValue?: string;
  };
  [key: string]: unknown;
}

export interface DashboardOutput {
  type: VisualizationType;
  title: string;
  data: DashboardDataPoint[];
  config?: DashboardConfig;
  sublinks?: DashboardSublink[];
  summary?: string;
  citations?: DashboardCitation[];
  imageUrl?: string;
  imagePrompt?: string;
  mermaidDiagrams?: string[];
  charts?: DashboardOutput[];
}

export interface ClassificationResult {
  type: VisualizationType;
  complexity: "simple" | "multi_chart" | "dashboard";
  requiresRAG: boolean;
  requiresExternal: boolean;
  requiresImage: boolean;
}

export interface RetrievalResult {
  chunks: Array<{ text: string; source?: string; relevance?: number }>;
  citations: DashboardCitation[];
}
