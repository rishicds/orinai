"use client";

import { motion } from "framer-motion";
import type { DashboardOutput } from "@/types";

interface AnalyticsSummaryRendererProps {
  dashboard: DashboardOutput;
}

function AnalyticsSummaryRenderer({ dashboard }: AnalyticsSummaryRendererProps) {
  const data = dashboard.data;
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const avgValue = totalValue / data.length;
  const maxItem = data.reduce((max, item) => (item.value || 0) > (max.value || 0) ? item : max, data[0]);
  const minItem = data.reduce((min, item) => (item.value || 0) < (min.value || 0) ? item : min, data[0]);

  const metrics = [
    { label: "Total", value: totalValue.toLocaleString(), color: "#0ea5e9", icon: "📊" },
    { label: "Average", value: avgValue.toFixed(2), color: "#8b5cf6", icon: "📈" },
    { label: "Highest", value: `${maxItem.label}: ${maxItem.value}`, color: "#14b8a6", icon: "🔝" },
    { label: "Lowest", value: `${minItem.label}: ${minItem.value}`, color: "#f97316", icon: "🔻" },
    { label: "Count", value: data.length.toString(), color: "#facc15", icon: "🔢" },
    { label: "Growth", value: data.length > 1 ? `${(((data[data.length - 1]?.value || 0) - (data[0]?.value || 0)) / (data[0]?.value || 1) * 100).toFixed(1)}%` : "N/A", color: "#ef4444", icon: "📊" }
  ];

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

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              ></div>
            </div>
            <div className="text-slate-400 text-sm font-medium">{metric.label}</div>
            <div 
              className="text-2xl font-bold mt-1"
              style={{ color: metric.color }}
            >
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini chart visualization */}
      <div className="mt-8 bg-slate-800/30 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Data Distribution</h3>
        <div className="flex items-end space-x-2 h-24">
          {data.slice(0, 10).map((item, index) => {
            const height = ((item.value || 0) / (maxItem.value || 1)) * 80;
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}px` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-blue-500 rounded-t min-w-[8px] flex-1 max-w-8"
                title={`${item.label}: ${item.value}`}
              ></motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default AnalyticsSummaryRenderer;