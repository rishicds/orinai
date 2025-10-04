"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardOutput } from "@/types";

interface RadarChartRendererProps {
  dashboard: DashboardOutput;
}

function RadarChartRenderer({ dashboard }: RadarChartRendererProps) {
  const angleKey = dashboard.config?.chartSpecific?.polarAngleAxis ?? "subject";
  const radiusKey = dashboard.config?.chartSpecific?.polarRadiusAxis ?? "value";

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

      <div className="mt-8 h-[360px] w-full">
        <ResponsiveContainer>
          <RadarChart data={dashboard.data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey={angleKey} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar
              name={dashboard.title}
              dataKey={radiusKey}
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default RadarChartRenderer;