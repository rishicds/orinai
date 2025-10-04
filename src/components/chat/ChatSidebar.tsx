"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  RiLockLine, 
  RiChatNewLine,
  RiMessageLine
} from "react-icons/ri";
import type { DashboardOutput } from "@/types";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  $id?: string;
  createdAt?: string;
  dashboardData?: DashboardOutput;
}

interface ChatSidebarProps {
  currentUser: { id: string } | null;
  onSessionSelect: (messages: ChatMessage[], sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
  refreshTrigger?: number;
}

export function ChatSidebar({ currentUser, onSessionSelect, onNewChat, className = "", refreshTrigger }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadChatSessions = useCallback(async () => {
    if (!currentUser) {
      setSessions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat?type=sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        console.error("Failed to load chat sessions");
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    if (!currentUser) return;

    console.log("Loading session messages for sessionId:", sessionId);

    try {
      const response = await fetch(`/api/chat?type=session&sessionId=${encodeURIComponent(sessionId)}`);
      console.log("Session messages response:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Session messages data:", data);
        
        if (data.messages && data.messages.length > 0) {
          const formattedMessages: ChatMessage[] = data.messages.map((msg: { dashboardData?: string; role: string; content: string; $id?: string; createdAt?: string }) => {
            let dashboardData = undefined;
            if (msg.dashboardData) {
              try {
                dashboardData = JSON.parse(msg.dashboardData);
                console.log("ChatSidebar: Loaded dashboard data for message:", msg.$id);
              } catch (error) {
                console.error("ChatSidebar: Failed to parse dashboard data:", error);
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
          console.log("Formatted messages:", formattedMessages);
          onSessionSelect(formattedMessages, sessionId);
          setSelectedSessionId(sessionId);
        } else {
          console.warn("No messages found for session:", sessionId);
          // Show an empty state or error message
          alert("No messages found for this session. This might be a synchronization issue.");
        }
      } else {
        console.error("Failed to load session messages:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert(`Failed to load session: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  }, [currentUser, onSessionSelect]);

  const handleNewChat = useCallback(() => {
    setSelectedSessionId(null);
    // Refresh sessions after starting a new chat to ensure the list is up to date
    setTimeout(() => {
      loadChatSessions();
    }, 100);
    onNewChat();
  }, [onNewChat, loadChatSessions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("Sidebar: Refresh triggered, reloading sessions:", refreshTrigger);
      loadChatSessions();
    }
  }, [refreshTrigger, loadChatSessions]);

    if (!currentUser) {
    return (
      <div className={`${className} hidden md:flex flex-col backdrop-blur-xl border-r border-white/20`}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 20px 0 40px rgba(0,0,0,0.1)'
        }}>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <RiLockLine className="text-5xl text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
            }}>
            Sign in to view<br />
            <span className="text-purple-600">chat history</span>
          </p>
        </div>
      </div>
    );
  }  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl transition-all duration-300 hover:scale-110 transform ${
          isExpanded ? 'hidden' : 'block'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${className} ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-50 md:z-auto flex flex-col backdrop-blur-xl border-r border-white/20`}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 20px 0 40px rgba(0,0,0,0.1)'
        }}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10" 
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)'
          }}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg tracking-wide text-slate-900 dark:text-white" 
              style={{ 
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                letterSpacing: '0.02em'
              }}>
              Chat History
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-200 rounded-xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full mt-4 px-4 py-3 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-105 transform flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '0.02em'
            }}
          >
            <RiChatNewLine className="text-base" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="w-5 h-5 border-2 border-purple-300/50 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium" 
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <RiMessageLine className="text-4xl text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                No chat history yet.<br />
                <span className="text-purple-600 font-bold">Start a conversation!</span>
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSessionMessages(session.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] transform ${
                    selectedSessionId === session.id
                      ? 'border border-purple-300/30'
                      : 'border border-transparent hover:border-white/20'
                  }`}
                  style={selectedSessionId === session.id ? {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(102, 126, 234, 0.2), 0 1px 3px rgba(0,0,0,0.1)'
                  } : {
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="truncate font-bold text-slate-900 dark:text-white text-sm mb-2" 
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                      letterSpacing: '0.01em'
                    }}>
                    {session.title}
                  </div>
                  <div className="truncate text-xs text-slate-600 dark:text-slate-300 mb-3 font-medium leading-relaxed">
                    {session.lastMessage}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="px-2 py-1 rounded-full" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                      }}>
                      {formatDate(session.lastMessageTime)}
                    </span>
                    <span className="px-2 py-1 rounded-full" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        color: '#667eea',
                        fontWeight: '600'
                      }}>
                      {session.messageCount} msgs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10" 
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
          <div className="text-xs text-center px-3 py-2 rounded-full font-bold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: '#667eea',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '0.05em'
            }}>
            {sessions.length} CONVERSATION{sessions.length !== 1 ? 'S' : ''}
          </div>
        </div>
      </div>
    </>
  );
}