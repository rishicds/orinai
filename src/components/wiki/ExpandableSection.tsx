"use client";

import { useState } from "react";

type WikiMode = "simple" | "detailed" | "interactive";

interface ExpandableSectionProps {
  id: string;
  heading?: string;
  paragraph?: string;
  bullets?: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onSubsectionClick: (topic: string) => void;
  mode: WikiMode;
  index: number;
}

export function ExpandableSection({
  id,
  heading,
  paragraph,
  bullets,
  isExpanded,
  onToggle,
  onSubsectionClick,
  mode,
  index
}: ExpandableSectionProps) {
  const [hoveredBullet, setHoveredBullet] = useState<number | null>(null);

  if (mode === "simple" && !isExpanded && index > 2) {
    return null; // Hide sections in simple mode
  }

  const shouldRenderSection = heading || paragraph || (bullets && bullets.length > 0);
  if (!shouldRenderSection) return null;

  return (
    <section id={id} className="scroll-mt-8 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Section Header */}
      {heading && (
        <button
          onClick={onToggle}
          className="w-full p-6 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all border-b border-slate-200 flex items-center justify-between group"
        >
          <h2 className="text-xl font-bold text-slate-900 text-left group-hover:text-blue-700 transition-colors">
            {heading}
          </h2>
          <div className="flex items-center gap-3">
            {mode === "interactive" && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Interactive
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-all ${isExpanded ? "rotate-180" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Section Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {paragraph && (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                {paragraph}
              </p>
            </div>
          )}

          {bullets && bullets.length > 0 && (
            <div className="space-y-3">
              <ul className="space-y-3">
                {bullets.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                      hoveredBullet === itemIndex 
                        ? "bg-blue-50 border border-blue-200" 
                        : "hover:bg-slate-50"
                    }`}
                    onMouseEnter={() => setHoveredBullet(itemIndex)}
                    onMouseLeave={() => setHoveredBullet(null)}
                    onClick={() => {
                      const firstFewWords = item.split(' ').slice(0, 3).join(' ');
                      onSubsectionClick(firstFewWords);
                    }}
                  >
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      hoveredBullet === itemIndex ? "bg-blue-500" : "bg-slate-400"
                    }`}></span>
                    <span className="leading-relaxed text-slate-700 flex-1">{item}</span>
                    {mode === "interactive" && hoveredBullet === itemIndex && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Explore →
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Elements for specific modes */}
          {mode === "interactive" && isExpanded && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => onSubsectionClick(`${heading} examples`)}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  📊 Show Examples
                </button>
                <button 
                  onClick={() => onSubsectionClick(`${heading} timeline`)}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  📅 View Timeline
                </button>
                <button 
                  onClick={() => onSubsectionClick(`${heading} diagram`)}
                  className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                >
                  🧩 See Diagram
                </button>
                <button 
                  onClick={() => onSubsectionClick(`${heading} related topics`)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  🔗 Related Topics
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}