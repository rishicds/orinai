import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/appwrite/auth";
import { processQuery } from "@/lib/langchain/pipeline";

const requestSchema = z.object({
  query: z.string().min(3),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = requestSchema.parse(body);

    const user = await getUser();
    const userId = user?.id ?? "anonymous";

    if (!user) {
      console.info("[API] Proceeding with anonymous dashboard generation");
    }

    const dashboard = await processQuery(query, userId);
    return NextResponse.json(dashboard);
  } catch (cause) {
    console.error("[API] Failed to process query", cause);

    if (cause instanceof z.ZodError) {
      const validationError = cause as z.ZodError;
      return NextResponse.json(
        { error: "Invalid request payload", details: validationError.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate dashboard" },
      { status: 500 }
    );
  }
}
