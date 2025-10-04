"use client";

import { RiFlaskLine, RiBookOpenLine, RiRocketLine } from "react-icons/ri";

type WikiMode = "simple" | "detailed" | "interactive";

interface WikiModeToggleProps {
  currentMode: WikiMode;
  onModeChange: (mode: WikiMode) => void;
}

export function WikiModeToggle({ currentMode, onModeChange }: WikiModeToggleProps) {
  const modes: { key: WikiMode; label: string; icon: React.ComponentType<any>; description: string }[] = [
    {
      key: "simple",
      label: "Simple",
      icon: RiFlaskLine,
      description: "Quick overview"
    },
    {
      key: "detailed", 
      label: "Detailed",
      icon: RiBookOpenLine,
      description: "Full analysis"
    },
    {
      key: "interactive",
      label: "Interactive",
      icon: RiRocketLine,
      description: "Live mode"
    }
  ];

  return (
    <div className="rounded-2xl backdrop-blur-xl border border-white/20 p-4"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.1)'
      }}>
      <div className="flex gap-2">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105 transform"
              style={isActive ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
              } : {
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)',
                color: '#64748b',
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
              }}
            >
              <IconComponent className="text-base" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400"
          style={{ 
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
            letterSpacing: '0.02em'
          }}>
          {modes.find(m => m.key === currentMode)?.description}
        </span>
      </div>
    </div>
  );
}