import { Outlet } from "react-router-dom";
import { CalendarCheck, LineChart, Target } from "lucide-react";
import Logo from "../components/layout/Logo";

const POINTS = [
  { icon: CalendarCheck, text: "Log walks, runs, rides and workouts in seconds." },
  { icon: Target, text: "Set gentle goals built around consistency, not numbers on a scale." },
  { icon: LineChart, text: "See your weekly and monthly rhythm in clear charts." },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-emerald-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-700/60" aria-hidden="true" />
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-teal-700/50" aria-hidden="true" />
        <div className="relative"><Logo light /></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">Keep moving, at your own pace.</h2>
          <ul className="mt-8 space-y-5">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3.5 text-emerald-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="pt-1.5 text-sm leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-emerald-100">Your data stays in your account and is never shared.</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
