import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";

// lines: [{ key, name, color, dashed? }]
export default function TrendLineChart({ data, lines, title, subtitle, xKey = "label" }) {
  const empty = !data?.some((d) => lines.some((l) => d[l.key] > 0)) && "No data to compare yet.";
  const description = lines.map((l) => `${l.name}: ${data?.reduce((s, d) => s + (d[l.key] || 0), 0)} minutes in total`).join(". ");
  return (
    <ChartCard title={title} subtitle={subtitle} empty={empty} description={description}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} allowDecimals={false} unit="m" />
        <Tooltip formatter={(v, n) => [`${v} min`, n]} />
        {lines.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5}
            strokeDasharray={l.dashed ? "5 4" : undefined} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ChartCard>
  );
}
