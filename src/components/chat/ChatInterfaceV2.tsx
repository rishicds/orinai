"use client";

import { useCallback, useState, useEffect } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { 
  RiRobot2Line, 
  RiDeleteBin7Line, 
  RiWifiLine, 
  RiSparklingLine, 
  RiRocketLine, 
  RiBrainLine, 
  RiGlobalLine,
  RiSave3Line
} from "react-icons/ri";
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
          const formattedMessages: ChatMessage[] = data.messages.map((msg: { 
            role: string; 
            content: string; 
            timestamp?: string;
            dashboardData?: string;
            $id?: string;
            id?: string;
            createdAt?: string;
          }) => {
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

  // Add event listener for subsection requests
  useEffect(() => {
    const handleTriggerChatMessage = (event: CustomEvent<{ message: string }>) => {
      const message = event.detail.message;
      if (message && !isLoading) {
        setInput(message);
        // Auto-submit the message after a short delay
        setTimeout(() => {
          const form = document.querySelector('form[data-chat-form]') as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }, 100);
      }
    };

    window.addEventListener('triggerChatMessage', handleTriggerChatMessage as EventListener);
    
    return () => {
      window.removeEventListener('triggerChatMessage', handleTriggerChatMessage as EventListener);
    };
  }, [isLoading]);

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
  }, [input, isLoading, onDashboardGenerated, initializeProgressSteps, simulateProgressSteps, currentUser, currentSessionId, onSessionCreated]);

  const handleSampleClick = useCallback((query: string) => {
    setInput(query);
  }, []);

  const handleDashboardClick = useCallback((dashboard: DashboardOutput) => {
    onDashboardGenerated(dashboard);
  }, [onDashboardGenerated]);

  return (
    <div className="h-full flex flex-col rounded-3xl backdrop-blur-xl border border-white/20"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
      }}>
      {/* Chat Header */}
      <div className="p-6 border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)'
        }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-3"
              style={{ 
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                letterSpacing: '0.02em'
              }}>
              <RiRobot2Line className="text-2xl text-purple-600" />
              AI Research Assistant
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium leading-relaxed"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
              }}>
              Comprehensive analysis powered by <span className="text-purple-600 font-bold">multiple AI services</span>
              {currentUser && (
                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-bold gap-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                    color: '#059669',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  <RiSave3Line className="text-xs" />
                  Auto-saved
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={clearChatHistory}
                className="text-sm font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  color: '#dc2626',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(239, 68, 68, 0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}
                title="Clear chat history"
              >
                <RiDeleteBin7Line className="text-base" />
                Clear
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
              }}>
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"
                style={{
                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                }}></div>
              <span className="text-sm text-green-700 font-bold"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-3 border-purple-300/50 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                <RiSparklingLine className="text-xl text-purple-600" />
                Loading your conversations...
              </p>
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
              <div className="rounded-2xl p-6 border border-white/20"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.1)'
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 border-2 border-purple-300/50 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                    }}>
                    <RiRocketLine className="text-xl text-purple-600" />
                    Processing your request...
                  </span>
                </div>
                <ProgressIndicator steps={progressSteps} className="text-sm" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sample Queries */}
      {messages.length === 1 && !isLoading && !isLoadingHistory && (
        <div className="p-6 border-t border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
          <p className="text-sm font-black uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '0.1em'
            }}>
            <RiSparklingLine className="text-base text-purple-600" style={{ WebkitTextFillColor: '#8b5cf6' }} />
            Try These Examples
          </p>
          <div className="grid grid-cols-1 gap-3">
            {sampleQueries.map((query, index) => (
              <button
                key={query}
                onClick={() => handleSampleClick(query)}
                className="text-left rounded-2xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] transform group"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg text-purple-600">
                    {index === 0 && <RiBrainLine />}
                    {index === 1 && <RiGlobalLine />}
                    {index === 2 && <RiRobot2Line />}
                    {index === 3 && <RiRocketLine />}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors"
                    style={{ 
                      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                    }}>
                    {query}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-6 border-t border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
        <form onSubmit={handleSubmit} data-chat-form className="flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-2xl px-6 py-4 text-base font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none transition-all duration-300 focus:scale-[1.02]"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 0 rgba(255,255,255,0.8), 0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
            }}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 transform disabled:opacity-50 disabled:scale-100"
            style={{
              background: isLoading || !input.trim() 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: isLoading || !input.trim() 
                ? 'inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '0.02em'
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RiRocketLine className="text-lg" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RiSparklingLine className="text-lg" />
                Generate
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}