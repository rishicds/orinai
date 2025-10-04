"use client";

import { useState, useRef } from "react";

interface TermHighlightProps {
  content: string;
  terms: string[];
  onTermClick: (term: string) => void;
}

export function TermHighlight({ content, terms, onTermClick }: TermHighlightProps) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to escape special regex characters
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Function to highlight terms in content
  const highlightContent = (text: string) => {
    if (!terms || terms.length === 0) return text;

    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
    
    const usedRanges: Array<{start: number, end: number}> = [];

    sortedTerms.forEach((term) => {
      if (!term.trim()) return;
      
      const escapedTerm = escapeRegex(term.trim());
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      let match;
      
      // Find all matches for this term
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        
        // Check if this range overlaps with any used range
        const overlaps = usedRanges.some(range => 
          (start >= range.start && start < range.end) ||
          (end > range.start && end <= range.end) ||
          (start <= range.start && end >= range.end)
        );
        
        if (!overlaps) {
          usedRanges.push({ start, end });
        }
      }
    });

    // Sort ranges by start position
    usedRanges.sort((a, b) => a.start - b.start);

    // Build the highlighted content
    if (usedRanges.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    usedRanges.forEach((range, index) => {
      // Add text before the highlight
      if (range.start > lastIndex) {
        parts.push(text.slice(lastIndex, range.start));
      }

      // Add the highlighted term
      const termText = text.slice(range.start, range.end);
      const termKey = `term-${index}-${range.start}`;
      
      parts.push(
        <span
          key={termKey}
          className={`
            cursor-pointer underline decoration-2 decoration-dotted transition-all duration-200
            ${hoveredTerm === termText.toLowerCase() 
              ? 'bg-blue-200 text-blue-900 decoration-blue-600' 
              : 'bg-blue-100 text-blue-800 decoration-blue-400 hover:bg-blue-200'
            }
            px-1 rounded-sm font-medium
          `}
          onMouseEnter={(e) => {
            setHoveredTerm(termText.toLowerCase());
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            });
          }}
          onMouseLeave={() => setHoveredTerm(null)}
          onClick={() => onTermClick(termText)}
          title={`Click to learn more about "${termText}"`}
        >
          {termText}
        </span>
      );

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Content with highlighted terms */}
      <div className="prose prose-slate max-w-none">
        <div className="text-slate-700 leading-relaxed whitespace-pre-line">
          {highlightContent(content)}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTerm && (
        <div
          className="fixed z-50 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-300">💡</span>
            <span>Click to explore &ldquo;{hoveredTerm}&rdquo;</span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      )}

      {/* Term Legend */}
      {terms && terms.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <span>🔍</span>
            Interactive Terms
            <span className="ml-auto text-xs text-slate-500 font-normal">
              {terms.length} terms
            </span>
          </h5>
          <div className="flex flex-wrap gap-2">
            {terms.map((term, index) => (
              <button
                key={index}
                onClick={() => onTermClick(term)}
                className={`
                  px-2 py-1 rounded-lg text-xs font-medium transition-all
                  ${hoveredTerm === term.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }
                `}
                onMouseEnter={() => setHoveredTerm(term.toLowerCase())}
                onMouseLeave={() => setHoveredTerm(null)}
              >
                {term}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Click on highlighted terms in the text or buttons above to explore related topics
          </p>
        </div>
      )}
    </div>
  );
}