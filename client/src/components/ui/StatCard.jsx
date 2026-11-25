import { cn } from "../../utils/format";

export default function StatCard({ icon: Icon, label, value, hint, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600", sky: "bg-sky-50 text-sky-600", amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600", teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}><Icon className="h-5 w-5" aria-hidden="true" /></span>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
