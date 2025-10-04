"use client";

import clsx from "clsx";
import { ReactNode } from "react";
import type { DashboardOutput } from "@/types";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  children: ReactNode;
  dashboardData?: DashboardOutput;
  onDashboardClick?: (dashboard: DashboardOutput) => void;
}

export function MessageBubble({ role, children, dashboardData, onDashboardClick }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "rounded-2xl px-5 py-3 text-sm shadow-md border max-w-[85%] sm:max-w-[75%]",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-blue-500/20"
            : "bg-slate-100 dark:bg-slate-800/60 backdrop-blur-sm text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700/50 shadow-slate-300/50 dark:shadow-slate-900/50"
        )}
      >
        {children}
        {dashboardData && role === "assistant" && (
          <div className="mt-3 pt-3 border-t border-slate-300/30 dark:border-slate-600/30">
            <button
              onClick={() => onDashboardClick?.(dashboardData)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 hover:border-blue-600/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
