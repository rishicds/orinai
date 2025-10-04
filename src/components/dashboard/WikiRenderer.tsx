"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import type { DashboardOutput } from "@/types";
import { InteractiveInfobox } from "../wiki/InteractiveInfobox";
import { ExpandableSection } from "../wiki/ExpandableSection";
import { InteractiveTimeline } from "../wiki/InteractiveTimeline";
import { KnowledgeGraph } from "../wiki/KnowledgeGraph";
import { WikiModeToggle } from "../wiki/WikiModeToggle";
import { CitationPreview } from "../wiki/CitationPreview";
import { TermHighlight } from "../wiki/TermHighlight";
import { ChartManager } from "../charts/ChartManager";
import { MermaidRenderer } from "../charts/MermaidRenderer";
import { SublinksPanel, generateEnhancedSublinks } from "./SublinksPanel";
import { visualizationService, type EnhancedDashboard, type ImageResult, type MermaidDiagram } from "../../lib/services/VisualizationService";

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
  const [wikiMode, setWikiMode] = useState<WikiMode>("detailed");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [hoveredTerm] = useState<string | null>(null);
  const [enhancedDashboard, setEnhancedDashboard] = useState<EnhancedDashboard | null>(null);
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);

  // Enhance dashboard with comprehensive visuals
  useEffect(() => {
    const enhanceDashboard = async () => {
      if (!dashboard.title) return;
      
      setIsLoadingVisuals(true);
      try {
        const enhanced = await visualizationService.enhanceDashboardWithVisuals(
          dashboard, 
          dashboard.title
        );
        setEnhancedDashboard(enhanced);
      } catch (error) {
        console.error('Error enhancing dashboard with visuals:', error);
        // Fallback to original dashboard structure
        setEnhancedDashboard({
          ...dashboard,
          mermaidDiagrams: [],
          generatedImages: [],
          visualEnhancements: [],
          hasComprehensiveVisuals: false
        });
      }
      setIsLoadingVisuals(false);
    };

    enhanceDashboard();
  }, [dashboard]);

  const blocks = Array.isArray(dashboard.data)
    ? dashboard.data.filter((entry): entry is TextBlock => !!entry && typeof entry === "object")
    : [];

  const hasImage = typeof dashboard.imageUrl === "string" && dashboard.imageUrl.length > 0;
  const hasCitations = Array.isArray(dashboard.citations) && dashboard.citations.length > 0;

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
    <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      {/* Wiki Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{dashboard.title}</h1>
              <p className="text-sm text-slate-600">Interactive AI Wiki</p>
            </div>
          </div>
          
          <WikiModeToggle currentMode={wikiMode} onModeChange={setWikiMode} />
        </div>

        {dashboard.summary && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <TermHighlight 
                content={dashboard.summary} 
                terms={[]}
                onTermClick={handleSubsectionClick}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Table of Contents */}
            {blocks.length > 1 && wikiMode !== "simple" && (
              <div className="mb-8 bg-slate-50 rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Contents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blocks.map((block, index) => {
                    const heading = pickFirstString(block, HEADING_KEYS);
                    if (!heading) return null;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                          if (!expandedSections.has(index)) {
                            toggleSection(index);
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                      >
                        <span className="text-sm text-slate-500 group-hover:text-blue-600">{index + 1}.</span>
                        <span className="text-sm text-slate-700 group-hover:text-blue-800 font-medium">{heading}</span>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured Image */}
            {hasImage && (
              <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-lg">
                <Image
                  src={dashboard.imageUrl!}
                  alt={dashboard.imagePrompt || dashboard.title}
                  width={1024}
                  height={576}
                  className="h-auto w-full object-cover"
                  priority={false}
                />
                {dashboard.imagePrompt && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-sm text-slate-600 italic">{dashboard.imagePrompt}</p>
                  </div>
                )}
              </div>
            )}

            {/* Comprehensive Visualizations Section */}
            {enhancedDashboard && (
              <div className="mb-8 space-y-6">
                {/* Loading indicator */}
                {isLoadingVisuals && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-slate-600">Generating comprehensive visualizations...</span>
                    </div>
                  </div>
                )}

                {/* Generated Images */}
                {enhancedDashboard.generatedImages.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      🎨 Generated Visualizations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enhancedDashboard.generatedImages.map((image: ImageResult, index: number) => (
                        <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                          <Image 
                            src={image.url} 
                            alt={image.title}
                            width={400}
                            height={192}
                            className="w-full h-48 object-cover"
                            unoptimized={true}
                          />
                          <div className="p-3">
                            <h4 className="font-medium text-slate-900 text-sm">{image.title}</h4>
                            <p className="text-xs text-slate-600 mt-1">{image.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mermaid Diagrams */}
                {enhancedDashboard.mermaidDiagrams.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      📊 Interactive Diagrams
                    </h3>
                    <div className="space-y-4">
                      {enhancedDashboard.mermaidDiagrams.map((diagram: MermaidDiagram, index: number) => (
                        <MermaidRenderer 
                          key={index}
                          diagram={diagram.diagram}
                          title={diagram.title}
                          className="border border-slate-200 rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Enhancements Status */}
                {enhancedDashboard.hasComprehensiveVisuals && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-800 font-medium">Comprehensive Visual Coverage Active</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      This response includes {enhancedDashboard.mermaidDiagrams.length} diagrams, 
                      {enhancedDashboard.generatedImages.length} images, and interactive charts.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content Sections */}
            {blocks.length > 0 && (
              <div className="space-y-8">
                {blocks.map((block, index) => {
                  const heading = pickFirstString(block, HEADING_KEYS);
                  const paragraph = pickFirstString(block, PARAGRAPH_KEYS);
                  const bullets = pickList(block);
                  const isExpanded = expandedSections.has(index);

                  if (!heading && !paragraph && (!bullets || bullets.length === 0)) {
                    return null;
                  }

                  return (
                    <ExpandableSection
                      key={index}
                      id={`section-${index}`}
                      heading={heading}
                      paragraph={paragraph}
                      bullets={bullets}
                      isExpanded={isExpanded}
                      onToggle={() => toggleSection(index)}
                      onSubsectionClick={handleSubsectionClick}
                      mode={wikiMode}
                      index={index}
                    />
                  );
                })}
              </div>
            )}

            {/* Interactive Timeline */}
            {dashboard.type === "timeline" && (
              <div className="mt-12">
                <InteractiveTimeline 
                  events={[]}
                  title="Timeline"
                  onEventClick={handleSubsectionClick}
                />
              </div>
            )}

            {/* Citations Section */}
            {hasCitations && (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  References & Sources
                </h3>
                <div className="grid gap-4">
                  <CitationPreview
                    citations={dashboard.citations!.map(citation => ({
                      id: citation.url,
                      title: citation.title,
                      url: citation.url,
                      type: "website" as const,
                      excerpt: citation.snippet
                    }))}
                    onCitationClick={(citation) => {
                      if (citation.url) {
                        window.open(citation.url, '_blank');
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Data Visualization Section */}
            {dashboard.data && dashboard.data.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Interactive Data Visualization
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <ChartManager dashboard={dashboard} />
                </div>
              </div>
            )}

            {/* Enhanced Sublinks Panel */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <SublinksPanel 
                sublinks={generateEnhancedSublinks(dashboard.title, dashboard.data)} 
                onSubsectionRequest={onSubsectionRequest}
              />
            </div>

            {/* Explore More Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Explore Related Topics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Learn More", "Related Articles", "Deep Dive", "External Resources", "History", "Current Research", "Applications", "Future Prospects"].map((label) => (
                  <button
                    key={label}
                    onClick={() => handleSubsectionClick(label)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium transition-all hover:shadow-md hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Infobox & Knowledge Graph */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <InteractiveInfobox data={infoboxData} />
            <KnowledgeGraph 
              nodes={[]}
              title={`${dashboard.title} Knowledge Graph`}
              onNodeClick={handleSubsectionClick} 
            />
          </div>
        </div>
      </div>

      {/* Floating Term Definition Popup */}
      {hoveredTerm && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50">
          <h4 className="font-semibold text-slate-900 mb-2">{hoveredTerm}</h4>
          <p className="text-sm text-slate-600">Interactive definition would appear here with AI-generated content.</p>
          <button 
            onClick={() => handleSubsectionClick(hoveredTerm)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Learn more →
          </button>
        </div>
      )}
    </div>
  );
}