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
      icon: "⚡",
      description: "Quick overview"
    },
    {
      key: "detailed", 
      label: "Detailed",
      icon: "�",
      description: "Full analysis"
    },
    {
      key: "interactive",
      label: "Interactive",
      icon: "🚀",
      description: "Live mode"
    }
  ];

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-600 p-3 backdrop-blur-sm">
      <div className="flex gap-1">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all
              flex items-center gap-1.5
              ${currentMode === mode.key
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }
            `}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Compact indicator */}
      <div className="mt-2 text-center">
        <span className="text-xs text-slate-400">
          {modes.find(m => m.key === currentMode)?.description}
        </span>
      </div>
    </div>
  );
}