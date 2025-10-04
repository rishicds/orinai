"use client";

import { useEffect, useState } from "react";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  description?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
}

export function ProgressIndicator({ steps, className = "" }: ProgressIndicatorProps) {
  const [visibleSteps, setVisibleSteps] = useState<ProgressStep[]>([]);

  useEffect(() => {
    // Animate steps appearing one by one
    steps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleSteps(prev => {
          const existing = prev.find(p => p.id === step.id);
          if (existing) {
            return prev.map(p => p.id === step.id ? step : p);
          }
          return [...prev, step];
        });
      }, index * 200);
    });
  }, [steps]);

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleSteps.map((step) => (
        <div
          key={step.id}
          className={`flex items-start gap-3 transition-all duration-300 ${
            step.status === "active" ? "animate-pulse" : ""
          }`}
        >
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            {step.status === "pending" && (
              <div className="w-4 h-4 rounded-full border-2 border-slate-600 bg-slate-800"></div>
            )}
            {step.status === "active" && (
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-400/20 relative">
                <div className="absolute inset-1 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute inset-1 bg-blue-400 rounded-full"></div>
              </div>
            )}
            {step.status === "completed" && (
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {step.status === "error" && (
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium transition-colors ${
              step.status === "active" ? "text-blue-400" :
              step.status === "completed" ? "text-green-400" :
              step.status === "error" ? "text-red-400" :
              "text-slate-500"
            }`}>
              {step.label}
            </div>
            {step.description && (
              <div className="text-xs text-slate-400 mt-1">{step.description}</div>
            )}
          </div>

          {/* Loading Animation for Active Step */}
          {step.status === "active" && (
            <div className="flex-shrink-0">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface FullscreenProgressProps {
  isOpen: boolean;
  onClose: () => void;
  steps: ProgressStep[];
  title: string;
  subtitle?: string;
}

export function FullscreenProgress({ 
  isOpen, 
  onClose, 
  steps, 
  title, 
  subtitle 
}: FullscreenProgressProps) {
  if (!isOpen) return null;

  const hasError = steps.some(step => step.status === "error");
  const allCompleted = steps.every(step => step.status === "completed");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        {/* Progress Steps */}
        <ProgressIndicator steps={steps} className="mb-8" />

        {/* Status Message */}
        <div className="text-center mb-6">
          {hasError && (
            <p className="text-red-400 text-sm">
              An error occurred during processing. Please try again.
            </p>
          )}
          {allCompleted && !hasError && (
            <p className="text-green-400 text-sm">
              Content generated successfully!
            </p>
          )}
          {!hasError && !allCompleted && (
            <p className="text-blue-400 text-sm">
              Generating your content...
            </p>
          )}
        </div>

        {/* Close Button */}
        {(hasError || allCompleted) && (
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {hasError ? "Try Again" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}