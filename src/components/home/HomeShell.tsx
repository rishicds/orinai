"use client";

import { Suspense, useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import type { DashboardOutput } from "@/types";

interface HomeShellProps {
  isAuthenticated: boolean;
}

export function HomeShell({ isAuthenticated }: HomeShellProps) {
  const [dashboard, setDashboard] = useState<DashboardOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubsectionRequest = (topic: string) => {
    console.log('Subsection requested:', topic);
    // This will trigger a new dashboard generation for the subsection
    setIsLoading(true);
    // The ChatInterface should handle this request and update the dashboard
  };

  const handleDashboardGenerated = (newDashboard: DashboardOutput | null) => {
    setDashboard(newDashboard);
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex w-full flex-col gap-12">
        {/* Main CTA Section */}
        <div className="flex w-full flex-col items-center gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-white">
              Transform Your Data Into Stories
            </h2>
            <p className="max-w-2xl text-lg text-slate-300">
              Turn natural language questions into beautiful, interactive dashboards. 
              No coding required—just ask, and watch your data come to life.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="rounded-xl border border-slate-600 px-8 py-4 text-base font-semibold text-slate-100 transition hover:border-blue-500 hover:bg-slate-800/50"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Natural Language Queries</h3>
            <p className="text-sm text-slate-400">
              Ask questions in plain English. &ldquo;Show me sales trends&rdquo; becomes a beautiful chart instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Live Dashboards</h3>
            <p className="text-sm text-slate-400">
              Watch your UI transform in real-time with interactive charts, tables, and insights.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
              <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
            <p className="text-sm text-slate-400">
              Powered by advanced LLMs to understand context and generate meaningful visualizations.
            </p>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">See It In Action</h3>
            <p className="text-slate-400">Here&apos;s what you can build with just a simple question</p>
          </div>
          
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <span className="text-sm font-semibold text-white">You</span>
              </div>
              <div className="rounded-lg bg-blue-500/20 px-4 py-2 text-blue-100">
                &ldquo;Show me our quarterly sales performance with top products&rdquo;
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                <span className="text-sm font-semibold text-white">AI</span>
              </div>
              <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="mb-2 text-sm text-slate-300">✨ Generated interactive dashboard with:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>📊 Quarterly revenue chart</div>
                  <div>📈 Growth trend analysis</div>
                  <div>🏆 Top performing products</div>
                  <div>📋 Summary insights table</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <p className="mb-6 text-slate-400">
            Join thousands of users transforming their data workflows
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
          >
            Start Building Your Dashboard
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] w-full gap-6">
      {/* Left Panel - Chat Interface */}
      <div className="w-96 flex-shrink-0">
        <ChatInterface onDashboardGenerated={handleDashboardGenerated} />
      </div>
      
      {/* Right Panel - Wiki Content */}
      <div className="flex-1 overflow-hidden">
        {dashboard ? (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Generating wiki content...</div>}>
            <DashboardRenderer 
              dashboard={dashboard} 
              isLoading={isLoading}
              onSubsectionRequest={handleSubsectionRequest}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Wiki Generator Ready</h3>
                <p className="text-slate-400 text-sm max-w-md">Ask any question to generate a comprehensive wiki-style article with multiple sources and insights.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
