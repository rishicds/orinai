"use client";

import { useState } from "react";
import Image from "next/image";

interface InfoboxData {
  title: string;
  image?: string;
  facts: Array<{ label: string; value: string }>;
}

interface InteractiveInfoboxProps {
  data: InfoboxData;
}

export function InteractiveInfobox({ data }: InteractiveInfoboxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
        <h3 className="font-bold text-lg">{data.title}</h3>
        <p className="text-blue-100 text-sm">Quick Facts</p>
      </div>

      {/* Image */}
      {data.image && (
        <div className="aspect-video bg-slate-100 relative">
          <Image 
            src={data.image} 
            alt={data.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Facts */}
      <div className="p-4">
        <div className="space-y-3">
          {(isExpanded ? data.facts : data.facts.slice(0, 4)).map((fact, index) => (
            <div key={index} className="flex justify-between items-start gap-2">
              <dt className="text-sm text-slate-600 font-medium">{fact.label}</dt>
              <dd className="text-sm text-slate-900 font-semibold text-right">{fact.value}</dd>
            </div>
          ))}
        </div>

        {data.facts.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            {isExpanded ? "Show less" : `Show ${data.facts.length - 4} more`}
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Interactive Actions */}
      <div className="border-t border-slate-200 p-3 bg-slate-50">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors">
            Edit Facts
          </button>
          <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm font-medium transition-colors">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}