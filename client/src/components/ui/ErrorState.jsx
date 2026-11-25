import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ error, onRetry, title = "Could not load this data" }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="h-7 w-7" /></span>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{error?.userMessage || "Something went wrong."}</p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
