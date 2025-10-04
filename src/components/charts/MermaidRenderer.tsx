"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MermaidRendererProps {
  diagram: string;
  title?: string;
  className?: string;
}

export function MermaidRenderer({ diagram, title, className = "" }: MermaidRendererProps) {
  const [mermaid, setMermaid] = useState<unknown>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaidModule = await import("mermaid");
        const mermaidInstance = mermaidModule.default;
        
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#0ea5e9",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#1e293b",
            lineColor: "#64748b",
            background: "#0f172a",
            darkMode: true
          }
        });
        
        setMermaid(mermaidInstance);
      } catch (err) {
        console.error("Failed to load Mermaid:", err);
        setError("Failed to load diagram renderer");
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (mermaid && diagram && containerRef.current) {
      const renderDiagram = async () => {
        try {
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const mermaidInstance = mermaid as { render: (id: string, diagram: string) => Promise<{ svg: string }> };
          const { svg: renderedSvg } = await mermaidInstance.render(id, diagram);
          setSvg(renderedSvg);
          setError("");
        } catch (err) {
          console.error("Mermaid rendering error:", err);
          setError("Failed to render diagram");
        }
      };

      renderDiagram();
    }
  }, [mermaid, diagram]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl border border-red-800 bg-red-900/20 p-8 ${className}`}
      >
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Diagram Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  if (!svg) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 ${className}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-slate-400">Rendering diagram...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 shadow-xl ${className}`}
    >
      {title && (
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      )}
      
      <div 
        ref={containerRef}
        className="mermaid-container overflow-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{
          filter: "brightness(1.1) contrast(1.1)",
          background: "transparent"
        }}
      />
      
      <style jsx>{`
        .mermaid-container svg {
          max-width: 100%;
          height: auto;
          background: transparent !important;
        }
        
        .mermaid-container .node rect,
        .mermaid-container .node circle,
        .mermaid-container .node ellipse,
        .mermaid-container .node polygon {
          fill: #1e293b !important;
          stroke: #0ea5e9 !important;
          stroke-width: 2px !important;
        }
        
        .mermaid-container .node .label {
          color: #ffffff !important;
          fill: #ffffff !important;
        }
        
        .mermaid-container .edgePath .path {
          stroke: #64748b !important;
          stroke-width: 2px !important;
        }
        
        .mermaid-container .edgeLabel {
          background-color: #0f172a !important;
          color: #ffffff !important;
        }
      `}</style>
    </motion.div>
  );
}

// Utility function to generate mermaid diagrams based on data
export function generateMermaidDiagram(type: string, data: unknown[], topic: string): string {
  const safeData = Array.isArray(data) ? data : [];
  
  switch (type) {
    case 'flowchart':
      return generateFlowchart(safeData, topic);
    case 'pie':
      return generatePieChart(safeData, topic);
    case 'gantt':
      return generateGanttChart(safeData, topic);
    case 'sequence':
      return generateSequenceDiagram(safeData, topic);
    case 'journey':
      return generateUserJourney(safeData, topic);
    case 'mindmap':
      return generateMindmap(safeData, topic);
    default:
      return generateFlowchart(safeData, topic);
  }
}

function generateFlowchart(data: unknown[], topic: string): string {
  const nodes = data.slice(0, 5).map((item, index) => {
    const name = (item as { name?: string })?.name || `Step ${index + 1}`;
    return `    ${index + 1}[${name}]`;
  }).join('\n');

  return `flowchart TD
    Start([${topic}])
${nodes}
    End([Complete])
    
    Start --> 1
    ${data.slice(0, 4).map((_, i) => `    ${i + 1} --> ${i + 2}`).join('\n')}
    ${data.length > 0 ? data.length : 1} --> End`;
}

function generatePieChart(data: unknown[], topic: string): string {
  const chartData = data.slice(0, 6).map(item => {
    const name = (item as { name?: string })?.name || 'Item';
    const value = (item as { value?: number })?.value || 1;
    return `    "${name}" : ${value}`;
  }).join('\n');

  return `pie title ${topic}
${chartData}`;
}

function generateGanttChart(data: unknown[], topic: string): string {
  const tasks = data.slice(0, 5).map((item, index) => {
    const name = (item as { name?: string })?.name || `Task ${index + 1}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + index * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return `    ${name} :active, task${index + 1}, ${startDate.toISOString().split('T')[0]}, ${endDate.toISOString().split('T')[0]}`;
  }).join('\n');

  return `gantt
    title ${topic} Timeline
    dateFormat  YYYY-MM-DD
    section Planning
${tasks}`;
}

function generateSequenceDiagram(data: unknown[], topic: string): string {
  const interactions = data.slice(0, 4).map((item, index) => {
    const name = (item as { name?: string })?.name || `Action ${index + 1}`;
    return `    User->>System: ${name}
    System-->>User: Response ${index + 1}`;
  }).join('\n');

  return `sequenceDiagram
    participant User
    participant System
    
    Note over User,System: ${topic}
${interactions}`;
}

function generateUserJourney(data: unknown[], topic: string): string {
  const steps = data.slice(0, 5).map((item, index) => {
    const name = (item as { name?: string })?.name || `Step ${index + 1}`;
    const satisfaction = Math.floor(Math.random() * 3) + 3; // 3-5 rating
    return `        ${name}: ${satisfaction}: User`;
  }).join('\n');

  return `journey
    title ${topic}
    section Experience
${steps}`;
}

function generateMindmap(data: unknown[], topic: string): string {
  const branches = data.slice(0, 4).map((item, index) => {
    const name = (item as { name?: string })?.name || `Concept ${index + 1}`;
    return `    ${topic}
      ${name}`;
  }).join('\n');

  return `mindmap
  root((${topic}))
${branches}`;
}