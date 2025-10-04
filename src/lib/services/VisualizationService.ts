"use client";

import type { DashboardOutput, VisualizationType, DashboardDataPoint } from "@/types";
import { generateMermaidDiagram } from "../../components/charts/MermaidRenderer";

interface VisualizationService {
  enhanceDashboardWithVisuals: (dashboard: DashboardOutput, query: string) => Promise<EnhancedDashboard>;
  generateImagePrompt: (query: string, chartType: VisualizationType) => string;
  generateMermaidForTopic: (query: string, data: DashboardDataPoint[]) => MermaidDiagram[];
  fetchTopicImages: (query: string) => Promise<ImageResult[]>;
}

interface EnhancedDashboard extends Omit<DashboardOutput, 'mermaidDiagrams'> {
  mermaidDiagrams: MermaidDiagram[];
  generatedImages: ImageResult[];
  visualEnhancements: VisualEnhancement[];
  hasComprehensiveVisuals: boolean;
}

interface MermaidDiagram {
  type: 'flowchart' | 'sequence' | 'gantt' | 'pie' | 'journey' | 'mindmap';
  title: string;
  diagram: string;
  description: string;
}

interface ImageResult {
  url: string;
  title: string;
  description: string;
  source: 'generated' | 'search' | 'svg';
  svgCode?: string;
}

interface VisualEnhancement {
  type: 'chart' | 'diagram' | 'infographic' | 'illustration';
  title: string;
  component: string;
  data: DashboardDataPoint[] | Record<string, unknown>;
}

class ComprehensiveVisualizationService implements VisualizationService {
  
  async enhanceDashboardWithVisuals(dashboard: DashboardOutput, query: string): Promise<EnhancedDashboard> {
    console.log('🎨 Enhancing dashboard with comprehensive visuals...');
    
    // Generate multiple mermaid diagrams
    const mermaidDiagrams = this.generateMermaidForTopic(query, dashboard.data);
    
    // Generate or fetch images
    const generatedImages = await this.fetchTopicImages(query);
    
    // Create visual enhancements
    const visualEnhancements = await this.generateVisualEnhancements(dashboard, query);
    
    // Ensure we have comprehensive visuals
    const enhancedDashboard: EnhancedDashboard = {
      ...dashboard,
      mermaidDiagrams,
      generatedImages,
      visualEnhancements,
      hasComprehensiveVisuals: true,
      // Always include an image prompt for generation
      imagePrompt: dashboard.imagePrompt || this.generateImagePrompt(query, dashboard.type)
    };

    console.log(`✅ Enhanced dashboard with ${mermaidDiagrams.length} diagrams, ${generatedImages.length} images, ${visualEnhancements.length} visual enhancements`);
    
    return enhancedDashboard;
  }

  generateImagePrompt(query: string, chartType: VisualizationType): string {
    const basePrompts: Record<string, string> = {
      pie_chart: "Create a modern, professional pie chart infographic",
      bar_chart: "Design a clean bar chart visualization with clear labels",
      line_chart: "Generate a sleek line graph showing trends over time",
      area_chart: "Create a filled area chart with gradient colors",
      scatter_plot: "Design a scatter plot with clear data point visualization",
      radar_chart: "Generate a radar/spider chart with multiple metrics",
      treemap: "Create a hierarchical treemap visualization",
      heatmap: "Design a color-coded heatmap showing data density",
      gauge_chart: "Create a dashboard-style gauge meter visualization",
      funnel_chart: "Generate a conversion funnel diagram",
      analytics_summary: "Create a comprehensive analytics dashboard overview",
      waterfall_chart: "Design a waterfall chart showing sequential changes",
      sankey_diagram: "Create a sankey diagram showing flow relationships",
      bubble_chart: "Generate a bubble chart with multi-dimensional data",
      candlestick_chart: "Design a financial candlestick chart",
      histogram: "Create a histogram distribution chart",
      table: "Generate a professional data table visualization",
      text: "Create a text-based infographic layout",
      timeline: "Design a timeline visualization",
      comparison: "Create a comparison chart or infographic",
      infographic: "Generate a comprehensive infographic design"
    };

    const basePrompt = basePrompts[chartType] || "Create a professional data visualization";
    
    return `${basePrompt} for the topic: "${query}". Use a modern, clean design with blue and purple gradients. Include clear labels, professional typography, and high contrast for readability. Style should be suitable for business presentations with a dark theme aesthetic.`;
  }

