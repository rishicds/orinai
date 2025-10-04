"use client";

import { motion } from "framer-motion";
import type { DashboardOutput, DashboardDataPoint } from "@/types";

const COLORS = ["#8b5cf6", "#0ea5e9", "#f97316", "#14b8a6", "#facc15", "#ef4444"];

interface TreemapRendererProps {
  dashboard: DashboardOutput;
}

interface TreemapCellProps {
  data: {
    name?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  index: number;
}

function TreemapCell({ data, x, y, width, height, color, index }: TreemapCellProps) {
  const canShowText = width > 60 && height > 40;
  const canShowValue = width > 80 && height > 60;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.8}
        stroke="#1e293b"
        strokeWidth={1}
        rx={4}
        className="hover:fill-opacity-100 transition-all cursor-pointer"
      />
      {canShowText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (canShowValue ? 8 : 0)}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {data.name || data.label}
        </text>
      )}
      {canShowValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="10"
          className="pointer-events-none"
        >
          {data.value}
        </text>
      )}
    </motion.g>
  );
}

function TreemapRenderer({ dashboard }: TreemapRendererProps) {
  // Simple treemap layout algorithm
  const calculateLayout = (data: DashboardDataPoint[], width: number, height: number) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    let x = 0;
    const y = 0;
    
    return data.map((item, index) => {
      const ratio = (item.value || 0) / total;
      const cellWidth = width * ratio;
      const cellHeight = height;
      
      const result = {
        ...item,
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        color: COLORS[index % COLORS.length],
        index
      };
      
      x += cellWidth;
      return result;
    });
  };

  const layoutData = calculateLayout(dashboard.data, 600, 300);

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
        <svg width="100%" height="300" viewBox="0 0 600 300">
          {layoutData.map((cell) => (
            <TreemapCell
              key={cell.index}
              data={cell}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              color={cell.color}
              index={cell.index}
            />
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

export default TreemapRenderer;