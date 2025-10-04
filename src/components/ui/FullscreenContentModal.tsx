"use client";

import { useEffect, useState } from "react";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { useTheme } from "@/components/ui/ThemeToggle";
import type { DashboardOutput } from "@/types";

interface FullscreenContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: DashboardOutput | null;
  isLoading: boolean;
  onSubsectionRequest: (topic: string) => void;
}

export function FullscreenContentModal({ 
  isOpen, 
  onClose, 
  dashboard, 
  isLoading, 
  onSubsectionRequest 
}: FullscreenContentModalProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Allow animation to complete
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isVisible ? "animate-in fade-in duration-200" : "animate-out fade-out duration-200"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={`relative z-10 h-full w-full ${theme === "dark" ? "dark" : ""}`}>
        <div className="h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Generated Analysis</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400">AI-Powered Research</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 text-slate-700 dark:text-slate-200 transition hover:border-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">
              {dashboard ? (
                <DashboardRenderer 
                  dashboard={dashboard} 
                  isLoading={isLoading}
                  onSubsectionRequest={onSubsectionRequest}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
                        The generated content will appear here once processing is complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}