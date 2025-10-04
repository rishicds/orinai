"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import type { DashboardOutput } from "@/types";
import { InteractiveInfobox } from "../wiki/InteractiveInfobox";
import { KnowledgeGraph } from "../wiki/KnowledgeGraph";
import { WikiModeToggle } from "../wiki/WikiModeToggle";
import { TermHighlight } from "../wiki/TermHighlight";
import { ChartManager } from "../charts/ChartManager";
import { MermaidRenderer } from "../charts/MermaidRenderer";
import { SublinksPanel, generateEnhancedSublinks } from "./SublinksPanel";
import { type EnhancedDashboard, type ImageResult, type MermaidDiagram } from "../../lib/services/VisualizationService";

const HEADING_KEYS = ["heading", "title", "label", "name", "category"] as const;
const PARAGRAPH_KEYS = ["description", "summary", "text", "content", "body", "details"] as const;
const LIST_KEYS = ["bullets", "points", "items", "highlights", "list", "entries"] as const;

type TextBlock = Record<string, unknown>;
type WikiMode = "simple" | "detailed" | "interactive";

function pickFirstString(block: TextBlock, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = block[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function toBulletStrings(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  if (value.every((entry) => typeof entry === "string")) {
    return value as string[];
  }

  if (value.every((entry) => typeof entry === "number")) {
    return (value as number[]).map((num) => num.toString());
  }

  if (value.every((entry) => entry && typeof entry === "object")) {
    return (value as Array<Record<string, unknown>>)
      .map((entry) => {
        const label = pickFirstString(entry, ["label", "title", "name"]);
        const desc = pickFirstString(entry, ["description", "text", "summary", "details"]);
        const rawValue = entry.value;

        if (label && desc) {
          const statement = `${label} – ${desc}`.trim();
          return statement.length > 0 ? statement : undefined;
        }

        if (label && (typeof rawValue === "string" || typeof rawValue === "number")) {
          const valueText = typeof rawValue === "number" ? rawValue.toLocaleString() : rawValue;
          const statement = `${label}: ${valueText}`.trim();
          return statement.length > 0 ? statement : undefined;
        }

        if (typeof desc === "string") {
          const statement = desc.trim();
          return statement.length > 0 ? statement : undefined;
        }

        return undefined;
      })
      .filter((item): item is string => typeof item === "string");
  }

  return undefined;
}

function pickList(block: TextBlock): string[] | undefined {
  for (const key of LIST_KEYS) {
    const value = block[key];
    const list = toBulletStrings(value);
    if (list && list.length > 0) {
      return list;
    }
  }
  return undefined;
}

interface WikiRendererProps {
  dashboard: DashboardOutput;
  onSubsectionRequest?: (query: string) => void;
}

export function WikiRenderer({ dashboard, onSubsectionRequest }: WikiRendererProps) {
  const [wikiMode, setWikiMode] = useState<WikiMode>("interactive");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [hoveredTerm] = useState<string | null>(null);
  const [enhancedDashboard, setEnhancedDashboard] = useState<EnhancedDashboard | null>(null);
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);

  // Enhance dashboard with comprehensive visuals
  useEffect(() => {
    // Temporarily disabled to prevent infinite rendering
    // Will be re-enabled after fixing the visualization service
    setEnhancedDashboard({
      ...dashboard,
      mermaidDiagrams: [],
      generatedImages: [],
      visualEnhancements: [],
      hasComprehensiveVisuals: false
    });
    setIsLoadingVisuals(false);
  }, [dashboard]); // Include full dashboard dependency

  const blocks = Array.isArray(dashboard.data)
    ? dashboard.data.filter((entry): entry is TextBlock => !!entry && typeof entry === "object")
    : [];

  const hasImage = typeof dashboard.imageUrl === "string" && dashboard.imageUrl.length > 0;

  const toggleSection = useCallback((index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSubsectionClick = useCallback((topic: string) => {
    if (onSubsectionRequest) {
      onSubsectionRequest(`Detailed explanation of ${topic} in the context of ${dashboard.title}`);
    }
  }, [onSubsectionRequest, dashboard.title]);

  // Extract infobox data from the first block or dashboard metadata
  const infoboxData = {
    title: dashboard.title,
    image: dashboard.imageUrl,
    facts: blocks[0] ? Object.entries(blocks[0])
      .filter(([key, value]) => 
        !(HEADING_KEYS as readonly string[]).includes(key) && 
        !(PARAGRAPH_KEYS as readonly string[]).includes(key) && 
        !(LIST_KEYS as readonly string[]).includes(key) &&
        (typeof value === "string" || typeof value === "number")
      )
      .slice(0, 6)
      .map(([key, value]) => ({ 
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: typeof value === "number" ? value.toLocaleString() : value as string
      })) : []
  };

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, rgba(215, 153, 34, 0.1) 0%, rgba(255, 254, 43, 0.05) 25%, rgba(241, 60, 32, 0.05) 50%, rgba(64, 86, 161, 0.1) 75%, rgba(197, 203, 227, 0.05) 100%)'
      }}>
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/20"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)'
        }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white"
                  style={{ 
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                  }}>
                  {dashboard.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                  }}>
                  {wikiMode === "interactive" ? "🎯 Interactive Mode" : 
                   wikiMode === "detailed" ? "📖 Detailed View" : "⚡ Simple View"}
                </p>
              </div>
            </div>
            
            <WikiModeToggle currentMode={wikiMode} onModeChange={setWikiMode} />
          </div>
        </div>
      </header>
      
      {/* Summary Section */}
      {dashboard.summary && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
            }}>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"
                style={{
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                }}></div>
              <div className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-lg"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                }}>
                <TermHighlight 
                  content={dashboard.summary} 
                  terms={[]}
                  onTermClick={handleSubsectionClick}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Content Navigation Sidebar */}
          {blocks.length > 1 && wikiMode !== "simple" && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-2xl backdrop-blur-xl border border-white/20 p-6"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-wider"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                      letterSpacing: '0.05em'
                    }}>
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Contents
                  </h3>
                  <nav className="space-y-3">
                    {blocks.map((block, index) => {
                      const heading = pickFirstString(block, HEADING_KEYS);
                      if (!heading) return null;
                      const isActive = activeSection === index;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveSection(index);
                            document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                            if (!expandedSections.has(index)) {
                              toggleSection(index);
                            }
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left group hover:scale-[1.02] transform"
                          style={isActive ? {
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(102, 126, 234, 0.2), 0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                          } : {
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)',
                            border: '1px solid transparent'
                          }}
                        >
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{
                              background: isActive 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                                : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                              color: isActive ? '#667eea' : '#64748b'
                            }}>
                            {index + 1}
                          </span>
                          <span className={`text-sm font-bold truncate ${
                            isActive 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-slate-700 dark:text-slate-300 group-hover:text-purple-600'
                          }`}
                            style={{ 
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                            }}>
                            {heading}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content Area */}
          <div className={`${blocks.length > 1 && wikiMode !== "simple" ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="space-y-8">

              {/* Featured Image */}
              {hasImage && (
                <div className="relative group">
                  <div className="overflow-hidden rounded-3xl border border-white/20 backdrop-blur-xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                    }}>
                    <div className="aspect-video relative">
                      <Image
                        src={dashboard.imageUrl!}
                        alt={dashboard.imagePrompt || dashboard.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-700 rounded-3xl"
                        priority={false}
                        unoptimized={dashboard.imageUrl!.startsWith('data:')}
                        onError={(e) => {
                          console.error('Image failed to load:', dashboard.imageUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />
                    </div>
                    {dashboard.imagePrompt && (
                      <div className="p-6 backdrop-blur-xl border-t border-white/10"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                        }}>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium"
                          style={{ 
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                          }}>
                          {dashboard.imagePrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visualizations Section - Only show if we have actual diagrams */}
              {enhancedDashboard && (enhancedDashboard.mermaidDiagrams.length > 0 || enhancedDashboard.generatedImages.length > 0) && (
                <div className="space-y-6">
                  {/* Loading indicator */}
                  {isLoadingVisuals && (
                    <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                      }}>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-6 h-6 border-2 border-purple-300/50 border-t-purple-600 rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-bold"
                          style={{ 
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                          }}>
                          Generating visualizations...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Generated Images */}
                  {enhancedDashboard.generatedImages.length > 0 && (
                    <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                      }}>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4"
                        style={{ 
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                        }}>
                        <div className="w-8 h-8 rounded-2xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }}>
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        Generated Visualizations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {enhancedDashboard.generatedImages.map((image: ImageResult, index: number) => (
                          <div key={index} className="group cursor-pointer">
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                              <div className="aspect-video relative">
                                <Image 
                                  src={image.url} 
                                  alt={image.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  unoptimized={true}
                                  onError={(e) => {
                                    console.error('Generated image failed to load:', image.url);
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<div class="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm">Image failed to load</div>`;
                                    }
                                  }}
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-medium text-white text-sm mb-1">{image.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2">{image.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mermaid Diagrams */}
                  {enhancedDashboard.mermaidDiagrams.length > 0 && (
                    <div className="bg-slate-900/30 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        Interactive Diagrams
                      </h3>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {enhancedDashboard.mermaidDiagrams.map((diagram: MermaidDiagram, index: number) => (
                          <MermaidRenderer 
                            key={index}
                            diagram={diagram.diagram}
                            title={diagram.title}
                            className="h-64"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content Sections */}
              {blocks.length > 0 && (
                <div className="space-y-6">
                  {blocks.map((block, index) => {
                    const heading = pickFirstString(block, HEADING_KEYS);
                    const paragraph = pickFirstString(block, PARAGRAPH_KEYS);
                    const bullets = pickList(block);
                    const isExpanded = expandedSections.has(index);

                    if (!heading && !paragraph && (!bullets || bullets.length === 0)) {
                      return null;
                    }

                    return (
                      <div key={index} id={`section-${index}`} className="scroll-mt-24">
                        <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8 transition-all duration-300 hover:scale-[1.01] transform"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                          }}>
                          {heading && (
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4"
                                style={{ 
                                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                                }}>
                                <span className="w-8 h-8 rounded-2xl flex items-center justify-center text-sm text-white font-black"
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                                  }}>
                                  {index + 1}
                                </span>
                                {heading}
                              </h2>
                              {wikiMode !== "simple" && (
                                <button
                                  onClick={() => toggleSection(index)}
                                  className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 transform"
                                  style={{
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)'
                                  }}
                                >
                                  <svg 
                                    className={`w-5 h-5 text-purple-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                          
                          {(wikiMode === "simple" || isExpanded) && (
                            <div className="space-y-6">
                              {paragraph && (
                                <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg font-medium"
                                  style={{ 
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                                  }}>
                                  <TermHighlight 
                                    content={paragraph} 
                                    terms={[]}
                                    onTermClick={handleSubsectionClick}
                                  />
                                </div>
                              )}
                              
                              {bullets && bullets.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {bullets.map((bullet, bulletIndex) => (
                                    <div key={bulletIndex} className="flex items-start gap-4 p-5 rounded-2xl border border-white/10"
                                      style={{
                                        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)'
                                      }}>
                                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"
                                        style={{
                                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                                        }}></div>
                                      <span className="text-slate-700 dark:text-slate-300 text-base font-medium leading-relaxed"
                                        style={{ 
                                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                          fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                                        }}>
                                        <TermHighlight 
                                          content={bullet} 
                                          terms={[]}
                                          onTermClick={handleSubsectionClick}
                                        />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Data Visualization Section */}
              {wikiMode !== "simple" && dashboard.data && dashboard.data.length > 0 && (
                <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                  }}>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                    }}>
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    {wikiMode === "interactive" ? "Interactive Analytics" : "Data Insights"}
                  </h3>
                  <div className="rounded-2xl p-6 border border-white/10"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                    <ChartManager dashboard={dashboard} />
                  </div>
                </div>
              )}

              {/* Explore More Section */}
              <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-8"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
                }}>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4"
                  style={{ 
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                  }}>
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  Explore Further
                </h3>
                
                <div className="mb-6">
                  <SublinksPanel 
                    sublinks={generateEnhancedSublinks(dashboard.title, dashboard.data)} 
                    onSubsectionRequest={onSubsectionRequest}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Deep Dive", "Related Topics", "Latest Research", "Applications", "Case Studies", "Expert Analysis", "Future Trends", "Resources"].map((label) => (
                    <button
                      key={label}
                      onClick={() => handleSubsectionClick(label)}
                      className="group p-4 rounded-2xl transition-all duration-300 hover:scale-105 transform border border-white/10 hover:border-purple-300/30"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-purple-600">
                        <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:bg-purple-400"
                          style={{
                            boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)'
                          }}></div>
                        <span className="text-sm font-bold"
                          style={{ 
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                          }}>
                          {label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Quick Info Sidebar - Only show in interactive mode */}
        {wikiMode === "interactive" && (
          <div className="fixed top-24 right-6 w-80 z-40 hidden xl:block">
            <div className="rounded-3xl backdrop-blur-xl border border-white/20 p-6 space-y-6"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)'
              }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
                  }}>
                  Quick Info
                </h3>
              </div>
              
              <InteractiveInfobox data={infoboxData} />
              
              <div className="pt-3 border-t border-slate-700/50">
                <KnowledgeGraph 
                  nodes={[]}
                  title={`Knowledge Graph`}
                  onNodeClick={handleSubsectionClick} 
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Floating Term Definition Popup */}
      {hoveredTerm && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-slate-900/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-2xl p-4 z-50">
          <h4 className="font-semibold text-white mb-2">{hoveredTerm}</h4>
          <p className="text-sm text-slate-300 mb-3">Interactive definition would appear here with AI-generated content.</p>
          <button 
            onClick={() => handleSubsectionClick(hoveredTerm)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            Learn more
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}