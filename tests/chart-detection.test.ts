import { describe, test, expect } from '@jest/globals';
import { detectOptimalChartType, detectChartConfig } from '../src/components/charts/ChartManager';
import { CHART_TYPE_METADATA } from '../src/components/charts/index';

describe('Chart Auto-Detection System', () => {
  test('detects pie chart for small categorical data', () => {
    const data = [
      { label: 'Category A', value: 30 },
      { label: 'Category B', value: 45 },
      { label: 'Category C', value: 25 }
    ];
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('pie_chart');
  });

  test('detects bar chart for medium categorical data', () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: Math.random() * 100
    }));
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('bar_chart');
  });

  test('detects scatter plot for XY data', () => {
    const data = [
      { x: 10, y: 20, label: 'Point 1' },
      { x: 15, y: 25, label: 'Point 2' },
      { x: 20, y: 30, label: 'Point 3' }
    ];
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('scatter_plot');
  });

  test('detects gauge chart for single value', () => {
    const data = [{ value: 75, label: 'Progress' }];
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('gauge_chart');
  });

  test('detects line chart for large datasets', () => {
    const data = Array.from({ length: 25 }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.random() * 100
    }));
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('line_chart');
  });

  test('detects heatmap for very large datasets', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: Math.random() * 100
    }));
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('heatmap');
  });

  test('detects analytics summary as fallback', () => {
    const data = [{ someProperty: 'test' }];
    
    const chartType = detectOptimalChartType(data);
    expect(chartType).toBe('analytics_summary');
  });

  test('generates appropriate config for different chart types', () => {
    const barData = [{ label: 'A', value: 10 }];
    const scatterData = [{ x: 1, y: 2, size: 5 }];
    
    const barConfig = detectChartConfig(barData, 'bar_chart');
    const scatterConfig = detectChartConfig(scatterData, 'scatter_plot');
    
    expect(barConfig.xAxis).toBe('label');
    expect(barConfig.yAxis).toBe('value');
    expect(scatterConfig.chartSpecific?.size).toBe('size');
  });

  test('all chart types have metadata', () => {
    const supportedTypes = Object.keys(CHART_TYPE_METADATA);
    
    expect(supportedTypes.length).toBeGreaterThanOrEqual(10);
    expect(supportedTypes).toContain('bar_chart');
    expect(supportedTypes).toContain('pie_chart');
    expect(supportedTypes).toContain('analytics_summary');
  });
});