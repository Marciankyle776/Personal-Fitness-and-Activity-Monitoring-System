import { cn } from "../../utils/format";

export default function ProgressBar({ value = 0, tone = "emerald", label, className }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const colors = { emerald: "bg-emerald-500", sky: "bg-sky-500", amber: "bg-amber-500" };
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress"}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}
    >
      <div className={cn("h-full rounded-full transition-all duration-500", colors[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
