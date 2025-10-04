"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardOutput } from "@/types";

interface AreaChartRendererProps {
  dashboard: DashboardOutput;
}

function AreaChartRenderer({ dashboard }: AreaChartRendererProps) {
  const xKey = dashboard.config?.xAxis ?? "label";
  const yKey = dashboard.config?.yAxis ?? "value";
  const showGrid = dashboard.config?.gridLines ?? true;

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
          <AreaChart data={dashboard.data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />}
            <XAxis dataKey={xKey} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                border: "1px solid #1e293b",
                color: "#e2e8f0",
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke="#8b5cf6" 
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default AreaChartRenderer;