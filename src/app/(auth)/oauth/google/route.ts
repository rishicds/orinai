import { NextResponse, type NextRequest } from "next/server";

function isValidRelativePath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function buildOAuthUrl(
  endpoint: string,
  projectId: string,
  successUrl: string,
  failureUrl: string
) {
  const oauthUrl = new URL("/account/sessions/oauth2/google", endpoint);
  oauthUrl.searchParams.set("project", projectId);
  oauthUrl.searchParams.set("success", successUrl);
  oauthUrl.searchParams.set("failure", failureUrl);
  return oauthUrl.toString();
}

export async function GET(request: NextRequest) {
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    return NextResponse.redirect(new URL("/login?error=session", request.nextUrl.origin));
  }

  const redirectParam = request.nextUrl.searchParams.get("redirect");
  const returnTo = isValidRelativePath(redirectParam) ? redirectParam : undefined;

  const successUrl = new URL("/auth/oauth/callback", request.nextUrl.origin);
  if (returnTo) {
    successUrl.searchParams.set("returnTo", returnTo);
  }

  const failureUrl = new URL("/login", request.nextUrl.origin);
  failureUrl.searchParams.set("error", "oauth_failed");
  if (returnTo) {
    failureUrl.searchParams.set("redirect", returnTo);
  }

  const location = buildOAuthUrl(
    endpoint,
    projectId,
    successUrl.toString(),
    failureUrl.toString()
  );
  return NextResponse.redirect(location);
}
