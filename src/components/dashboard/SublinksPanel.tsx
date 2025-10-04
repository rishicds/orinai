"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { DashboardSublink } from "@/types";

interface SublinksPanelProps {
  sublinks?: DashboardSublink[];
  onSubsectionRequest?: (topic: string) => void;
}

// Enhanced sublink generation with analytics and categorization
export function generateEnhancedSublinks(topic: string, data: any[]): DashboardSublink[] {
  const baseSublinks: DashboardSublink[] = [
    {
      label: `${topic} Overview`,
      route: `#overview`,
      context: { type: "overview", topic },
      category: "general",
      priority: 1,
      analytics: { clickable: true, trackingId: `overview-${topic}` }
    },
    {
      label: `${topic} Analytics`,
      route: `#analytics`,
      context: { type: "analytics", topic },
      category: "analysis",
      priority: 2,
      analytics: { clickable: true, trackingId: `analytics-${topic}` }
    },
    {
      label: `${topic} Trends`,
      route: `#trends`,
      context: { type: "trends", topic },
      category: "analysis", 
      priority: 3,
      analytics: { clickable: true, trackingId: `trends-${topic}` }
    },
    {
      label: `Compare ${topic}`,
      route: `#comparison`,
      context: { type: "comparison", topic },
      category: "analysis",
      priority: 4,
      analytics: { clickable: true, trackingId: `comparison-${topic}` }
    }
  ];

  // Add data-driven sublinks
  if (data && data.length > 0) {
    const topItems = data
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 3);

    topItems.forEach((item, index) => {
      if (item.label) {
        baseSublinks.push({
          label: `Deep dive: ${item.label}`,
          route: `#detail-${item.label.toLowerCase().replace(/\s+/g, "-")}`,
          context: { type: "detail", topic: item.label, parentTopic: topic },
          category: "details",
          priority: 5 + index,
          analytics: { clickable: true, trackingId: `detail-${item.label}` }
        });
      }
    });
  }

  // Add related topics
  const relatedTopics = generateRelatedTopics(topic);
  relatedTopics.forEach((relatedTopic, index) => {
    baseSublinks.push({
      label: `Related: ${relatedTopic}`,
      route: `#related-${relatedTopic.toLowerCase().replace(/\s+/g, "-")}`,
      context: { type: "related", topic: relatedTopic, originalTopic: topic },
      category: "related",
      priority: 10 + index,
      analytics: { clickable: true, trackingId: `related-${relatedTopic}` }
    });
  });

  return baseSublinks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

function generateRelatedTopics(topic: string): string[] {
  const topicLower = topic.toLowerCase();
  const relatedMap: Record<string, string[]> = {
    "technology": ["AI", "Innovation", "Digital Transformation"],
    "business": ["Strategy", "Market Analysis", "Growth"],
    "science": ["Research", "Innovation", "Discovery"],
    "health": ["Medical Research", "Wellness", "Prevention"],
    "environment": ["Sustainability", "Climate", "Conservation"],
    "education": ["Learning", "Skills", "Development"],
    "finance": ["Investment", "Market", "Economy"],
    "sports": ["Performance", "Statistics", "Competition"]
  };

  for (const [category, related] of Object.entries(relatedMap)) {
    if (topicLower.includes(category)) {
      return related;
    }
  }

  return ["Research", "Analysis", "Insights"];
}

export function SublinksPanel({ sublinks, onSubsectionRequest }: SublinksPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  if (!sublinks || sublinks.length === 0) {
    return null;
  }

  const categories = ["all", ...Array.from(new Set(sublinks.map(link => link.category || "general")))];
  const filteredSublinks = activeCategory === "all" 
    ? sublinks 
    : sublinks.filter(link => link.category === activeCategory);

  const handleLinkClick = (link: DashboardSublink) => {
    setClickedLinks(prev => new Set([...prev, link.route]));
    
    // Analytics tracking
    if (link.analytics?.trackingId) {
      console.log(`Analytics: Clicked ${link.analytics.trackingId}`);
    }

    // Handle in-page navigation for sublinks
    if (link.route.startsWith("#") && onSubsectionRequest) {
      const topic = link.context.topic as string;
      onSubsectionRequest(topic);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      general: "📊",
      analysis: "📈",
      details: "🔍",
      related: "🔗",
      all: "🌟"
    };
    return icons[category] || "📄";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🚀 Explore Further
        </h3>
        <div className="text-xs text-slate-400">
          {filteredSublinks.length} links
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeCategory === category
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Sublinks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSublinks.map((link, index) => (
          <motion.div
            key={link.route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={link.route}
              onClick={() => handleLinkClick(link)}
              className={`group block rounded-lg border p-3 text-sm transition-all hover:scale-105 ${
                clickedLinks.has(link.route)
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-200 hover:border-blue-500 hover:text-blue-400"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate group-hover:text-blue-300">
                    {link.label}
                  </div>
                  {link.category && (
                    <div className="text-xs text-slate-500 mt-1">
                      {getCategoryIcon(link.category)} {link.category}
                    </div>
                  )}
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Categories: {categories.length - 1}</span>
          <span>Clicked: {clickedLinks.size}</span>
          <span>Priority range: 1-{Math.max(...sublinks.map(l => l.priority || 0))}</span>
        </div>
      </div>
    </motion.div>
  );
}
