"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
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
          const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => {
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
      <div className={`${className} hidden md:flex flex-col bg-white/40 dark:bg-slate-900/40 border-r border-slate-300 dark:border-slate-800`}>
        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          Sign in to view chat history
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-300 dark:border-slate-700 ${
          isExpanded ? 'hidden' : 'block'
        }`}
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
      } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-50 md:z-auto flex flex-col bg-white/60 dark:bg-slate-900/60 border-r border-slate-300 dark:border-slate-800`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-300 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Chat History</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="md:hidden p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            + New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              No chat history yet. Start a conversation!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSessionMessages(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="truncate font-medium text-slate-900 dark:text-white text-sm mb-1">
                    {session.title}
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {session.lastMessage}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span>{formatDate(session.lastMessageTime)}</span>
                    <span>{session.messageCount} messages</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-300 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
}