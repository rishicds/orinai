"use client";

import { useState } from "react";

interface KnowledgeNode {
  id: string;
  label: string;
  type: "concept" | "person" | "location" | "event" | "organization";
  size: number; // Importance level 1-10
  connections: string[]; // IDs of connected nodes
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  title?: string;
  onNodeClick: (nodeLabel: string) => void;
}

export function KnowledgeGraph({ nodes, title = "Knowledge Graph", onNodeClick }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🧠</span>
          {title}
        </h3>
        <p className="text-slate-500 italic">No knowledge graph data available</p>
      </div>
    );
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "concept": return { bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-700" };
      case "person": return { bg: "bg-green-500", border: "border-green-600", text: "text-green-700" };
      case "location": return { bg: "bg-orange-500", border: "border-orange-600", text: "text-orange-700" };
      case "event": return { bg: "bg-purple-500", border: "border-purple-600", text: "text-purple-700" };
      case "organization": return { bg: "bg-red-500", border: "border-red-600", text: "text-red-700" };
      default: return { bg: "bg-slate-500", border: "border-slate-600", text: "text-slate-700" };
    }
  };

  const getNodeSize = (size: number) => {
    if (size >= 8) return "w-16 h-16 text-xs";
    if (size >= 6) return "w-12 h-12 text-xs";
    if (size >= 4) return "w-10 h-10 text-xs";
    return "w-8 h-8 text-xs";
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "concept": return "💡";
      case "person": return "👤";
      case "location": return "📍";
      case "event": return "⚡";
      case "organization": return "🏢";
      default: return "🔵";
    }
  };

  // Create a simple grid layout for nodes
  const gridCols = Math.ceil(Math.sqrt(nodes.length));
  const gridSize = 120; // Spacing between nodes

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-xl">🧠</span>
        {title}
        <span className="ml-auto text-sm text-slate-500 font-normal">
          {nodes.length} nodes
        </span>
      </h3>

      {/* Graph Container */}
      <div className="relative min-h-[400px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
          {/* Render connections */}
          {nodes.map((node, index) => {
            const x1 = (index % gridCols) * gridSize + 100;
            const y1 = Math.floor(index / gridCols) * gridSize + 100;
            
            return node.connections.map((connectionId) => {
              const connectedIndex = nodes.findIndex(n => n.id === connectionId);
              if (connectedIndex === -1) return null;
              
              const x2 = (connectedIndex % gridCols) * gridSize + 100;
              const y2 = Math.floor(connectedIndex / gridCols) * gridSize + 100;
              
              return (
                <line
                  key={`${node.id}-${connectionId}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={selectedNode === node.id || selectedNode === connectionId ? "#3b82f6" : "#cbd5e1"}
                  strokeWidth={selectedNode === node.id || selectedNode === connectionId ? "2" : "1"}
                  strokeDasharray={selectedNode === node.id || selectedNode === connectionId ? "none" : "4,4"}
                  className="transition-all duration-200"
                />
              );
            });
          })}
        </svg>

        {/* Render nodes */}
        <div className="relative z-10 p-8">
          {nodes.map((node, index) => {
            const colors = getNodeColor(node.type);
            const size = getNodeSize(node.size);
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isConnected = selectedNode && node.connections.includes(selectedNode);
            
            const x = (index % gridCols) * gridSize;
            const y = Math.floor(index / gridCols) * gridSize;

            return (
              <div
                key={node.id}
                className="absolute transition-all duration-200 cursor-pointer transform"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) ${isHovered || isSelected ? 'scale(110)' : 'scale(100)'}`
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  setSelectedNode(selectedNode === node.id ? null : node.id);
                  onNodeClick(node.label);
                }}
              >
                {/* Node Circle */}
                <div className={`
                  ${size} rounded-full ${colors.bg} ${colors.border} border-2 
                  flex items-center justify-center shadow-lg
                  ${isSelected ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
                  ${isConnected ? 'ring-2 ring-green-300 ring-opacity-50' : ''}
                  hover:shadow-xl transition-all duration-200
                `}>
                  <span className="text-white font-bold">
                    {getNodeIcon(node.type)}
                  </span>
                </div>

                {/* Node Label */}
                <div className={`
                  absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                  px-2 py-1 rounded-lg text-xs font-medium text-center
                  ${isSelected || isHovered ? 'bg-white shadow-lg border border-slate-200' : 'bg-slate-800 text-white'}
                  max-w-[100px] truncate transition-all duration-200
                `}>
                  {node.label}
                </div>

                {/* Connection count badge */}
                {node.connections.length > 0 && (
                  <div className={`
                    absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-600 text-white
                    flex items-center justify-center text-xs font-bold
                    ${isSelected || isHovered ? 'bg-blue-600' : ''}
                  `}>
                    {node.connections.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            const colors = getNodeColor(node.type);
            
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getNodeIcon(node.type)}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900">{node.label}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} text-white`}>
                        {node.type}
                      </span>
                      <span>Importance: {node.size}/10</span>
                      <span>{node.connections.length} connections</span>
                    </div>
                  </div>
                </div>

                {/* Connected Nodes */}
                {node.connections.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Connected to:</p>
                    <div className="flex flex-wrap gap-2">
                      {node.connections.map((connId) => {
                        const connectedNode = nodes.find(n => n.id === connId);
                        if (!connectedNode) return null;
                        const connColors = getNodeColor(connectedNode.type);
                        
                        return (
                          <button
                            key={connId}
                            onClick={() => {
                              setSelectedNode(connId);
                              onNodeClick(connectedNode.label);
                            }}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                              ${connColors.bg} text-white hover:opacity-80`}
                          >
                            {getNodeIcon(connectedNode.type)} {connectedNode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <button 
                    onClick={() => onNodeClick(`${node.label} details`)}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    📖 Explore
                  </button>
                  <button 
                    onClick={() => onNodeClick(`${node.label} related`)}
                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔗 Find Related
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-sm font-medium text-slate-700 mb-2">Node Types:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          {["concept", "person", "location", "event", "organization"].map((type) => {
            const colors = getNodeColor(type);
            return (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                <span className="capitalize text-slate-600">{type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}