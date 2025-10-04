import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Sign in — ORIN.AI",
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveRedirect(params: Record<string, string | string[] | undefined> | undefined) {
  if (!params) return undefined;
  const raw = params.redirect;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  return value;
}

function resolveError(params: Record<string, string | string[] | undefined> | undefined) {
  if (!params) return undefined;
  const errorParam = params.error;
  if (!errorParam) return undefined;
  const value = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  if (!value) return undefined;

  switch (value) {
    case "oauth_denied":
      return "Google sign-in was cancelled. Please try again.";
    case "oauth_failed":
      return "We couldn't complete Google sign-in. Try a different method.";
    case "session":
      return "We couldn't create a session for your account. Please try email login.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = resolveError(params);
  const redirectTo = resolveRedirect(params);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-6 flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">
              Sign in to generate dashboards and save your analytic history.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <GoogleSignInButton redirectTo={redirectTo} />
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              or
              <span className="h-px flex-1 bg-slate-800" />
            </div>
            <LoginForm defaultError={error} redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
