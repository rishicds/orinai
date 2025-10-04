"use client";

import { motion } from "framer-motion";
import type { DashboardOutput } from "@/types";

interface GaugeChartRendererProps {
  dashboard: DashboardOutput;
}

function GaugeChartRenderer({ dashboard }: GaugeChartRendererProps) {
  const value = dashboard.data[0]?.value || 0;
  const min = dashboard.config?.chartSpecific?.min || 0;
  const max = dashboard.config?.chartSpecific?.max || 100;
  const target = dashboard.config?.chartSpecific?.gaugeTarget;
  
  const percentage = ((value - min) / (max - min)) * 100;
  const targetPercentage = target ? ((target - min) / (max - min)) * 100 : null;
  
  const radius = 120;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const getColor = (percentage: number) => {
    if (percentage < 30) return "#ef4444";
    if (percentage < 70) return "#f97316";
    return "#14b8a6";
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
        <div className="relative">
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              stroke="#1e293b"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx="140"
              cy="140"
            />
            {/* Progress circle */}
            <motion.circle
              stroke={getColor(percentage)}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="140"
              cy="140"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Target indicator */}
            {targetPercentage && (
              <circle
                fill="#facc15"
                r="6"
                cx={140 + normalizedRadius * Math.cos(2 * Math.PI * (targetPercentage / 100) - Math.PI / 2)}
                cy={140 + normalizedRadius * Math.sin(2 * Math.PI * (targetPercentage / 100) - Math.PI / 2)}
              />
            )}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              className="text-4xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {value}
            </motion.div>
            <div className="text-sm text-slate-400">of {max}</div>
            <div className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-400">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Target: {target}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default GaugeChartRenderer;