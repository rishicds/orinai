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

  if (!userId || !secret) {
    return failureRedirect;
  }

  try {
    await createSessionFromOAuth(userId, secret);
    const successUrl = new URL(returnTo ?? "/", origin);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("[Auth] Failed to finalize OAuth session", error);
    return failureRedirect;
  }
}
