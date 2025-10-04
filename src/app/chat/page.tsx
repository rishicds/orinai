import { getUser } from "@/lib/appwrite/auth";
import { HomeShell } from "@/components/home/HomeShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logoutUser } from "@/app/(auth)/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFFE2B 0%, #C5CBE3 50%, #4056A1 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#F13C20' }}></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full opacity-15 animate-bounce" style={{ backgroundColor: '#D79922' }}></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 rounded-full opacity-25 animate-ping" style={{ backgroundColor: '#F13C20' }}></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl m-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(45deg, #F13C20, #D79922)' }}>
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-white drop-shadow-lg">
                Orin.ai
              </span>
            </Link>
            <div className="text-slate-900 font-bold text-xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
              Chat Interface
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1">
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/90 font-semibold px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                Hey there, {user.name?.split(' ')[0] || user.email?.split("@")[0] || "Superstar"} 👋
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Peace Out ✌️
                </button>
              </form>
            </div>
          </nav>
        </header>

        {/* Main Chat Interface */}
        <div className="flex-1 mx-6 mb-6">
          <HomeShell isAuthenticated={true} />
        </div>
      </div>
    </div>
  );
}