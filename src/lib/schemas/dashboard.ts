import { z } from "zod";

export const dashboardSchema = z.object({
  type: z.enum([
    "pie_chart",
    "bar_chart",
    "line_chart",
    "table",
    "text",
    "timeline",
    "comparison",
    "infographic",
  ]),
  title: z.string().min(5).max(120),
  data: z.array(z.record(z.any())).min(1).max(100),
  config: z
    .object({
      xAxis: z.string().optional(),
      yAxis: z.string().optional(),
      colors: z.array(z.string()).optional(),
      legend: z.boolean().optional(),
    })
    .partial()
    .optional(),
  sublinks: z
    .array(
      z.object({
        label: z.string(),
        route: z.string().startsWith("/"),
        context: z.record(z.any()),
      })
    )
    .optional(),
  summary: z.string().optional(),
  citations: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().min(1), // Accept any non-empty string, we'll validate URLs later
        snippet: z.string().optional(),
      })
    )
    .optional(),
  imageUrl: z.string().url().optional(),
  imagePrompt: z.string().optional(),
});

export type DashboardSchema = z.infer<typeof dashboardSchema>;

export const classificationSchema = z.object({
  type: dashboardSchema.shape.type,
  complexity: z.enum(["simple", "multi_chart", "dashboard"]),
  requiresRAG: z.boolean(),
  requiresExternal: z.boolean(),
  requiresImage: z.boolean(),
});

export type ClassificationSchema = z.infer<typeof classificationSchema>;
