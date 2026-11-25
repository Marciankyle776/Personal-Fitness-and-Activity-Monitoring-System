import { Check } from "lucide-react";

const RULES = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
  { label: "Symbol or 12+ characters", test: (p) => /[^A-Za-z0-9]/.test(p) || p.length >= 12 },
];
const LEVELS = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-orange-500", text: "text-orange-700" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-700" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-700" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-700" },
];

export default function PasswordStrength({ password = "" }) {
  if (!password) return null;
  const passed = RULES.filter((r) => r.test(password)).length;
  const level = LEVELS[Math.max(0, passed - 1)];
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {RULES.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < passed ? level.bar : "bg-slate-200"}`} />)}
        </div>
        <span className={`text-xs font-semibold ${level.text}`}>{level.label}</span>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-700" : "text-slate-500"}`}>
              <Check className={`h-3.5 w-3.5 ${ok ? "opacity-100" : "opacity-30"}`} aria-hidden="true" /> {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
