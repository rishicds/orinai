"use client";

import { useState } from "react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
}

interface InteractiveTimelineProps {
  events: TimelineEvent[];
  title?: string;
  onEventClick: (eventTitle: string) => void;
}

export function InteractiveTimeline({ events, title = "Timeline", onEventClick }: InteractiveTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          {title}
        </h3>
        <p className="text-slate-500 italic">No timeline events available</p>
      </div>
    );
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-slate-500";
    }
  };

  const getImportanceSize = (importance: string) => {
    switch (importance) {
      case "high": return "w-4 h-4";
      case "medium": return "w-3 h-3";
      case "low": return "w-2 h-2";
      default: return "w-2 h-2";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-xl">📅</span>
        {title}
        <span className="ml-auto text-sm text-slate-500 font-normal">
          {events.length} events
        </span>
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-200 ${
                hoveredEvent === index ? "scale-105" : ""
              }`}
              onMouseEnter={() => setHoveredEvent(index)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={() => {
                setSelectedEvent(selectedEvent === index ? null : index);
                onEventClick(event.title);
              }}
            >
              {/* Timeline Dot */}
              <div className={`absolute left-2 -translate-x-1/2 rounded-full border-2 border-white shadow-md transition-all ${
                getImportanceColor(event.importance)
              } ${getImportanceSize(event.importance)} ${
                hoveredEvent === index ? "scale-125" : ""
              }`}></div>

              {/* Event Content */}
              <div className={`ml-12 p-4 rounded-lg border transition-all ${
                selectedEvent === index 
                  ? "bg-blue-50 border-blue-200 shadow-md" 
                  : hoveredEvent === index 
                    ? "bg-slate-50 border-slate-300" 
                    : "bg-white border-slate-200 hover:border-slate-300"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.importance === "high" ? "bg-red-100 text-red-700" :
                        event.importance === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {event.date}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.importance === "high" ? "bg-red-500 text-white" :
                        event.importance === "medium" ? "bg-yellow-500 text-white" :
                        "bg-blue-500 text-white"
                      }`}>
                        {event.importance}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2 hover:text-blue-700 transition-colors">
                      {event.title}
                    </h4>
                    <p className={`text-slate-600 leading-relaxed ${
                      selectedEvent === index ? "" : "line-clamp-2"
                    }`}>
                      {event.description}
                    </p>
                  </div>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <svg 
                      className={`w-5 h-5 transition-transform ${selectedEvent === index ? "rotate-180" : ""}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Content */}
                {selectedEvent === index && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(`${event.title} details`);
                        }}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        📖 Learn More
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(`${event.title} related events`);
                        }}
                        className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        🔗 Related Events
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(`${event.title} context`);
                        }}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        🌍 Historical Context
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Timeline spans {events.length > 1 ? `from ${events[0]?.date} to ${events[events.length - 1]?.date}` : events[0]?.date}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}