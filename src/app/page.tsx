import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-stone-50">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Mutual</h1>
          <p className="text-stone-500 text-center text-base leading-relaxed max-w-xs">
            Stay close with actual friends. Share what's up, make plans, keep it real.
          </p>
        </div>

        {/* Features */}
        <div className="w-full flex flex-col gap-3">
          {[
            { emoji: "👋", text: "Share quick updates with your circle" },
            { emoji: "📅", text: "Make plans and see who's in" },
            { emoji: "🔒", text: "Private — only your friends see your stuff" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-stone-600">
              <span className="text-lg">{f.emoji}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full bg-brand-600 text-white text-center py-3.5 rounded-xl font-semibold text-base hover:bg-brand-700 transition-colors active:scale-[0.98] duration-150"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="w-full bg-white text-stone-700 text-center py-3.5 rounded-xl font-semibold text-base border border-stone-200 hover:bg-stone-50 transition-colors active:scale-[0.98] duration-150"
          >
            Log in
          </Link>
        </div>

        <p className="text-xs text-stone-400 text-center">
          No algorithms. No public profiles. No ads.
        </p>
      </div>
    </main>
  );
}
