import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";

// Stacked minutes per day/week split into activities and workouts.
export default function MinutesBarChart({ data, title, subtitle }) {
  const empty = !data?.some((d) => d.minutes > 0) && "No activity in this period yet.";
  const total = data?.reduce((s, d) => s + d.minutes, 0) || 0;
  const best = data?.reduce((a, d) => (d.minutes > (a?.minutes ?? -1) ? d : a), null);
  const description = `${total} minutes in total over ${data?.length} periods. Highest: ${best?.label}, ${best?.minutes} minutes.`;
  return (
    <ChartCard title={title} subtitle={subtitle} empty={empty} description={description}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} allowDecimals={false} unit="m" />
        <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(v, n) => [`${v} min`, n]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="activityMinutes" name="Activities" stackId="m" fill="#059669" radius={[0, 0, 0, 0]} />
        <Bar dataKey="workoutMinutes" name="Workouts" stackId="m" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
