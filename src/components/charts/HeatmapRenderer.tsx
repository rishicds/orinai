"use client";

import { motion } from "framer-motion";
import type { DashboardOutput } from "@/types";

const COLORS = ["#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6", "#facc15", "#ef4444"];

interface HeatmapRendererProps {
  dashboard: DashboardOutput;
}

function HeatmapRenderer({ dashboard }: HeatmapRendererProps) {
  // Transform data into grid format for heatmap
  const gridSize = Math.ceil(Math.sqrt(dashboard.data.length));
  const maxValue = Math.max(...dashboard.data.map(d => d.value || 0));
  const minValue = Math.min(...dashboard.data.map(d => d.value || 0));

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    const intensity = Math.max(0.2, normalized);
    return `rgba(14, 165, 233, ${intensity})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white">{dashboard.title}</h2>
      {dashboard.summary && (
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">{dashboard.summary}</p>
      )}

      <div className="mt-8 h-[360px] w-full flex items-center justify-center">
        <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {dashboard.data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="w-12 h-12 rounded flex items-center justify-center text-xs font-semibold text-white border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: getColor(item.value || 0) }}
              title={`${item.label || `Item ${index + 1}`}: ${item.value}`}
            >
              {item.value}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getColor(minValue) }}></div>
          <span>Min: {minValue}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getColor(maxValue) }}></div>
          <span>Max: {maxValue}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default HeatmapRenderer;