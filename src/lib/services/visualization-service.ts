import type { DashboardOutput, VisualizationType } from "@/types";

export interface ImageGenerationConfig {
  topic: string;
  style: "technical" | "infographic" | "artistic" | "diagram";
  width?: number;
  height?: number;
}

export interface MermaidDiagramConfig {
  type: "flowchart" | "sequence" | "gantt" | "pie" | "mindmap" | "timeline";
  data: Record<string, unknown>[];
  title: string;
}

export class VisualizationService {
  private static instance: VisualizationService;

  static getInstance(): VisualizationService {
    if (!this.instance) {
      this.instance = new VisualizationService();
    }
    return this.instance;
  }

  // Generate image using Gemini 2.5 Flash Image
  async generateImage(config: ImageGenerationConfig): Promise<string | null> {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: this.createImagePrompt(config),
          style: config.style,
          width: config.width || 512,
          height: config.height || 512,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image generation failed:', error);
      return null;
    }
  }

  // Fetch relevant images from external APIs
  async fetchTopicImages(topic: string): Promise<string[]> {
    try {
      const response = await fetch('/api/fetch-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      return data.images || [];
    } catch (error) {
      console.error('Image fetching failed:', error);
      return [];
    }
  }

  // Generate mermaid diagram syntax
  generateMermaidDiagram(config: MermaidDiagramConfig): string {
    switch (config.type) {
      case "flowchart":
        return this.generateFlowchart(config.data, config.title);
      case "pie":
        return this.generatePieChart(config.data, config.title);
      case "mindmap":
        return this.generateMindmap(config.data, config.title);
      case "timeline":
        return this.generateTimeline(config.data, config.title);
      case "gantt":
        return this.generateGantt(config.data, config.title);
      default:
        return this.generateFlowchart(config.data, config.title);
    }
  }

  // Enhanced dashboard output with all visualization types
  async enhanceDashboard(dashboard: DashboardOutput): Promise<DashboardOutput> {
    const enhanced = { ...dashboard };

    // Always include an image
    if (!enhanced.imageUrl) {
      const generatedImage = await this.generateImage({
        topic: dashboard.title,
        style: "infographic"
      });
      
      if (generatedImage) {
        enhanced.imageUrl = generatedImage;
        enhanced.imagePrompt = this.createImagePrompt({
          topic: dashboard.title,
          style: "infographic"
        });
      } else {
        // Fallback to fetched images
        const fetchedImages = await this.fetchTopicImages(dashboard.title);
        if (fetchedImages.length > 0) {
          enhanced.imageUrl = fetchedImages[0];
        }
      }
    }

    // Always include mermaid diagrams
    enhanced.mermaidDiagrams = this.generateAllMermaidDiagrams(dashboard);

    // Ensure charts are always present
    enhanced.charts = this.generateMultipleCharts(dashboard);

    return enhanced;
  }

  private createImagePrompt(config: ImageGenerationConfig): string {
    const styleMap = {
      technical: "technical diagram, clean lines, professional",
      infographic: "colorful infographic style, data visualization",
      artistic: "artistic interpretation, creative visualization",
      diagram: "clear diagram, educational, schematic"
    };

    return `Create a ${styleMap[config.style]} about ${config.topic}. Make it visually appealing and informative.`;
  }

  private generateFlowchart(data: Record<string, unknown>[], title: string): string {
    let mermaid = `flowchart TD\n    Start([${title}])\n`;
    
    data.forEach((item, index) => {
      const label = item.label || item.name || `Step ${index + 1}`;
      mermaid += `    A${index}[${label}]\n`;
      if (index > 0) {
        mermaid += `    A${index - 1} --> A${index}\n`;
      } else {
        mermaid += `    Start --> A${index}\n`;
      }
    });

    return mermaid;
  }

  private generatePieChart(data: Record<string, unknown>[], title: string): string {
    let mermaid = `pie title ${title}\n`;
    
    data.forEach(item => {
      const label = item.label || item.name || 'Unknown';
      const value = Number(item.value) || 0;
      mermaid += `    "${label}" : ${value}\n`;
    });

    return mermaid;
  }

  private generateMindmap(data: Record<string, unknown>[], title: string): string {
    let mermaid = `mindmap\n  root((${title}))\n`;
    
    data.slice(0, 8).forEach(item => {
      const label = item.label || item.name || 'Item';
      mermaid += `    ${label}\n`;
    });

    return mermaid;
  }

  private generateTimeline(data: Record<string, unknown>[], title: string): string {
    let mermaid = `timeline\n    title ${title}\n`;
    
    data.forEach(item => {
      const label = item.label || item.name || 'Event';
      const value = item.value || item.date || 'Unknown';
      mermaid += `    ${label} : ${value}\n`;
    });

    return mermaid;
  }

  private generateGantt(data: Record<string, unknown>[], title: string): string {
    let mermaid = `gantt\n    title ${title}\n    dateFormat YYYY-MM-DD\n`;
    
    data.forEach((item, index) => {
      const label = item.label || item.name || `Task ${index + 1}`;
      const start = item.start || '2024-01-01';
      const end = item.end || '2024-01-07';
      mermaid += `    ${label} : ${start}, ${end}\n`;
    });

    return mermaid;
  }

  private generateAllMermaidDiagrams(dashboard: DashboardOutput): string[] {
    const diagrams: string[] = [];

    // Generate different types of diagrams based on data
    diagrams.push(this.generateMermaidDiagram({
      type: "flowchart",
      data: dashboard.data,
      title: `${dashboard.title} Process`
    }));

    diagrams.push(this.generateMermaidDiagram({
      type: "pie",
      data: dashboard.data,
      title: `${dashboard.title} Distribution`
    }));

    diagrams.push(this.generateMermaidDiagram({
      type: "mindmap",
      data: dashboard.data,
      title: dashboard.title
    }));

    return diagrams;
  }

  private generateMultipleCharts(dashboard: DashboardOutput): DashboardOutput[] {
    const charts: DashboardOutput[] = [];

    // Always generate at least 3 different chart types
    const chartTypes: VisualizationType[] = ["bar_chart", "pie_chart", "line_chart", "analytics_summary"];

    chartTypes.forEach(type => {
      charts.push({
        ...dashboard,
        type,
        title: `${dashboard.title} - ${type.replace('_', ' ').toUpperCase()}`
      });
    });

    return charts;
  }
}