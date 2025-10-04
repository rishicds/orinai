"use client";

import type { DashboardOutput } from "@/types";
import { WikiRenderer } from "./WikiRenderer";

interface DashboardRendererProps {
  dashboard: DashboardOutput | null;
  isLoading: boolean;
  onSubsectionRequest: (topic: string) => void;
}

export function DashboardRenderer({ dashboard, isLoading, onSubsectionRequest }: DashboardRendererProps) {
  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-700">Generating Interactive Wiki...</p>
              <p className="text-sm text-slate-500">
                Leveraging multiple AI services to create comprehensive content
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-800">Welcome to Interactive Wiki</h3>
              <p className="text-slate-600 leading-relaxed">
                Ask any question to generate a comprehensive, Wikipedia-style page with interactive features.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WikiRenderer 
      dashboard={dashboard} 
      onSubsectionRequest={onSubsectionRequest}
    />
  );
}
