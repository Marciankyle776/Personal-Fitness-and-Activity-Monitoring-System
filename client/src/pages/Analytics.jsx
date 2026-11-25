import { useSearchParams } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, CalendarCheck, Clock, Dumbbell, Minus, Zap } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import ErrorState from "../components/ui/ErrorState";
import DataStatus from "../components/ui/DataStatus";
import FilterTabs from "../components/ui/FilterTabs";
import { Skeleton, StatsSkeleton } from "../components/ui/Skeleton";
import MinutesBarChart from "../components/charts/MinutesBarChart";
import TrendLineChart from "../components/charts/TrendLineChart";
import DonutChart from "../components/charts/DonutChart";
import useFetch from "../hooks/useFetch";
import { analyticsService } from "../services/resources";
import { formatDate, formatDuration, formatNumber, localDateString } from "../utils/format";

const PRESETS = [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["custom", "Custom range"]];

const Change = ({ value }) => {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const tone = value > 0 ? "text-emerald-700" : value < 0 ? "text-amber-700" : "text-slate-500";
  return <span className={`inline-flex items-center gap-0.5 font-semibold ${tone}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{Math.abs(value)}%</span>;
};

export default function Analytics() {
  // The chosen range lives in the URL (?range=90 or ?range=custom&from=...&to=...), so it survives a
  // refresh and the Back button, and a link to the page shows the same period.
  const [params, setParams] = useSearchParams();
  const preset = PRESETS.some(([v]) => v === params.get("range")) ? params.get("range") : "30";
  const custom = { from: params.get("from") || localDateString(-29), to: params.get("to") || localDateString() };
  const setPreset = (value) => setParams(value === "custom" ? { range: "custom", ...custom } : { range: value }, { replace: true });
  const setCustom = (patch) => {
    const next = { ...custom, ...patch };
    if (patch.from && next.from > next.to) next.to = next.from; // keep the range valid instead of returning nothing
    if (patch.to && next.to < next.from) next.from = next.to;
    setParams({ range: "custom", ...next }, { replace: true });
  };

  const range = preset === "custom" ? custom : { from: localDateString(-(Number(preset) - 1)), to: localDateString() };

  const spanDays = Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86400000) + 1;
  const customInvalid = preset === "custom" && (!custom.from || !custom.to || Number.isNaN(spanDays) || spanDays > 366);
  const { data, loading, error, reload } = useFetch(
    () => (customInvalid ? Promise.resolve(null) : analyticsService.overview(range)),
    [range.from, range.to, customInvalid],
    { refetchOnFocus: true }
  );

  const t = data?.totals;
  const periodLabel = data ? `vs previous ${data.range.days} days` : "";

  return (
    <>
      <PageHeader title="Analytics" description="Trends and patterns calculated from your own records." />

      <div className="card mb-6 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <FilterTabs label="Date range" options={PRESETS} value={preset} onChange={setPreset} />
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <input aria-label="Start date" type="date" className="input !w-auto" value={custom.from} max={localDateString()} onChange={(e) => setCustom({ from: e.target.value })} />
            <span className="text-sm text-slate-600">to</span>
            <input aria-label="End date" type="date" className="input !w-auto" value={custom.to} max={localDateString()} onChange={(e) => setCustom({ to: e.target.value })} />
          </div>
        )}
        {data && preset !== "custom" && <p className="text-sm text-slate-600 lg:ml-auto">{formatDate(data.range.from)} - {formatDate(data.range.to)}</p>}
      </div>

      <DataStatus error={error} hasData={!!data} onRetry={reload} />
      {customInvalid ? (
        <div className="card p-6 text-sm text-slate-700" role="alert">Choose a range of up to 366 days with both a start and an end date.</div>
      ) : loading && !data ? (
        <><StatsSkeleton count={4} /><div className="mt-6 grid gap-6 lg:grid-cols-2"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div></>
      ) : error && !data ? (
        <div className="card"><ErrorState error={error} onRetry={reload} /></div>
      ) : data && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard icon={Clock} label="Total time" value={formatDuration(t.minutes)} hint={<><Change value={data.change.minutes} /> {periodLabel}</>} />
            <StatCard icon={Dumbbell} tone="sky" label="Sessions" value={formatNumber(t.sessions)} hint={<><Change value={data.change.sessions} /> {periodLabel}</>} />
            <StatCard icon={CalendarCheck} tone="violet" label="Active days" value={`${t.activeDays} / ${data.range.days}`} hint={`${t.activities} activities, ${t.workouts} workouts`} />
            <StatCard icon={Zap} tone="amber" label="Average per active day" value={formatDuration(t.averagePerActiveDay)} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <MinutesBarChart data={data.series} title="Activity duration" subtitle={data.range.granularity === "day" ? "Minutes per day" : "Minutes per week"} />
            <TrendLineChart data={data.comparison} title="Historical comparison" subtitle="This period against the previous one"
              lines={[{ key: "current", name: "This period", color: "#059669" }, { key: "previous", name: "Previous period", color: "#94a3b8", dashed: true }]} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DonutChart data={data.activityDistribution} title="Activity categories" subtitle="Share of activity minutes" />
            <DonutChart data={data.workoutDistribution} title="Workout categories" subtitle="Share of workout minutes" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <h3 className="text-base font-bold">Goal completion</h3>
              <p className="text-xs text-slate-600">All goals: {data.goals.counts.completed} completed, {data.goals.counts.active} active, {data.goals.counts.paused} paused</p>
              {data.goals.items.length === 0 ? <p className="mt-6 text-sm text-slate-500">No goals yet.</p> : (
                <ul className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                  {data.goals.items.map((g) => (
                    <li key={g._id}>
                      <div className="mb-1.5 flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{g.title}</span><span className="text-slate-500">{g.progressPercent}%</span></div>
                      <ProgressBar value={g.progressPercent} label={`${g.title} progress`} tone={g.status === "completed" ? "emerald" : "sky"} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-5">
              <h3 className="text-base font-bold">Workout session history</h3>
              <p className="text-xs text-slate-500">Most recent sessions in this period</p>
              {data.recentWorkouts.length === 0 ? <p className="mt-6 text-sm text-slate-500">No workouts in this period.</p> : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {data.recentWorkouts.map((w) => (
                    <li key={w._id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{w.name}</p><p className="text-xs text-slate-500">{formatDate(w.date)}</p></div>
                      <div className="flex shrink-0 items-center gap-2"><Badge>{w.category}</Badge><span className="text-sm text-slate-600">{formatDuration(w.duration)}</span></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
