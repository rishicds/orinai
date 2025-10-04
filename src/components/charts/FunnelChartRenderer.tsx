"use client";

import { motion } from "framer-motion";
import type { DashboardOutput } from "@/types";

interface FunnelChartRendererProps {
  dashboard: DashboardOutput;
}

function FunnelChartRenderer({ dashboard }: FunnelChartRendererProps) {
  const maxValue = Math.max(...dashboard.data.map(d => d.value || 0));
  
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
        <div className="relative w-full max-w-md">
          {dashboard.data.map((item, index) => {
            const widthPercentage = ((item.value || 0) / maxValue) * 100;
            const colors = ["#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6", "#facc15", "#ef4444"];
            const color = colors[index % colors.length];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative mb-2 flex items-center"
                style={{ height: '48px' }}
              >
                <div
                  className="relative rounded-r-lg flex items-center justify-between px-4 py-3 transition-all hover:brightness-110"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: color,
                    minWidth: '120px'
                  }}
                >
                  <span className="text-white font-semibold text-sm truncate">
                    {item.label}
                  </span>
                  <span className="text-white/90 text-sm ml-2">
                    {item.value}
                  </span>
                </div>
                
                {/* Conversion rate indicator */}
                {index > 0 && (
                  <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                    {(((item.value || 0) / (dashboard.data[index - 1]?.value || 1)) * 100).toFixed(1)}%
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-slate-400">
        Conversion rates shown on the right
      </div>
    </motion.div>
  );
}

export default FunnelChartRenderer;