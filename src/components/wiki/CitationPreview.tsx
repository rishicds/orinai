"use client";

import { useState } from "react";

interface Citation {
  id: string;
  title: string;
  url?: string;
  author?: string;
  date?: string;
  type: "website" | "article" | "book" | "journal" | "video" | "other";
  excerpt?: string;
}

interface CitationPreviewProps {
  citations: Citation[];
  onCitationClick: (citation: Citation) => void;
}

export function CitationPreview({ citations, onCitationClick }: CitationPreviewProps) {
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);

  if (!citations || citations.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
          <span>📚</span>
          References
        </h4>
        <p className="text-sm text-slate-500 italic">No citations available</p>
      </div>
    );
  }

  const getCitationIcon = (type: string) => {
    switch (type) {
      case "website": return "🌐";
      case "article": return "📰";
      case "book": return "📖";
      case "journal": return "📄";
      case "video": return "🎥";
      default: return "📋";
    }
  };

  const getCitationColor = (type: string) => {
    switch (type) {
      case "website": return "border-blue-200 bg-blue-50";
      case "article": return "border-green-200 bg-green-50";
      case "book": return "border-purple-200 bg-purple-50";
      case "journal": return "border-orange-200 bg-orange-50";
      case "video": return "border-red-200 bg-red-50";
      default: return "border-slate-200 bg-slate-50";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <span>📚</span>
        References & Citations
        <span className="ml-auto text-xs text-slate-500 font-normal">
          {citations.length} sources
        </span>
      </h4>

      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div
            key={citation.id}
            className={`
              border rounded-lg p-3 transition-all duration-200 cursor-pointer
              ${getCitationColor(citation.type)}
              ${hoveredCitation === citation.id ? "shadow-md scale-[1.02]" : "hover:shadow-sm"}
              ${expandedCitation === citation.id ? "ring-2 ring-blue-300 ring-opacity-50" : ""}
            `}
            onMouseEnter={() => setHoveredCitation(citation.id)}
            onMouseLeave={() => setHoveredCitation(null)}
            onClick={() => {
              setExpandedCitation(expandedCitation === citation.id ? null : citation.id);
              onCitationClick(citation);
            }}
          >
            {/* Citation Header */}
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getCitationIcon(citation.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-medium text-slate-900 text-sm leading-tight">
                    {citation.title}
                  </h5>
                  <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-full">
                    [{index + 1}]
                  </span>
                </div>
                
                {/* Citation Metadata */}
                <div className="mt-1 space-y-1">
                  {citation.author && (
                    <p className="text-xs text-slate-600">
                      By {citation.author}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="capitalize font-medium">{citation.type}</span>
                    {citation.date && <span>{citation.date}</span>}
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expand Button */}
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg 
                  className={`w-4 h-4 transition-transform ${
                    expandedCitation === citation.id ? "rotate-180" : ""
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCitation === citation.id && citation.excerpt && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{citation.excerpt}&rdquo;
                </p>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitationClick(citation);
                    }}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    📖 Read More
                  </button>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      🔗 Open Source
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Copy citation to clipboard
                      navigator.clipboard.writeText(`${citation.title} - ${citation.author || 'Unknown'} (${citation.date || 'No date'})`);
                    }}
                    className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    📋 Copy Citation
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Citation Summary */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Total: {citations.length} references</span>
          <div className="flex items-center gap-3">
            {Array.from(new Set(citations.map(c => c.type))).map(type => (
              <div key={type} className="flex items-center gap-1">
                <span>{getCitationIcon(type)}</span>
                <span className="capitalize">
                  {citations.filter(c => c.type === type).length} {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}