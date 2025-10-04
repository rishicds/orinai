"use client";

type WikiMode = "simple" | "detailed" | "interactive";

interface WikiModeToggleProps {
  currentMode: WikiMode;
  onModeChange: (mode: WikiMode) => void;
}

export function WikiModeToggle({ currentMode, onModeChange }: WikiModeToggleProps) {
  const modes: { key: WikiMode; label: string; icon: string; description: string }[] = [
    {
      key: "simple",
      label: "Simple",
      icon: "📄",
      description: "Basic overview with key points"
    },
    {
      key: "detailed", 
      label: "Detailed",
      icon: "📚",
      description: "Comprehensive information"
    },
    {
      key: "interactive",
      label: "Interactive",
      icon: "🎮",
      description: "Full interactive experience"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">Wiki Mode</h4>
        <span className="text-xs text-slate-500">
          {modes.find(m => m.key === currentMode)?.description}
        </span>
      </div>
      
      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              flex items-center justify-center gap-2
              ${currentMode === mode.key
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }
            `}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Mode Features Indicator */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`flex items-center gap-1 ${
            currentMode === "simple" ? "text-blue-600" : "text-slate-400"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              currentMode === "simple" ? "bg-blue-600" : "bg-slate-400"
            }`}></div>
            <span>Quick Read</span>
          </div>
          <div className={`flex items-center gap-1 ${
            ["detailed", "interactive"].includes(currentMode) ? "text-blue-600" : "text-slate-400"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              ["detailed", "interactive"].includes(currentMode) ? "bg-blue-600" : "bg-slate-400"
            }`}></div>
            <span>Full Content</span>
          </div>
          <div className={`flex items-center gap-1 ${
            currentMode === "interactive" ? "text-blue-600" : "text-slate-400"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              currentMode === "interactive" ? "bg-blue-600" : "bg-slate-400"
            }`}></div>
            <span>Interactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}