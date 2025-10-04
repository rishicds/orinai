"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardOutput } from "@/types";

const COLORS = ["#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6", "#facc15"];

interface PieChartRendererProps {
  dashboard: DashboardOutput;
}

function PieChartRenderer({ dashboard }: PieChartRendererProps) {
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
          <PieChart>
            <Pie
              data={dashboard.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={130}
              paddingAngle={4}
            >
              {dashboard.data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                border: "1px solid #1e293b",
                color: "#e2e8f0",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default PieChartRenderer;
