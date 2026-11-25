import { Link } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, Bell, CheckCircle2, Clock, Dumbbell, Flame, ListChecks, Plus, Target, Trophy } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import DataStatus from "../components/ui/DataStatus";
import { Skeleton, StatsSkeleton } from "../components/ui/Skeleton";
import MinutesBarChart from "../components/charts/MinutesBarChart";
import TrendLineChart from "../components/charts/TrendLineChart";
import DonutChart from "../components/charts/DonutChart";
import useFetch from "../hooks/useFetch";
import { analyticsService } from "../services/resources";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDuration, formatLongToday, formatNumber, greeting } from "../utils/format";

const QUICK_LINKS = [
  { to: "/activities", label: "Activities", icon: Activity },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/routines", label: "Routines", icon: ListChecks },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Alerts", icon: Bell },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => analyticsService.dashboard(), [], { refetchOnFocus: true });

  const header = (
    <PageHeader
      title={`${greeting()}, ${user.fullName.split(" ")[0]}`}
      description={formatLongToday()}
      actions={
        <>
          <Link to="/activities?new=1" className="btn btn-primary"><Plus className="h-4 w-4" /> Add activity</Link>
          <Link to="/workouts?new=1" className="btn btn-secondary"><Dumbbell className="h-4 w-4" /> Log workout</Link>
          <Link to="/goals?new=1" className="btn btn-secondary"><Target className="h-4 w-4" /> New goal</Link>
        </>
      }
    />
  );

  if (loading && !data) {
    return (
      <>
        {header}
        <StatsSkeleton />
        <div className="mt-6 grid gap-6 lg:grid-cols-3"><Skeleton className="h-80 rounded-2xl lg:col-span-2" /><Skeleton className="h-80 rounded-2xl" /></div>
      </>
    );
  }
  if (error && !data) return <>{header}<div className="card"><ErrorState error={error} onRetry={reload} /></div></>;

  const { stats, weekly, monthly, activityDistribution, recentActivities, recentWorkouts, goalsInProgress, reminders } = data;
  const wc = stats.weeklyConsistency;
  const noData = stats.totalActivities + stats.totalWorkouts === 0;

  return (
    <>
      {header}
      <DataStatus error={error} hasData={!!data} onRetry={reload} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Activity} label="Activities" value={formatNumber(stats.totalActivities)} />
        <StatCard icon={Dumbbell} tone="sky" label="Workout sessions" value={formatNumber(stats.totalWorkouts)} />
        <StatCard icon={Clock} tone="violet" label="Total duration" value={formatDuration(stats.totalDuration)} />
        <StatCard icon={Flame} tone="amber" label="Weekly consistency" value={`${wc.percent}%`} hint={`${wc.sessions} of ${wc.target} sessions this week`} />
        <StatCard icon={Target} tone="teal" label="Active goals" value={formatNumber(stats.activeGoals)} />
        <StatCard icon={Trophy} tone="rose" label="Goals completed" value={formatNumber(stats.completedGoals)} />
      </div>

      {noData && (
        <div className="card mt-6">
          <EmptyState icon={Activity} title="Your dashboard is waiting for its first record"
            message="Add an activity or workout and your charts, totals and reminders will appear here."
            action={<Link to="/activities?new=1" className="btn btn-primary"><Plus className="h-4 w-4" /> Add your first activity</Link>} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><MinutesBarChart data={weekly} title="This week" subtitle="Minutes per day, last 7 days" /></div>
        <DonutChart data={activityDistribution} title="Activity types" subtitle="Share of minutes, last 30 days" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendLineChart data={monthly} xKey="label" title="Monthly trend" subtitle="Total minutes per month, last 6 months"
            lines={[{ key: "minutes", name: "Minutes", color: "#059669" }]} />
        </div>
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Goals in progress</h3>
            <Link to="/goals" className="text-sm font-semibold text-emerald-800 hover:underline">View all</Link>
          </div>
          {goalsInProgress.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No active goals. <Link to="/goals?new=1" className="font-semibold text-emerald-700 hover:underline">Set one</Link> to stay on track.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {goalsInProgress.map((g) => (
                <li key={g._id}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{g.title}</span><span className="text-slate-500">{g.progressPercent}%</span></div>
                  <ProgressBar value={g.progressPercent} tone="sky" label={`${g.title} progress`} />
                  <p className="mt-1 text-xs text-slate-500">{g.progressValue} of {g.targetValue} {g.unit} - due {formatDate(g.targetDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <h3 className="text-base font-bold">Recent activities</h3>
            <Link to="/activities" className="text-sm font-semibold text-emerald-800 hover:underline">View all</Link>
          </div>
          {recentActivities.length === 0 ? <p className="px-5 py-8 text-sm text-slate-500">No activities recorded yet.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-y border-slate-100 text-xs text-slate-500">
                  <tr><th scope="col" className="px-5 py-2.5 font-semibold">Activity</th><th scope="col" className="px-3 py-2.5 font-semibold">Category</th><th scope="col" className="px-3 py-2.5 font-semibold">Date</th><th scope="col" className="px-5 py-2.5 font-semibold">Duration</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivities.map((a) => (
                    <tr key={a._id}>
                      <td className="max-w-[14rem] truncate px-5 py-3 font-semibold">{a.title}</td>
                      <td className="px-3 py-3"><Badge>{a.category}</Badge></td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatDate(a.date)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDuration(a.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold">Reminders</h3>
          {reminders.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> You're on track. Nothing needs your attention.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {reminders.map((r) => (
                <li key={r.message}>
                  <Link to={r.link} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 hover:bg-emerald-50">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" /><span>{r.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mb-3 mt-6 text-base font-bold">Quick links</h3>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-2 py-3 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900">
                <Icon className="h-5 w-5" aria-hidden="true" />{label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Workout history</h3>
          <Link to="/workouts" className="flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">All workouts <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {recentWorkouts.length === 0 ? <p className="mt-4 text-sm text-slate-500">No workout sessions yet.</p> : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {recentWorkouts.map((w) => (
              <li key={w._id} className="rounded-xl border border-slate-200 p-3.5">
                <p className="truncate text-sm font-bold">{w.name}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(w.date)}</p>
                <div className="mt-2 flex items-center justify-between"><Badge>{w.category}</Badge><span className="text-xs font-semibold text-slate-600">{formatDuration(w.duration)}</span></div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
