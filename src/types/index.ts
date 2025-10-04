export type VisualizationType =
  | "pie_chart"
  | "bar_chart"
  | "line_chart"
  | "table"
  | "text"
  | "timeline"
  | "comparison"
  | "infographic";

export interface DashboardSublink {
  label: string;
  route: string;
  context: Record<string, unknown>;
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
