"use client";

import { useState, useCallback } from "react";
import { ChatInterfaceV2 } from "@/components/chat/ChatInterfaceV2";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { FullscreenContentModal } from "@/components/ui/FullscreenContentModal";
import { FaComments, FaChartBar, FaBolt, FaArrowRight, FaChartLine, FaTrophy, FaClipboardList } from "react-icons/fa";
import type { DashboardOutput } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  $id?: string;
  createdAt?: string;
  dashboardData?: DashboardOutput;
}

interface HomeShellProps {
  isAuthenticated: boolean;
}

export function HomeShell({ isAuthenticated }: HomeShellProps) {
  const [dashboard, setDashboard] = useState<DashboardOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [chatInterfaceKey, setChatInterfaceKey] = useState(0);
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const handleSubsectionRequest = useCallback((topic: string) => {
    console.log('HomeShell: Subsection requested:', topic);
    
    // Close the current modal
    setShowContentModal(false);
    
    // Create a ref to the chat interface and trigger a new message
    // We'll use a small delay to ensure the modal closes first
    setTimeout(() => {
      // Create a custom event to communicate with ChatInterface
      const event = new CustomEvent('triggerChatMessage', { 
        detail: { message: topic } 
      });
      window.dispatchEvent(event);
    }, 100);
  }, []);

  const handleDashboardGenerated = (newDashboard: DashboardOutput | null) => {
    setDashboard(newDashboard);
    setIsLoading(false);
    if (newDashboard) {
      setShowContentModal(true);
    }
  };

  const handleSessionSelect = useCallback((messages: ChatMessage[], sessionId: string) => {
    // Set selected session messages and session ID, then force re-render of ChatInterface
    setSelectedSessionMessages(messages);
    setCurrentSessionId(sessionId);
    setChatInterfaceKey(prev => prev + 1);
  }, []);

  const handleNewChat = useCallback(() => {
    // Start a new chat session by generating a new session ID and clearing state
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setSelectedSessionMessages(undefined);
    setDashboard(null);
    setShowContentModal(false);
    setChatInterfaceKey(prev => prev + 1);
  }, []);

  const handleUserAuthenticated = useCallback((user: { id: string } | null) => {
    setCurrentUser(user);
  }, []);

  const handleSessionCreated = useCallback((sessionId: string) => {
    // This will be called when a new session is created with the first message
    console.log("HomeShell: New session created, triggering sidebar refresh:", sessionId);
    // Trigger sidebar refresh so the new session appears
    setSidebarRefreshTrigger(prev => prev + 1);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex w-full flex-col gap-12">
        {/* Main CTA Section */}
        <div className="flex w-full flex-col items-center gap-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-12 text-center shadow-2xl">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-slate-900" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Transform Your Data Into Stories
            </h2>
            <p className="max-w-2xl text-lg text-slate-800 font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              Turn natural language questions into beautiful, interactive dashboards. 
              No coding required—just ask, and watch your data come to life.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/register"
              className="rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)',
                boxShadow: '0 8px 32px rgba(241, 60, 32, 0.3)'
              }}
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white bg-white/20 backdrop-blur-sm transition hover:bg-white/30 hover:scale-105"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <FaComments className="h-6 w-6 text-[#4056A1]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>Natural Language Queries</h3>
            <p className="text-sm text-slate-800 font-medium">
              Ask questions in plain English. &ldquo;Show me sales trends&rdquo; becomes a beautiful chart instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <FaChartBar className="h-6 w-6 text-[#D79922]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>Live Dashboards</h3>
            <p className="text-sm text-slate-800 font-medium">
              Watch your UI transform in real-time with interactive charts, tables, and insights.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <FaBolt className="h-6 w-6 text-[#F13C20]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>AI-Powered Insights</h3>
            <p className="text-sm text-slate-800 font-medium">
              Powered by advanced LLMs to understand context and generate meaningful visualizations.
            </p>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-slate-900 mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>See It In Action</h3>
            <p className="text-slate-800 font-medium">Here&apos;s what you can build with just a simple question</p>
          </div>
          
          <div className="rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#4056A1' }}>
                <span className="text-sm font-semibold text-white">You</span>
              </div>
              <div className="rounded-lg px-4 py-2 text-slate-900 font-medium" style={{ backgroundColor: 'rgba(64, 86, 161, 0.2)' }}>
                &ldquo;Show me our quarterly sales performance with top products&rdquo;
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)' }}>
                <span className="text-sm font-semibold text-white">AI</span>
              </div>
              <div className="flex-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-4">
                <div className="mb-2 text-sm text-slate-900 font-medium">✨ Generated interactive dashboard with:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-blue-600" />
                    Quarterly revenue chart
                  </div>
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-green-600" />
                    Growth trend analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-yellow-600" />
                    Top performing products
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClipboardList className="text-purple-600" />
                    Summary insights table
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <p className="mb-6 text-slate-800 font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
            Join thousands of users transforming their data workflows
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
            style={{ 
              background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)',
              boxShadow: '0 8px 32px rgba(241, 60, 32, 0.3)'
            }}
          >
            Start Building Your Dashboard
            <FaArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-12rem)] w-full flex">
        {/* Chat Sidebar */}
        <ChatSidebar
          currentUser={currentUser}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          className="w-80 min-w-80"
          refreshTrigger={sidebarRefreshTrigger}
        />
        
        {/* Main chat interface */}
        <div className="flex-1 min-w-0">
          <ChatInterfaceV2 
            key={chatInterfaceKey}
            onDashboardGenerated={handleDashboardGenerated}
            onUserAuthenticated={handleUserAuthenticated}
            initialMessages={selectedSessionMessages}
            sessionId={currentSessionId}
            onSessionCreated={handleSessionCreated}
          />
        </div>
      </div>

      {/* Fullscreen modal for generated content */}
      <FullscreenContentModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        dashboard={dashboard}
        isLoading={isLoading}
        onSubsectionRequest={handleSubsectionRequest}
      />
    </>
  );
}
