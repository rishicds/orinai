import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Create account — ORIN.AI",
};

interface RegisterPageProps {
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

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const redirectTo = resolveRedirect(params);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-6 flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold text-white">Join ORIN.AI</h1>
            <p className="text-sm text-slate-400">
              Create a free account to unlock natural language dashboards.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <GoogleSignInButton label="Sign up with Google" redirectTo={redirectTo} />
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              or
              <span className="h-px flex-1 bg-slate-800" />
            </div>
            <RegisterForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
