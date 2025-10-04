import { NextRequest, NextResponse } from "next/server";
import { createSessionFromOAuth } from "@/app/(auth)/actions";

function isValidRelativePath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function buildFailureRedirect(origin: string, returnTo?: string) {
  const failureUrl = new URL("/login", origin);
  failureUrl.searchParams.set("error", "oauth_failed");
  if (returnTo) {
    failureUrl.searchParams.set("redirect", returnTo);
  }
  return failureUrl;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  const returnToParam = searchParams.get("returnTo");
  const returnTo = isValidRelativePath(returnToParam) ? returnToParam : undefined;
  const failureRedirect = NextResponse.redirect(buildFailureRedirect(origin, returnTo));

  // Debug logging
  console.log("[OAuth Callback] Received params:", {
    userId: userId ? "present" : "missing",
    secret: secret ? "present" : "missing",
    returnTo,
    allParams: Object.fromEntries(searchParams.entries())
  });

  if (!userId || !secret) {
    console.log("[OAuth Callback] Missing userId or secret, redirecting to failure");
    return failureRedirect;
  }

  try {
    console.log("[OAuth Callback] Attempting to create session...");
    await createSessionFromOAuth(userId, secret);
    console.log("[OAuth Callback] Session created successfully");
    const successUrl = new URL(returnTo ?? "/", origin);
    console.log("[OAuth Callback] Redirecting to success URL:", successUrl.toString());
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("[Auth] Failed to finalize OAuth session", error);
    return failureRedirect;
  }
}