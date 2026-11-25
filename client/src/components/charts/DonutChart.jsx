import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import { CHART_COLORS } from "../../utils/constants";

// data: [{ category, minutes, count }]
export default function DonutChart({ data, title, subtitle }) {
  const total = data?.reduce((s, d) => s + d.minutes, 0) || 0;
  const description = data?.map((d) => `${d.category} ${Math.round((d.minutes / total) * 100)}%`).join(", ");
  return (
    <ChartCard title={title} subtitle={subtitle} empty={!total && "No records in this period."} description={description}>
      <PieChart>
        <Pie data={data} dataKey="minutes" nameKey="category" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
          {data?.map((d, i) => <Cell key={d.category} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v, n, p) => [`${v} min (${Math.round((v / total) * 100)}%, ${p.payload.count} records)`, n]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ChartCard>
  );
}
