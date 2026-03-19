"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-red-500 mb-4">Error</h1>
        <h2 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