  generateMermaidForTopic(query: string, data: DashboardDataPoint[]): MermaidDiagram[] {
    const diagrams: MermaidDiagram[] = [];
    const queryLower = query.toLowerCase();

    // Always include a primary flowchart
    diagrams.push({
      type: 'flowchart',
      title: `${query} - Process Flow`,
      diagram: generateMermaidDiagram('flowchart', data, query),
      description: `Flowchart visualization showing the process and relationships for ${query}`
    });

    // Add specific diagrams based on query context
    if (queryLower.includes('timeline') || queryLower.includes('schedule') || queryLower.includes('project')) {
      diagrams.push({
        type: 'gantt',
        title: `${query} - Timeline`,
        diagram: generateMermaidDiagram('gantt', data, query),
        description: `Timeline visualization for ${query} showing key milestones and phases`
      });
    }

    if (queryLower.includes('user') || queryLower.includes('customer') || queryLower.includes('journey')) {
      diagrams.push({
        type: 'journey',
        title: `${query} - User Journey`,
        diagram: generateMermaidDiagram('journey', data, query),
        description: `User journey map for ${query} showing touchpoints and experiences`
      });
    }

    if (queryLower.includes('sequence') || queryLower.includes('interaction') || queryLower.includes('communication')) {
      diagrams.push({
        type: 'sequence',
        title: `${query} - Sequence Diagram`,
        diagram: generateMermaidDiagram('sequence', data, query),
        description: `Sequence diagram showing interactions and communications for ${query}`
      });
    }

    if (queryLower.includes('concept') || queryLower.includes('relationship') || queryLower.includes('mind')) {
      diagrams.push({
        type: 'mindmap',
        title: `${query} - Mind Map`,
        diagram: generateMermaidDiagram('mindmap', data, query),
        description: `Mind map showing concepts and relationships for ${query}`
      });
    }

    // Add pie chart if we have numerical data
    if (data && data.length > 0 && data.some(item => typeof item.value === 'number')) {
      diagrams.push({
        type: 'pie',
        title: `${query} - Distribution`,
        diagram: generateMermaidDiagram('pie', data, query),
        description: `Pie chart showing data distribution for ${query}`
      });
    }

    return diagrams;
  }

