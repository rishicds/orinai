"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  preferences: {
    topics?: string[];
    communicationStyle?: string;
    expertiseLevel?: string;
    interests?: string[];
  };
  memorySettings: {
    enableMemory: boolean;
    retentionDays: number;
    importanceThreshold: number;
  };
}

interface MemorySearchResult {
  content: string;
  context: string;
  similarity: number;
  timestamp: string;
  metadata: {
    queryType?: string;
    entities?: string[];
    keywords?: string[];
    topic?: string;
  };
}

export function UserMemoryPanel() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<MemorySearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "memories">("profile");

  useEffect(() => {
    loadUserProfile();
    loadRecentMemories();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/memory?action=profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || {
          preferences: {},
          memorySettings: {
            enableMemory: true,
            retentionDays: 90,
            importanceThreshold: 5,
          },
        });
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentMemories = async () => {
    try {
      const response = await fetch("/api/memory?action=recent&limit=10");
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error("Failed to load recent memories:", error);
    }
  };

  const searchMemories = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/memory?action=search&query=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error("Failed to search memories:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    
    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          preferences: profile.preferences,
          memorySettings: profile.memorySettings,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Memory & Profile Settings</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-medium ${ 
            activeTab === "profile" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab("memories")}
          className={`px-4 py-2 rounded-lg font-medium ${ 
            activeTab === "memories" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Memory Management
        </button>
      </div>

      {activeTab === "profile" && profile && (
        <div className="space-y-6">
          {/* Memory Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Memory Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableMemory"
                  checked={profile.memorySettings.enableMemory}
                  onChange={(e) => setProfile({
                    ...profile,
                    memorySettings: {
                      ...profile.memorySettings,
                      enableMemory: e.target.checked,
                    },
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="enableMemory" className="ml-2 text-sm font-medium text-gray-700">
                  Enable AI Memory (remembers our conversations to provide better responses)
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Retention Period (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={profile.memorySettings.retentionDays}
                  onChange={(e) => setProfile({
                    ...profile,
                    memorySettings: {
                      ...profile.memorySettings,
                      retentionDays: parseInt(e.target.value, 10),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Importance Threshold (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.memorySettings.importanceThreshold}
                  onChange={(e) => setProfile({
                    ...profile,
                    memorySettings: {
                      ...profile.memorySettings,
                      importanceThreshold: parseInt(e.target.value, 10),
                    },
                  })}
                  className="mt-1 block w-full"
                />
                <span className="text-sm text-gray-500">
                  Current: {profile.memorySettings.importanceThreshold} (Higher values store only more important conversations)
                </span>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Style
                </label>
                <select
                  value={profile.preferences.communicationStyle || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      communicationStyle: e.target.value,
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a style</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="educational">Educational</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expertise Level
                </label>
                <select
                  value={profile.preferences.expertiseLevel || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      expertiseLevel: e.target.value,
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select expertise level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.preferences.interests?.join(", ") || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      interests: e.target.value.split(",").map(i => i.trim()).filter(Boolean),
                    },
                  })}
                  placeholder="e.g., technology, science, art, history"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={updateProfile}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Profile
          </button>
        </div>
      )}

      {activeTab === "memories" && (
        <div className="space-y-6">
          {/* Memory Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Search Your Memories</h2>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your conversation history..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && searchMemories()}
              />
              <button
                onClick={searchMemories}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Memory Results */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery ? "Search Results" : "Recent Memories"}
            </h2>
            
            {memories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchQuery ? "No memories found for your search." : "No memories stored yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {memories.map((memory, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-600">
                        {memory.context}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(memory.timestamp).toLocaleDateString()}
                        {searchQuery && (
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {Math.round(memory.similarity * 100)}% match
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {memory.content.length > 200 
                        ? memory.content.substring(0, 200) + "..." 
                        : memory.content
                      }
                    </p>
                    {memory.metadata.keywords && memory.metadata.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {memory.metadata.keywords.slice(0, 5).map((keyword, i) => (
                          <span 
                            key={i}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}