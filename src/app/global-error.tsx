"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-stone-50">
          <div className="w-full max-w-sm text-center flex flex-col items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-lg font-semibold text-stone-900">Something went wrong</h2>
            <p className="text-stone-500 text-sm">
              {process.env.NODE_ENV === "development"
                ? error.message || "An unexpected error occurred."
                : "An unexpected error occurred. Please try again."}
            </p>
            {error.digest && (
              <p className="text-xs text-stone-300 font-mono">ref: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="mt-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