  async fetchTopicImages(query: string): Promise<ImageResult[]> {
    try {
      const images: ImageResult[] = [];
      
      // Generate SVG diagrams
      const svgDiagrams = this.generateSVGVisualizations(query);
      images.push(...svgDiagrams);

      // Try to generate image with API
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            style: 'infographic',
            aspectRatio: '16:9'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.imageData?.svgCode) {
            images.push({
              url: `data:image/svg+xml;base64,${this.safeBase64Encode(result.imageData.svgCode)}`,
              title: `Generated Visualization: ${query}`,
              description: result.imageData.description || `AI-generated visualization for ${query}`,
              source: 'generated',
              svgCode: result.imageData.svgCode
            });
          }
        }
      } catch (error) {
        console.warn('Image generation failed, using SVG fallback:', error);
      }

      // Add conceptual illustrations
      const conceptualImages = this.generateConceptualVisualizations(query);
      images.push(...conceptualImages);

      return images;
    } catch (error) {
      console.error('Error fetching topic images:', error);
      return this.generateSVGVisualizations(query); // Fallback to SVG
    }
  }

  private generateSVGVisualizations(query: string): ImageResult[] {
    const images: ImageResult[] = [];
    
    // Generate different types of SVG visualizations
    const svgTypes = [
      { type: 'infographic', title: 'Infographic Overview' },
      { type: 'diagram', title: 'Conceptual Diagram' },
      { type: 'flowchart', title: 'Process Flow' }
    ];

    svgTypes.forEach(({ type, title }) => {
      const svg = this.generateCustomSVG(query, type);
      // Use proper Unicode-safe base64 encoding
      const base64Svg = this.safeBase64Encode(svg);
      
      images.push({
        url: `data:image/svg+xml;base64,${base64Svg}`,
        title: `${title}: ${query}`,
        description: `Custom ${type} visualization for ${query}`,
        source: 'svg',
        svgCode: svg
      });
    });

    return images;
  }

  private generateConceptualVisualizations(query: string): ImageResult[] {
    const queryLower = query.toLowerCase();
    const conceptualSVGs: ImageResult[] = [];

    // Generate concept-specific visualizations
    if (queryLower.includes('architecture') || queryLower.includes('system')) {
      const architectureSVG = this.generateArchitectureSVG(query);
      conceptualSVGs.push({
        url: `data:image/svg+xml;base64,${this.safeBase64Encode(architectureSVG)}`,
        title: `Architecture Overview: ${query}`,
        description: `System architecture visualization for ${query}`,
        source: 'svg',
        svgCode: architectureSVG
      });
    }

    if (queryLower.includes('comparison') || queryLower.includes('vs')) {
      const comparisonSVG = this.generateComparisonSVG(query);
      conceptualSVGs.push({
        url: `data:image/svg+xml;base64,${this.safeBase64Encode(comparisonSVG)}`,
        title: `Comparison Chart: ${query}`,
        description: `Side-by-side comparison for ${query}`,
        source: 'svg',
        svgCode: comparisonSVG
      });
    }

    return conceptualSVGs;
  }

  private async generateVisualEnhancements(dashboard: DashboardOutput, query: string): Promise<VisualEnhancement[]> {
    const enhancements: VisualEnhancement[] = [];

    // Always add the main chart as an enhancement
    enhancements.push({
      type: 'chart',
      title: `Primary Visualization: ${dashboard.title}`,
      component: 'ChartManager',
      data: dashboard.data
    });

    // Add infographic enhancement
    enhancements.push({
      type: 'infographic',
      title: `Infographic: ${query}`,
      component: 'InfographicRenderer',
      data: {
        topic: query,
        keyMetrics: this.extractKeyMetrics(dashboard.data),
        visualStyle: 'modern'
      }
    });

    // Add diagram enhancement based on query
    const diagramType = this.determineBestDiagramType(query);
    enhancements.push({
      type: 'diagram',
      title: `${diagramType.title}: ${query}`,
      component: 'MermaidRenderer',
      data: {
        diagram: generateMermaidDiagram(diagramType.type, dashboard.data, query),
        title: diagramType.title
      }
    });

    return enhancements;
  }

  private extractKeyMetrics(data: DashboardDataPoint[]): Record<string, string | number> {
    if (!data || data.length === 0) return {};

    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const average = total / data.length;
    const max = Math.max(...data.map(d => d.value || 0));
    const min = Math.min(...data.map(d => d.value || 0));

    return {
      total: total.toLocaleString(),
      average: average.toFixed(2),
      maximum: max.toLocaleString(),
      minimum: min.toLocaleString(),
      count: data.length
    };
  }

  private determineBestDiagramType(query: string): { type: string, title: string } {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('process') || queryLower.includes('workflow')) {
      return { type: 'flowchart', title: 'Process Flow' };
    }
    if (queryLower.includes('timeline') || queryLower.includes('schedule')) {
      return { type: 'gantt', title: 'Timeline' };
    }
    if (queryLower.includes('user') || queryLower.includes('journey')) {
      return { type: 'journey', title: 'User Journey' };
    }
    if (queryLower.includes('relationship') || queryLower.includes('mind')) {
      return { type: 'mindmap', title: 'Concept Map' };
    }

    return { type: 'flowchart', title: 'Overview Diagram' };
  }

  private generateCustomSVG(query: string, type: string): string {
    const width = 800;
    const height = 600;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Dark background with gradient
    svg += `<defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>`;
    
    svg += `<rect width="${width}" height="${height}" fill="url(#bgGradient)" rx="20"/>`;
    
    // Title
    svg += `<text x="400" y="60" text-anchor="middle" fill="white" font-size="32" font-weight="bold">${query}</text>`;
    svg += `<text x="400" y="90" text-anchor="middle" fill="#94a3b8" font-size="16">${type.toUpperCase()} VISUALIZATION</text>`;
    
    // Create different layouts based on type
    switch (type) {
      case 'infographic':
        svg += this.generateInfographicElements();
        break;
      case 'diagram':
        svg += this.generateDiagramElements();
        break;
      case 'flowchart':
        svg += this.generateFlowchartElements();
        break;
    }
    
    svg += '</svg>';
    return svg;
  }

  private generateInfographicElements(): string {
    let elements = '';
    
    // Central icon
    elements += `<circle cx="400" cy="300" r="80" fill="url(#accentGradient)" opacity="0.2"/>`;
    elements += `<circle cx="400" cy="300" r="60" fill="url(#accentGradient)" opacity="0.6"/>`;
    elements += `<circle cx="400" cy="300" r="40" fill="url(#accentGradient)"/>`;
    
    // Surrounding elements with SVG-safe icons
    const positions = [
      { x: 200, y: 200, icon: 'CHART', color: '#0ea5e9' },
      { x: 600, y: 200, icon: 'TREND', color: '#14b8a6' },
      { x: 200, y: 400, icon: 'IDEA', color: '#f97316' },
      { x: 600, y: 400, icon: 'TARGET', color: '#8b5cf6' }
    ];
    
    positions.forEach((pos) => {
      elements += `<circle cx="${pos.x}" cy="${pos.y}" r="50" fill="#334155" stroke="${pos.color}" stroke-width="3"/>`;
      elements += `<text x="${pos.x}" y="${pos.y + 6}" text-anchor="middle" fill="${pos.color}" font-size="14" font-weight="bold">${pos.icon}</text>`;
      
      // Connect to center
      elements += `<line x1="${pos.x}" y1="${pos.y}" x2="400" y2="300" stroke="#64748b" stroke-width="2" opacity="0.5"/>`;
    });
    
    return elements;
  }

  private generateDiagramElements(): string {
    let elements = '';
    
    // Create connected boxes
    const boxes = [
      { x: 150, y: 180, width: 120, height: 80, text: 'Input' },
      { x: 340, y: 180, width: 120, height: 80, text: 'Process' },
      { x: 530, y: 180, width: 120, height: 80, text: 'Output' },
      { x: 245, y: 320, width: 120, height: 80, text: 'Feedback' }
    ];
    
    boxes.forEach((box, index) => {
      const color = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316'][index];
      elements += `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="${color}" rx="10" opacity="0.8"/>`;
      elements += `<text x="${box.x + box.width/2}" y="${box.y + box.height/2 + 6}" text-anchor="middle" fill="white" font-size="16" font-weight="600">${box.text}</text>`;
    });
    
    // Add arrows
    elements += `<path d="M 270 220 L 340 220" stroke="white" stroke-width="3" marker-end="url(#arrowhead)"/>`;
    elements += `<path d="M 460 220 L 530 220" stroke="white" stroke-width="3" marker-end="url(#arrowhead)"/>`;
    elements += `<path d="M 590 260 Q 650 300 590 340 Q 530 380 470 340 Q 410 300 450 260" stroke="white" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>`;
    
    // Arrow marker
    elements += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="white"/></marker></defs>`;
    
    return elements;
  }

  private generateFlowchartElements(): string {
    let elements = '';
    
    // Decision diamond
    elements += `<polygon points="400,160 480,220 400,280 320,220" fill="#f97316" opacity="0.8"/>`;
    elements += `<text x="400" y="226" text-anchor="middle" fill="white" font-size="14" font-weight="600">Decision</text>`;
    
    // Yes/No paths
    elements += `<rect x="150" y="340" width="100" height="60" fill="#14b8a6" rx="10" opacity="0.8"/>`;
    elements += `<text x="200" y="376" text-anchor="middle" fill="white" font-size="14" font-weight="600">Action A</text>`;
    
    elements += `<rect x="550" y="340" width="100" height="60" fill="#ef4444" rx="10" opacity="0.8"/>`;
    elements += `<text x="600" y="376" text-anchor="middle" fill="white" font-size="14" font-weight="600">Action B</text>`;
    
    // Connecting lines
    elements += `<path d="M 360 260 L 200 340" stroke="white" stroke-width="2" marker-end="url(#arrowhead)"/>`;
    elements += `<path d="M 440 260 L 600 340" stroke="white" stroke-width="2" marker-end="url(#arrowhead)"/>`;
    
    // Labels
    elements += `<text x="280" y="300" fill="#14b8a6" font-size="14" font-weight="600">YES</text>`;
    elements += `<text x="520" y="300" fill="#ef4444" font-size="14" font-weight="600">NO</text>`;
    
    return elements;
  }

  private generateArchitectureSVG(query: string): string {
    // Generate system architecture diagram
    return this.generateCustomSVG(query, 'architecture');
  }

  private generateComparisonSVG(query: string): string {
    // Generate comparison chart
    return this.generateCustomSVG(query, 'comparison');
  }

  private safeBase64Encode(str: string): string {
    try {
      // For browser environment, use TextEncoder for Unicode safety
      if (typeof window !== 'undefined' && typeof TextEncoder !== 'undefined') {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
        return btoa(binaryString);
      }
      
      // For Node.js environment, use Buffer (which handles Unicode properly)
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'utf8').toString('base64');
      }
      
      // Fallback: try to handle Unicode with btoa
      // First encode as UTF-8, then base64
      const utf8Encoded = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      });
      return btoa(utf8Encoded);
      
    } catch (error) {
      console.warn('Base64 encoding failed, using fallback:', error);
      // Last resort: remove problematic characters and try again
      const cleanStr = str.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII
      return btoa(cleanStr);
    }
  }
}

// Export singleton instance
export const visualizationService = new ComprehensiveVisualizationService();

// Export types
export type {
  EnhancedDashboard,
  MermaidDiagram,
  ImageResult,
  VisualEnhancement
};