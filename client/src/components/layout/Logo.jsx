import { Activity } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${light ? "bg-white/15 text-white" : "bg-emerald-700 text-white"}`}>
        <Activity className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>FitTrack</span>
    </span>
  );
}
