"use client";

import { useCallback, useState, useEffect } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import type { DashboardOutput } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  $id?: string;
  createdAt?: string;
  dashboardData?: DashboardOutput;
}

interface ChatInterfaceV2Props {
  onDashboardGenerated: (dashboard: DashboardOutput) => void;
  onUserAuthenticated?: (user: { id: string } | null) => void;
  initialMessages?: ChatMessage[];
  sessionId?: string | null;
  onSessionCreated?: (sessionId: string) => void;
}

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  description?: string;
}

export function ChatInterfaceV2({ onDashboardGenerated, onUserAuthenticated, initialMessages, sessionId, onSessionCreated }: ChatInterfaceV2Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  const sampleQueries = [
    "Explain quantum computing in simple terms",
    "Climate change: causes, effects, and solutions",
    "Artificial intelligence ethics and implications",
    "Space exploration: past, present, and future"
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

  const loadChatHistory = useCallback(async () => {
    // If initialMessages are provided, use them instead of loading from API
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      setIsLoadingHistory(false);
      // Still need to get user info for authentication
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          const user = { id: data.userId };
          setCurrentUser(user);
          onUserAuthenticated?.(user);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
      return;
    }

    // If initialMessages is explicitly undefined (new chat), show welcome message and get user info
    if (initialMessages === undefined) {
      setIsLoadingHistory(true);
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          const user = { id: data.userId };
          setCurrentUser(user);
          onUserAuthenticated?.(user);
          setMessages([{
            id: "intro",
            role: "assistant",
            content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
          }]);
        } else if (response.status === 401) {
          // User not authenticated, show welcome message
          setCurrentUser(null);
          onUserAuthenticated?.(null);
          setMessages([{
            id: "intro",
            role: "assistant",
            content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic. Please sign in to save your chat history."
          }]);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
        setMessages([{
          id: "intro",
          role: "assistant",
          content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
      return;
    }

    // Default behavior: load chat history from API (first load)
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data = await response.json();
        const user = { id: data.userId };
        setCurrentUser(user);
        onUserAuthenticated?.(user);
        
        if (data.messages && data.messages.length > 0) {
          const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => {
            let dashboardData = undefined;
            if (msg.dashboardData) {
              try {
                dashboardData = JSON.parse(msg.dashboardData);
                console.log("Loaded dashboard data for message:", msg.$id, dashboardData);
              } catch (error) {
                console.error("Failed to parse dashboard data:", error);
              }
            }
            return {
              id: msg.$id || msg.id,
              role: msg.role,
              content: msg.content,
              $id: msg.$id,
              createdAt: msg.createdAt,
              dashboardData,
            };
          });
          console.log("Formatted messages with dashboard data:", formattedMessages);
          setMessages(formattedMessages);
        } else {
          // Show welcome message if no chat history
          setMessages([{
            id: "intro",
            role: "assistant",
            content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
          }]);
        }
      } else if (response.status === 401) {
        // User not authenticated, show welcome message
        setCurrentUser(null);
        onUserAuthenticated?.(null);
        setMessages([{
          id: "intro",
          role: "assistant",
          content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic. Please sign in to save your chat history."
        }]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setMessages([{
        id: "intro",
        role: "assistant",
        content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [initialMessages, onUserAuthenticated]);

  const saveChatMessage = useCallback(async (message: ChatMessage) => {
    if (!currentUser || !currentSessionId) {
      console.log("Cannot save message - missing user or session:", { currentUser: !!currentUser, currentSessionId });
      return;
    }
    
    console.log("Saving message to session:", currentSessionId, message);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: message.role, 
          content: message.content,
          sessionId: currentSessionId,
          dashboardData: message.dashboardData ? JSON.stringify(message.dashboardData) : undefined
        })
      });
      
      if (response.ok) {
        const savedMessage = await response.json();
        console.log("Message saved successfully:", savedMessage);
      } else {
        console.error("Failed to save message - server error:", response.status);
      }
    } catch (error) {
      console.error("Failed to save chat message:", error);
    }
  }, [currentUser, currentSessionId]);

  const clearChatHistory = useCallback(async () => {
    if (!currentUser || !confirm("Are you sure you want to clear your chat history?")) return;
    
    try {
      const response = await fetch("/api/chat", {
        method: "DELETE"
      });
      
      if (response.ok) {
        setMessages([{
          id: "intro",
          role: "assistant",
          content: "Hi! Ask me to create a comprehensive analysis or visualization on any topic."
        }]);
      }
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    setCurrentSessionId(sessionId || null);
  }, [sessionId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    console.log("[ChatInterface] Submitting query:", input.substring(0, 100));
    
    // Validate query length
    if (input.length > 1000) {
      const errorMsg: ChatMessage = { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: "Your query is too long. Please keep it under 1000 characters." 
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Generate a session ID if we don't have one (new chat)
    let activeSessionId = currentSessionId;
    if (!activeSessionId && currentUser) {
      activeSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("Creating new session:", activeSessionId);
      setCurrentSessionId(activeSessionId);
      onSessionCreated?.(activeSessionId);
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message if user is authenticated
    if (currentUser && activeSessionId) {
      console.log("Saving user message to session:", activeSessionId);
      // Create a temporary save function that uses activeSessionId directly
      const saveMessageWithSessionId = async (message: ChatMessage) => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              role: message.role, 
              content: message.content,
              sessionId: activeSessionId
            })
          });
          
          if (response.ok) {
            const savedMessage = await response.json();
            console.log("User message saved successfully:", savedMessage);
          } else {
            console.error("Failed to save user message - server error:", response.status);
          }
        } catch (error) {
          console.error("Failed to save user message:", error);
        }
      };
      
      saveMessageWithSessionId(userMsg);
    }

    // Initialize progress steps
    const steps = initializeProgressSteps();
    setProgressSteps(steps);

    try {
      // Start progress simulation
      const progressPromise = simulateProgressSteps();
      
      // Make the actual API call with memory enabled
      console.log("[ChatInterface] Making API call to /api/generate");
      const apiPromise = fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          query: userMsg.content,
          useMemory: !!currentUser // Enable memory for authenticated users
        })
      });

      // Wait for both to complete
      const [, res] = await Promise.all([progressPromise, apiPromise]);

      if (!res.ok) {
        let errorMessage = `Failed to generate: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = `Generation failed: ${errorData.error}`;
          }
        } catch (parseError) {
          // Fallback to status text if can't parse error response
          console.warn("Could not parse error response:", parseError);
        }
        
        // Log the error for debugging
        console.error("API request failed:", { 
          status: res.status, 
          statusText: res.statusText, 
          errorMessage 
        });
        
        // Don't throw, instead handle the error gracefully
        const errorMsg: ChatMessage = { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: `I encountered an error: ${errorMessage}. Please try again.` 
        };
        setMessages(prev => [...prev, errorMsg]);
        
        // Mark progress as error
        setProgressSteps(prev => prev.map(step => ({ ...step, status: "error" as const })));
        
        // Save error message if user is authenticated
        if (currentUser && activeSessionId) {
          try {
            await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                role: errorMsg.role, 
                content: errorMsg.content,
                sessionId: activeSessionId
              })
            });
          } catch (saveError) {
            console.error("Failed to save error message:", saveError);
          }
        }
        
        return; // Exit early instead of throwing
      }

      const dashboard = await res.json();
      
      // Mark all steps as completed
      setProgressSteps(prev => prev.map(step => ({ ...step, status: "completed" as const })));
      
      // Check if this is a memory-based response
      if (dashboard.isFromMemory) {
        // For memory responses, just show the answer directly without dashboard
        setTimeout(() => {
          const assistantMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: "assistant", 
            content: dashboard.summary || "Here's what I remember about that topic."
          };
          setMessages(prev => [...prev, assistantMsg]);
          
          // Save assistant message if user is authenticated
          if (currentUser && activeSessionId) {
            console.log("Saving memory-based response to session:", activeSessionId);
            const saveAssistantMessage = async (message: ChatMessage) => {
              try {
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    role: message.role, 
                    content: message.content,
                    sessionId: activeSessionId
                  })
                });
                
                if (response.ok) {
                  console.log("Memory-based response saved successfully");
                } else {
                  console.error("Failed to save memory-based response");
                }
              } catch (error) {
                console.error("Failed to save memory-based response:", error);
              }
            };
            
            saveAssistantMessage(assistantMsg);
          }
          
          setProgressSteps([]);
        }, 1000);
      } else {
        // Show success and generate dashboard for new content
        setTimeout(() => {
          onDashboardGenerated(dashboard);
          const assistantMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: "assistant", 
            content: dashboard.summary || "Comprehensive analysis generated successfully!",
            dashboardData: dashboard
          };
          setMessages(prev => [...prev, assistantMsg]);
          
          // Save assistant message if user is authenticated - use activeSessionId to ensure we have the current session
          if (currentUser && activeSessionId) {
            console.log("Saving assistant message to session:", activeSessionId);
            // Create a temporary save function that uses activeSessionId directly
            const saveAssistantMessage = async (message: ChatMessage) => {
              try {
                let dashboardDataJson = message.dashboardData ? JSON.stringify(message.dashboardData) : undefined;
                
                // Check if dashboard data is too large for database (10000 char limit)
                if (dashboardDataJson && dashboardDataJson.length > 9500 && message.dashboardData) {
                  console.warn("Dashboard data too large, creating compact version");
                  // Create a compact version with essential data only
                  const compactDashboard = {
                    type: message.dashboardData.type,
                    title: message.dashboardData.title,
                    summary: message.dashboardData.summary,
                    data: message.dashboardData.data?.slice(0, 10), // Limit data points
                    config: message.dashboardData.config,
                  };
                  dashboardDataJson = JSON.stringify(compactDashboard);
                }
                
                console.log("Saving assistant message with dashboard data:", {
                  role: message.role,
                  content: message.content.substring(0, 100) + "...",
                  sessionId: activeSessionId,
                  hasDashboardData: !!dashboardDataJson,
                  dashboardDataSize: dashboardDataJson ? dashboardDataJson.length : 0
                });
                
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    role: message.role, 
                    content: message.content,
                    sessionId: activeSessionId,
                    dashboardData: dashboardDataJson
                  })
                });
                
                if (response.ok) {
                  const savedMessage = await response.json();
                  console.log("Assistant message saved successfully:", savedMessage);
                } else {
                  console.error("Failed to save assistant message - server error:", response.status);
                }
              } catch (error) {
                console.error("Failed to save assistant message:", error);
              }
            };
            
            saveAssistantMessage(assistantMsg);
          }
          
          setProgressSteps([]);
        }, 1000);
      }

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
        const errorMsg: ChatMessage = { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: "I encountered an error while generating your content. Please check your API configurations and try again." 
        };
        setMessages(prev => [...prev, errorMsg]);
        
        // Save error message if user is authenticated
        if (currentUser && activeSessionId) {
          try {
            const saveErrorMessage = async (message: ChatMessage) => {
              try {
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    role: message.role, 
                    content: message.content,
                    sessionId: activeSessionId
                  })
                });
                
                if (response.ok) {
                  console.log("Error message saved successfully");
                } else {
                  console.error("Failed to save error message");
                }
              } catch (error) {
                console.error("Failed to save error message:", error);
              }
            };
            
            saveErrorMessage(errorMsg);
          } catch (saveError) {
            console.error("Failed to save error message:", saveError);
          }
        }
        
        setProgressSteps([]);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onDashboardGenerated, initializeProgressSteps, simulateProgressSteps, currentUser, currentSessionId, saveChatMessage, onSessionCreated]);

  const handleSampleClick = useCallback((query: string) => {
    setInput(query);
  }, []);

  const handleDashboardClick = useCallback((dashboard: DashboardOutput) => {
    onDashboardGenerated(dashboard);
  }, [onDashboardGenerated]);

  return (
    <div className="h-full flex flex-col bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Research Assistant</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive analysis powered by multiple AI services
              {currentUser && " • Chat history saved"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={clearChatHistory}
                className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                title="Clear chat history"
              >
                Clear History
              </button>
            )}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">AI Services Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
              Loading chat history...
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                role={msg.role}
                dashboardData={msg.dashboardData}
                onDashboardClick={handleDashboardClick}
              >
                {msg.content}
              </MessageBubble>
            ))}
            {isLoading && (
              <div className="bg-slate-200 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-3">
                  <div className="w-4 h-4 border-2 border-blue-600/30 dark:border-blue-400/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  Processing your request...
                </div>
                <ProgressIndicator steps={progressSteps} className="text-sm" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sample Queries */}
      {messages.length === 1 && !isLoading && !isLoadingHistory && (
        <div className="p-4 border-t border-slate-300 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 uppercase tracking-wide font-medium">Try these examples:</p>
          <div className="grid grid-cols-1 gap-2">
            {sampleQueries.map((query) => (
              <button
                key={query}
                onClick={() => handleSampleClick(query)}
                className="text-left rounded-lg bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/50 hover:border-blue-500 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-slate-300 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about anything..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-600 dark:disabled:text-slate-500 px-6 py-2 text-sm font-medium text-white transition-colors"
          >
            {isLoading ? "Processing..." : "Generate"}
          </button>
        </form>
      </div>
    </div>
  );
}