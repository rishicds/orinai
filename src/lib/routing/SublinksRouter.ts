"use client";

import type { DashboardSublink } from "@/types";

interface RouteContext {
  type: string;
  topic: string;
  parentTopic?: string;
  originalTopic?: string;
  data?: unknown[];
}

export class SublinksRouter {
  private static instance: SublinksRouter;
  private routes: Map<string, RouteHandler> = new Map();
  private analytics: AnalyticsTracker = new AnalyticsTracker();

  private constructor() {
    this.initializeDefaultRoutes();
  }

  static getInstance(): SublinksRouter {
    if (!SublinksRouter.instance) {
      SublinksRouter.instance = new SublinksRouter();
    }
    return SublinksRouter.instance;
  }

  private initializeDefaultRoutes() {
    // Overview routes
    this.registerRoute("overview", async (context) => {
      return {
        title: `${context.topic} - Overview`,
        description: `Comprehensive overview of ${context.topic}`,
        chartType: "analytics_summary",
        dataTransform: (data) => this.createOverviewData(data, context.topic)
      };
    });

    // Analytics routes
    this.registerRoute("analytics", async (context) => {
      return {
        title: `${context.topic} - Analytics`,
        description: `Detailed analytics and metrics for ${context.topic}`,
        chartType: "bar_chart",
        dataTransform: (data) => this.createAnalyticsData(data, context.topic)
      };
    });

    // Trends routes
    this.registerRoute("trends", async (context) => {
      return {
        title: `${context.topic} - Trends`,
        description: `Trend analysis and patterns for ${context.topic}`,
        chartType: "line_chart",
        dataTransform: (data) => this.createTrendsData(data, context.topic)
      };
    });

    // Comparison routes
    this.registerRoute("comparison", async (context) => {
      return {
        title: `${context.topic} - Comparison`,
        description: `Comparative analysis of ${context.topic}`,
        chartType: "radar_chart",
        dataTransform: (data) => this.createComparisonData(data, context.topic)
      };
    });

    // Detail routes
    this.registerRoute("detail", async (context) => {
      return {
        title: `${context.topic} - Deep Dive`,
        description: `Detailed examination of ${context.topic}`,
        chartType: "gauge_chart",
        dataTransform: (data) => this.createDetailData(data, context.topic)
      };
    });

    // Related routes
    this.registerRoute("related", async (context) => {
      return {
        title: `Related to ${context.originalTopic}: ${context.topic}`,
        description: `Explore ${context.topic} in relation to ${context.originalTopic}`,
        chartType: "treemap",
        dataTransform: (data) => this.createRelatedData(data, context.topic, context.originalTopic)
      };
    });
  }

  registerRoute(type: string, handler: RouteHandler) {
    this.routes.set(type, handler);
  }

  async handleRoute(link: DashboardSublink, currentData?: unknown[]): Promise<RouteResult> {
    const context = link.context as unknown as RouteContext;
    const handler = this.routes.get(context.type);

    if (!handler) {
      throw new Error(`No handler registered for route type: ${context.type}`);
    }

    // Track analytics
    if (link.analytics?.trackingId) {
      this.analytics.track(link.analytics.trackingId, {
        routeType: context.type,
        topic: context.topic,
        timestamp: Date.now()
      });
    }

    const result = await handler(context);
    
    // Apply data transformation if available
    if (result.dataTransform && currentData) {
      result.data = result.dataTransform(currentData);
    }

    return result;
  }

  // Data transformation methods  
  private createOverviewData(data: unknown[], topic: string) {
    if (!data || data.length === 0) return [{ label: topic, value: 1 }];
    
    // Simple overview for unknown data types
    return [
      { label: "Total Items", value: data.length, category: "metric" },
      { label: "Data Type", value: typeof data[0], category: "metric" },
      { label: "Status", value: "Processed", category: "metric" }
    ];
  }

  private createAnalyticsData(data: unknown[], topic: string) {
    if (!data || data.length === 0) return [{ label: topic, value: 1 }];
    
    // Create basic analytics
    return [
      { label: "Total Records", value: data.length, category: "analytics" },
      { label: "Processing Status", value: "Complete", category: "analytics" }
    ];
  }

  private createTrendsData(data: unknown[], topic: string) {
    if (!data || data.length === 0) return [{ label: topic, value: 1, x: 1 }];
    
    // Create trend data
    return data.slice(0, 10).map((_, index) => ({
      label: `Point ${index + 1}`,
      value: index + 1,
      x: index + 1,
      category: "trend"
    }));
  }

  private createComparisonData(data: unknown[], topic: string) {
    if (!data || data.length === 0) return [{ subject: topic, value: 1 }];
    
    // Create comparison data
    return [
      { subject: "Current", value: data.length, category: "comparison" },
      { subject: "Average", value: Math.floor(data.length / 2), category: "comparison" }
    ];
  }

  private createDetailData(data: unknown[], topic: string) {
    if (!data || data.length === 0) return [{ label: topic, value: 50 }];
    
    return [{
      label: topic,
      value: data.length,
      category: "detail"
    }];
  }

  private createRelatedData(data: unknown[], topic: string, originalTopic?: string) {
    if (!data || data.length === 0) return [{ label: topic, value: 1, name: topic }];
    
    return [{
      label: topic,
      value: data.length,
      name: topic,
      category: "related",
      parentTopic: originalTopic
    }];
  }

  getAnalytics() {
    return this.analytics.getStats();
  }
}

// Types
interface RouteHandler {
  (context: RouteContext): Promise<RouteResult>;
}

interface RouteResult {
  title: string;
  description: string;
  chartType: string;
  data?: unknown[];
  dataTransform?: (data: unknown[]) => unknown[];
}

// Analytics tracker
class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];

  track(eventId: string, data: unknown) {
    this.events.push({
      id: eventId,
      timestamp: Date.now(),
      data
    });

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  getStats() {
    const totalEvents = this.events.length;
    const uniqueRoutes = new Set(this.events.map(e => {
      const data = e.data as { routeType?: string };
      return data.routeType;
    }).filter(Boolean)).size;
    const topTopics = this.getMostCommonTopics();
    const recentActivity = this.events.slice(-10);

    return {
      totalEvents,
      uniqueRoutes,
      topTopics,
      recentActivity,
      hourlyDistribution: this.getHourlyDistribution()
    };
  }

  private getMostCommonTopics() {
    const topicCounts: { [key: string]: number } = {};
    
    this.events.forEach(event => {
      const data = event.data as { topic?: string };
      const topic = data.topic;
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }

  private getHourlyDistribution() {
    const hourCounts: { [key: number]: number } = {};
    
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }
}

interface AnalyticsEvent {
  id: string;
  timestamp: number;
  data: unknown;
}

// Export singleton instance
export const sublinksRouter = SublinksRouter.getInstance();