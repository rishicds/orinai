import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'infographic', aspectRatio = '16:9' } = await request.json();

    // Generate SVG image since we can't use external APIs in this setup
    const svgData = generateCustomSVGForPrompt(prompt, style, aspectRatio);
    
    const response = {
      imageData: {
        svgCode: svgData,
        description: `Generated ${style} visualization for: ${prompt}`,
        type: 'svg'
      },
      prompt: prompt,
      style: style
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Return a basic SVG fallback
    const fallbackSvg = generateFallbackSVG(error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      imageData: {
        svgCode: fallbackSvg,
        description: 'Fallback visualization',
        type: 'svg'
      }
    });
  }
}

function generateCustomSVGForPrompt(prompt: string, style: string, aspectRatio: string): string {
  const [width, height] = aspectRatio === '16:9' ? [800, 450] : 
                         aspectRatio === '4:3' ? [800, 600] : 
                         [800, 800]; // 1:1

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add gradients and defs
  svg += `<defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
    </marker>
  </defs>`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="url(#bgGradient)" rx="20"/>`;
  
  // Title
  const title = prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt;
  svg += `<text x="${width/2}" y="60" text-anchor="middle" fill="white" font-size="28" font-weight="bold">${title}</text>`;
  svg += `<text x="${width/2}" y="85" text-anchor="middle" fill="#94a3b8" font-size="14">${style.toUpperCase()} VISUALIZATION</text>`;
  
  // Generate content based on style
  switch (style) {
    case 'infographic':
      svg += generateInfographicContent(width, height, prompt);
      break;
    case 'technical':
      svg += generateTechnicalDiagram(width, height, prompt);
      break;
    case 'chart':
      svg += generateChartVisualization(width, height, prompt);
      break;
    case 'diagram':
      svg += generateFlowDiagram(width, height, prompt);
      break;
    default:
      svg += generateDefaultVisualization(width, height, prompt);
  }
  
  svg += '</svg>';
  return svg;
}

function generateInfographicContent(width: number, height: number, prompt: string): string {
  const centerX = width / 2;
  const centerY = height / 2;
  
  let content = '';
  
  // Central hub
  content += `<circle cx="${centerX}" cy="${centerY}" r="80" fill="url(#primaryGradient)" opacity="0.8"/>`;
  content += `<text x="${centerX}" y="${centerY + 6}" text-anchor="middle" fill="white" font-size="16" font-weight="600">CORE</text>`;
  
  // Surrounding elements based on prompt keywords
  const keywords = extractKeywords(prompt);
  const positions = [
    { x: centerX - 200, y: centerY - 100 },
    { x: centerX + 200, y: centerY - 100 },
    { x: centerX - 200, y: centerY + 100 },
    { x: centerX + 200, y: centerY + 100 }
  ];
  
  positions.forEach((pos, index) => {
    if (keywords[index]) {
      content += `<circle cx="${pos.x}" cy="${pos.y}" r="60" fill="url(#accentGradient)" opacity="0.7"/>`;
      content += `<text x="${pos.x}" y="${pos.y + 6}" text-anchor="middle" fill="white" font-size="12" font-weight="500">${keywords[index]}</text>`;
      
      // Connect to center
      content += `<line x1="${pos.x}" y1="${pos.y}" x2="${centerX}" y2="${centerY}" stroke="#64748b" stroke-width="2" opacity="0.5"/>`;
    }
  });
  
  return content;
}

function generateTechnicalDiagram(_width: number, _height: number, _prompt: string): string {
  let content = '';
  
  // Technical components
  const components = [
    { x: 150, y: 180, width: 120, height: 80, label: 'INPUT' },
    { x: 340, y: 180, width: 120, height: 80, label: 'PROCESS' },
    { x: 530, y: 180, width: 120, height: 80, label: 'OUTPUT' }
  ];
  
  components.forEach((comp, index) => {
    const color = ['#0ea5e9', '#8b5cf6', '#14b8a6'][index];
    content += `<rect x="${comp.x}" y="${comp.y}" width="${comp.width}" height="${comp.height}" fill="${color}" rx="8" opacity="0.8" stroke="white" stroke-width="2"/>`;
    content += `<text x="${comp.x + comp.width/2}" y="${comp.y + comp.height/2 + 6}" text-anchor="middle" fill="white" font-size="14" font-weight="600">${comp.label}</text>`;
  });
  
  // Arrows
  content += `<path d="M 270 220 L 330 220" stroke="white" stroke-width="3" marker-end="url(#arrow)"/>`;
  content += `<path d="M 460 220 L 520 220" stroke="white" stroke-width="3" marker-end="url(#arrow)"/>`;
  
  return content;
}

function generateChartVisualization(width: number, height: number, _prompt: string): string {
  let content = '';
  
  // Generate bar chart data
  const data = Array.from({ length: 5 }, (_, i) => ({
    value: Math.random() * 100 + 20,
    label: `Item ${i + 1}`
  }));
  
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = width - 200;
  const chartHeight = height - 200;
  const barWidth = chartWidth / data.length - 20;
  
  // Chart background
  content += `<rect x="100" y="120" width="${chartWidth}" height="${chartHeight}" fill="none" stroke="#64748b" stroke-width="1"/>`;
  
  // Bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * (chartHeight - 40);
    const x = 120 + index * (barWidth + 20);
    const y = 120 + chartHeight - barHeight - 20;
    
    content += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="url(#primaryGradient)" opacity="0.8"/>`;
    content += `<text x="${x + barWidth/2}" y="${120 + chartHeight + 15}" text-anchor="middle" fill="#94a3b8" font-size="10">${item.label}</text>`;
    content += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" fill="white" font-size="10">${Math.round(item.value)}</text>`;
  });
  
  return content;
}

