"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import type { DashboardOutput } from "@/types";

interface LineChartRendererProps {
  dashboard: DashboardOutput;
}

function LineChartRenderer({ dashboard }: LineChartRendererProps) {
  const xKey = dashboard.config?.xAxis ?? "label";
  const yKey = dashboard.config?.yAxis ?? "value";
  const showBrush = dashboard.config?.brush ?? false;
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
          <LineChart data={dashboard.data}>
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
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#0ea5e9", strokeWidth: 2, fill: "#ffffff" }}
            />
            {showBrush && <Brush dataKey={xKey} height={30} stroke="#8884d8" />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default LineChartRenderer;