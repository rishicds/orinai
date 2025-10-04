"use client";

import type { DashboardOutput, VisualizationType } from "@/types";
import { lazy, Suspense } from "react";

// Lazy load all chart components for better performance
const BarChartRenderer = lazy(() => import("./BarChartRenderer"));
const PieChartRenderer = lazy(() => import("./PieChartRenderer"));
const LineChartRenderer = lazy(() => import("./LineChartRenderer"));
const AreaChartRenderer = lazy(() => import("./AreaChartRenderer"));
const ScatterPlotRenderer = lazy(() => import("./ScatterPlotRenderer"));
const RadarChartRenderer = lazy(() => import("./RadarChartRenderer"));
const TreemapRenderer = lazy(() => import("./TreemapRenderer"));
const HeatmapRenderer = lazy(() => import("./HeatmapRenderer"));
const GaugeChartRenderer = lazy(() => import("./GaugeChartRenderer"));
const FunnelChartRenderer = lazy(() => import("./FunnelChartRenderer"));
const AnalyticsSummaryRenderer = lazy(() => import("./AnalyticsSummaryRenderer"));

interface ChartManagerProps {
  dashboard: DashboardOutput;
}

// Chart configuration auto-detection based on data structure
export function detectOptimalChartType(data: Record<string, unknown>[]): VisualizationType {
  if (!data || data.length === 0) return "text";

  const firstItem = data[0];
  const hasLabel = firstItem.label || firstItem.name;
  const hasValue = typeof firstItem.value === "number";
  const hasXY = firstItem.x !== undefined && firstItem.y !== undefined;
  const hasMultipleMetrics = Object.keys(firstItem).filter(key => 
    typeof firstItem[key] === "number" && key !== "value"
  ).length > 1;

  // Detection logic
  if (hasXY) return "scatter_plot";
  if (hasMultipleMetrics && data.length <= 8) return "radar_chart";
  if (data.length === 1 && hasValue) return "gauge_chart";
  if (data.length <= 5 && hasLabel && hasValue) return "pie_chart";
  if (data.length > 5 && data.length <= 20 && hasLabel && hasValue) return "bar_chart";
  if (data.length > 20 && hasLabel && hasValue) return "line_chart";
  if (data.length > 50) return "heatmap";
  
  return "analytics_summary";
}

// Enhanced chart configuration auto-detection
export function detectChartConfig(data: Record<string, unknown>[], chartType: VisualizationType) {
  const config: Record<string, unknown> = {
    animation: true,
    responsive: true,
    legend: true,
    gridLines: true,
    tooltip: { enabled: true },
  };

  if (!data || data.length === 0) return config;

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  // Auto-detect axes
  const labelKeys = keys.filter(key => 
    typeof firstItem[key] === "string" || key.includes("label") || key.includes("name")
  );
  const valueKeys = keys.filter(key => 
    typeof firstItem[key] === "number" && !key.includes("id")
  );

  if (labelKeys.length > 0) config.xAxis = labelKeys[0];
  if (valueKeys.length > 0) config.yAxis = valueKeys[0];

  // Chart-specific configurations
  switch (chartType) {
    case "scatter_plot":
      config.chartSpecific = {
        size: valueKeys.find(key => key.includes("size")) || valueKeys[2] || "size"
      };
      break;
    case "radar_chart":
      config.chartSpecific = {
        polarAngleAxis: labelKeys[0] || "subject",
        polarRadiusAxis: valueKeys[0] || "value"
      };
      break;
    case "gauge_chart":
      const values = data.map(d => Number(d.value) || 0).filter(v => v > 0);
      config.chartSpecific = {
        min: 0,
        max: Math.max(...values) * 1.2,
        gaugeTarget: Math.max(...values) * 0.8
      };
      break;
    case "heatmap":
      config.chartSpecific = {
        intensity: valueKeys[0] || "value"
      };
      break;
  }

  return config;
}

function ChartLoadingFallback() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 shadow-xl h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function ChartManager({ dashboard }: ChartManagerProps) {
  // Auto-detect chart type if not specified or optimize existing type
  const optimalType = detectOptimalChartType(dashboard.data);
  const chartType = dashboard.type === "text" || !dashboard.type ? optimalType : dashboard.type;
  
  // Auto-enhance configuration
  const enhancedConfig = {
    ...detectChartConfig(dashboard.data, chartType),
    ...dashboard.config
  };

  const enhancedDashboard = {
    ...dashboard,
    type: chartType,
    config: enhancedConfig
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar_chart":
        return <BarChartRenderer dashboard={enhancedDashboard} />;
      case "pie_chart":
        return <PieChartRenderer dashboard={enhancedDashboard} />;
      case "line_chart":
        return <LineChartRenderer dashboard={enhancedDashboard} />;
      case "area_chart":
        return <AreaChartRenderer dashboard={enhancedDashboard} />;
      case "scatter_plot":
        return <ScatterPlotRenderer dashboard={enhancedDashboard} />;
      case "radar_chart":
        return <RadarChartRenderer dashboard={enhancedDashboard} />;
      case "treemap":
        return <TreemapRenderer dashboard={enhancedDashboard} />;
      case "heatmap":
        return <HeatmapRenderer dashboard={enhancedDashboard} />;
      case "gauge_chart":
        return <GaugeChartRenderer dashboard={enhancedDashboard} />;
      case "funnel_chart":
        return <FunnelChartRenderer dashboard={enhancedDashboard} />;
      case "analytics_summary":
        return <AnalyticsSummaryRenderer dashboard={enhancedDashboard} />;
      default:
        return <AnalyticsSummaryRenderer dashboard={enhancedDashboard} />;
    }
  };

  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      {renderChart()}
    </Suspense>
  );
}