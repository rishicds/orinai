import Link from "next/link";
import { HomeShell } from "@/components/home/HomeShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getUser } from "@/lib/appwrite/auth";
import { logoutUser } from "./(auth)/actions";

export default async function Home() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 lg:py-16">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">
              Orin.ai
            </span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              LLM-Powered Visualization Layer
            </h1>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-slate-700 dark:text-slate-300">
                  Hi, {user.name || user.email?.split("@")[0] || "Rishi Paul Rishi Paul"}
                </span>
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/50 px-4 py-2 text-slate-700 dark:text-slate-200 transition hover:border-blue-500 hover:bg-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/50 px-4 py-2 text-slate-700 dark:text-slate-200 transition hover:border-blue-500 hover:bg-slate-300 dark:hover:bg-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-semibold text-white transition hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </header>

        <HomeShell isAuthenticated={Boolean(user)} />
      </div>
    </div>
  );
}
