"use client";

import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DashboardOutput } from "@/types";

const COLORS = ["#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6", "#facc15", "#ef4444"];

interface ScatterPlotRendererProps {
  dashboard: DashboardOutput;
}

function ScatterPlotRenderer({ dashboard }: ScatterPlotRendererProps) {
  const xKey = dashboard.config?.xAxis ?? "x";
  const yKey = dashboard.config?.yAxis ?? "y";
  const sizeKey = dashboard.config?.chartSpecific?.size ?? "size";

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
          <ScatterChart data={dashboard.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              type="number" 
              dataKey={xKey} 
              stroke="#94a3b8" 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              type="number" 
              dataKey={yKey} 
              stroke="#94a3b8" 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                border: "1px solid #1e293b",
                color: "#e2e8f0",
              }}
            />
            <Scatter dataKey={sizeKey} fill="#0ea5e9">
              {dashboard.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default ScatterPlotRenderer;