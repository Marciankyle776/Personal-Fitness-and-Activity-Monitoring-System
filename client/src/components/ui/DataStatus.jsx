import { RefreshCw } from "lucide-react";

// Shown when a refresh failed but older data is still on screen, so users know it may be out of date.
export default function DataStatus({ error, hasData, onRetry }) {
  if (!error || !hasData) return null;
  return (
    <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>Couldn't refresh this page. You're seeing the last data that loaded. {error.userMessage}</span>
      <button onClick={onRetry} className="inline-flex items-center gap-1.5 font-semibold underline"><RefreshCw className="h-4 w-4" aria-hidden="true" />Retry</button>
    </div>
  );
}