function generateFlowDiagram(width: number, _height: number, _prompt: string): string {
  let content = '';
  
  const steps = [
    { x: width/2, y: 150, shape: 'ellipse', text: 'START' },
    { x: width/2, y: 220, shape: 'rect', text: 'STEP 1' },
    { x: width/2, y: 290, shape: 'diamond', text: 'DECISION' },
    { x: width/2 - 100, y: 360, shape: 'rect', text: 'OPTION A' },
    { x: width/2 + 100, y: 360, shape: 'rect', text: 'OPTION B' }
  ];
  
  steps.forEach((step) => {
    if (step.shape === 'ellipse') {
      content += `<ellipse cx="${step.x}" cy="${step.y}" rx="60" ry="30" fill="#14b8a6" opacity="0.8"/>`;
    } else if (step.shape === 'diamond') {
      content += `<polygon points="${step.x},${step.y-30} ${step.x+60},${step.y} ${step.x},${step.y+30} ${step.x-60},${step.y}" fill="#f97316" opacity="0.8"/>`;
    } else {
      content += `<rect x="${step.x-50}" y="${step.y-20}" width="100" height="40" fill="#0ea5e9" rx="5" opacity="0.8"/>`;
    }
    content += `<text x="${step.x}" y="${step.y + 4}" text-anchor="middle" fill="white" font-size="12" font-weight="600">${step.text}</text>`;
  });
  
  // Flow arrows
  content += `<path d="M ${width/2} 180 L ${width/2} 200" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>`;
  content += `<path d="M ${width/2} 250 L ${width/2} 270" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>`;
  content += `<path d="M ${width/2-30} 320 L ${width/2-70} 340" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>`;
  content += `<path d="M ${width/2+30} 320 L ${width/2+70} 340" stroke="white" stroke-width="2" marker-end="url(#arrow)"/>`;
  
  return content;
}

function generateDefaultVisualization(width: number, height: number, prompt: string): string {
  return generateInfographicContent(width, height, prompt);
}

function extractKeywords(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/\s+/);
  const keywords = words
    .filter(word => word.length > 3)
    .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(word))
    .slice(0, 4);
  
  return keywords.map(word => word.toUpperCase());
}

function generateFallbackSVG(error: string): string {
  return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#1e293b" rx="10"/>
    <text x="200" y="150" text-anchor="middle" fill="#ef4444" font-size="16">Image Generation Error</text>
    <text x="200" y="180" text-anchor="middle" fill="#94a3b8" font-size="12">${error}</text>
  </svg>`;
}