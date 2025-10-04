"use client";

import type { DashboardOutput } from "@/types";
import { WikiRenderer } from "./WikiRenderer";
import { generateEnhancedSublinks } from "./SublinksPanel";

interface DashboardRendererProps {
  dashboard: DashboardOutput | null;
  isLoading: boolean;
  onSubsectionRequest: (topic: string) => void;
}

export function DashboardRenderer({ dashboard, isLoading, onSubsectionRequest }: DashboardRendererProps) {
  if (isLoading) {
    return (
      <div className="h-full rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
        }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-3 border-purple-300/50 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-3">
              <p className="text-xl font-black text-slate-900 dark:text-white"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                Generating Interactive Analysis...
              </p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                <p>🎯 Creating advanced visualizations</p>
                <p>🚀 Building interactive components</p>
                <p>📊 Generating comprehensive insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="h-full rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
        }}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center space-y-8 max-w-lg">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
              <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                Interactive Analysis Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                Generate comprehensive analysis with advanced visualizations and insights
              </p>
              <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2 font-medium">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Auto-detected chart types (15+ supported)
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Smart interactive components
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Real-time analytics and insights
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Optimized visualizations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auto-enhance dashboard with sublinks if not present
  const enhancedDashboard = {
    ...dashboard,
    sublinks: dashboard.sublinks || generateEnhancedSublinks(dashboard.title, dashboard.data)
  };

  return (
    <WikiRenderer 
      dashboard={enhancedDashboard} 
      onSubsectionRequest={onSubsectionRequest}
    />
  );
}
