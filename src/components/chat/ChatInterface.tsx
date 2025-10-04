"use client";

import { useCallback, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ProgressIndicator, FullscreenProgress } from "@/components/ui/ProgressIndicator";
import type { DashboardOutput } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onDashboardGenerated: (dashboard: DashboardOutput) => void;
}

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  description?: string;
}

export function ChatInterface({ onDashboardGenerated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "intro",
    role: "assistant",
    content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFullscreenProgress, setShowFullscreenProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");

  const sampleQueries = [
    "Explain quantum computing in simple terms",
    "History and evolution of Formula 1 racing",
    "Complete guide to machine learning algorithms", 
    "Climate change: causes, effects, and solutions",
    "Cryptocurrency and blockchain technology explained",
    "Space exploration: past, present, and future",
    "Artificial intelligence ethics and implications",
    "Renewable energy technologies comparison"
  ];

  const initializeProgressSteps = useCallback((): ProgressStep[] => [
    {
      id: "classify",
      label: "Analyzing Query",
      status: "pending",
      description: "Understanding your request and determining the best approach"
    },
    {
      id: "research",
      label: "Researching Content",
      status: "pending", 
      description: "Gathering information from multiple AI services"
    },
    {
      id: "retrieve",
      label: "Processing Data",
      status: "pending",
      description: "Organizing and structuring the information"
    },
    {
      id: "generate",
      label: "Generating Content",
      status: "pending",
      description: "Creating comprehensive analysis and visualizations"
    },
    {
      id: "finalize",
      label: "Finalizing Results",
      status: "pending",
      description: "Preparing the final presentation"
    }
  ], []);

  const updateProgressStep = useCallback((stepId: string, status: ProgressStep["status"]) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  }, []);

  const simulateProgressSteps = useCallback(async () => {
    const stepIds = ["classify", "research", "retrieve", "generate", "finalize"];
    
    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i];
      updateProgressStep(stepId, "active");
      
      // Simulate processing time for each step
      const processingTime = stepId === "research" ? 2000 : 
                           stepId === "generate" ? 3000 : 1500;
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      updateProgressStep(stepId, "completed");
    }
  }, [updateProgressStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setCurrentQuery(input);
    setInput("");
    setIsLoading(true);

    // Initialize progress steps
    const steps = initializeProgressSteps();
    setProgressSteps(steps);
    setShowFullscreenProgress(true);

    try {
      // Start progress simulation
      const progressPromise = simulateProgressSteps();
      
      // Make the actual API call
      const apiPromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content })
      });

      // Wait for both to complete
      const [, res] = await Promise.all([progressPromise, apiPromise]);

      if (!res.ok) {
        throw new Error(`Failed to generate: ${res.statusText}`);
      }

      const dashboard = await res.json();
      
      // Mark all steps as completed
      setProgressSteps(prev => prev.map(step => ({ ...step, status: "completed" as const })));
      
      // Show success message and close progress after a brief delay
      setTimeout(() => {
        setShowFullscreenProgress(false);
        onDashboardGenerated(dashboard);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: dashboard.summary || "Comprehensive analysis generated successfully!" 
        }]);
      }, 1000);

    } catch (error) {
      console.error("Generation error:", error);
      
      // Mark current step as error
      setProgressSteps(prev => {
        const activeStep = prev.find(step => step.status === "active");
        if (activeStep) {
          return prev.map(step => 
            step.id === activeStep.id ? { ...step, status: "error" as const } : step
          );
        }
        return prev.map(step => ({ ...step, status: "error" as const }));
      });

      setTimeout(() => {
        setShowFullscreenProgress(false);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: "I encountered an error while generating your content. Please check your API configurations and try again." 
        }]);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onDashboardGenerated, initializeProgressSteps, simulateProgressSteps]);

  const handleSampleClick = useCallback((query: string) => {
    setInput(query);
  }, []);

  return (
    <>
      <div className="h-full flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AI Research Assistant</h2>
              <p className="text-xs text-slate-400 mt-1">Comprehensive analysis powered by multiple AI services</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-slate-400">AI Services Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} role={msg.role}>{msg.content}</MessageBubble>
          ))}
          {isLoading && !showFullscreenProgress && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                Processing your request...
              </div>
              <ProgressIndicator steps={progressSteps} className="text-sm" />
            </div>
          )}
        </div>

        {/* Sample Queries */}
        {messages.length === 1 && !isLoading && (
          <div className="p-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-medium">Try these professional examples:</p>
            <div className="grid grid-cols-1 gap-2">
              {sampleQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSampleClick(query)}
                  className="w-full text-left rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 px-3 py-2 text-sm text-slate-300 hover:text-blue-300 transition-all duration-200"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about anything for comprehensive analysis..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-2 text-sm font-medium text-white transition-colors"
            >
              {isLoading ? "Processing..." : "Generate"}
            </button>
          </form>
        </div>
      </div>

      {/* Fullscreen Progress Modal */}
      <FullscreenProgress
        isOpen={showFullscreenProgress}
        onClose={() => setShowFullscreenProgress(false)}
        steps={progressSteps}
        title={`Generating Analysis`}
        subtitle={currentQuery ? `"${currentQuery}"` : ""}
      />
    </>
  );
}
