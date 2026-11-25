import { ResponsiveContainer } from "recharts";

// `description` is a plain-text summary of the chart (read by screen readers, which cannot see the drawing).
export default function ChartCard({ title, subtitle, description, height = 260, children, empty, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <h3 className="text-base font-bold">{title}</h3>
      {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
      <div className="mt-4" style={{ height }} role="img" aria-label={`${title}. ${empty || description || ""}`}>
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-600">{empty}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
