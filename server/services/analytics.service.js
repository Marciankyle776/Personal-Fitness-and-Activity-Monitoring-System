import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Workout from "../models/Workout.js";
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { DAY_MS, addDays, parseDay, resolveToday, startOfWeek, toDayKey } from "./../utils/dates.js";

const oid = (id) => new mongoose.Types.ObjectId(String(id));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (key) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${Number(key.slice(8, 10))}`;
const pctChange = (cur, prev) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));

const groupByDay = (Model, uid, from, to) =>
  Model.aggregate([
    { $match: { user: uid, date: { $gte: from, $lt: addDays(to, 1) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        minutes: { $sum: "$duration" },
        count: { $sum: 1 },
      },
    },
  ]);

// One point per day between from and to (inclusive), combining activities and workouts.
export const dailySeries = async (userId, from, to) => {
  const uid = oid(userId);
  const [acts, wos] = await Promise.all([groupByDay(Activity, uid, from, to), groupByDay(Workout, uid, from, to)]);
  const am = new Map(acts.map((r) => [r._id, r]));
  const wm = new Map(wos.map((r) => [r._id, r]));
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const key = toDayKey(d);
    const a = am.get(key);
    const w = wm.get(key);
    const activityMinutes = a?.minutes ?? 0;
    const workoutMinutes = w?.minutes ?? 0;
    out.push({
      date: key,
      label: dayLabel(key),
      activityMinutes,
      workoutMinutes,
      minutes: activityMinutes + workoutMinutes,
      activities: a?.count ?? 0,
      workouts: w?.count ?? 0,
      sessions: (a?.count ?? 0) + (w?.count ?? 0),
    });
  }
  return out;
};

const totalsOf = (days) =>
  days.reduce(
    (t, d) => ({
      minutes: t.minutes + d.minutes,
      sessions: t.sessions + d.sessions,
      activities: t.activities + d.activities,
      workouts: t.workouts + d.workouts,
      activeDays: t.activeDays + (d.sessions > 0 ? 1 : 0),
    }),
    { minutes: 0, sessions: 0, activities: 0, workouts: 0, activeDays: 0 }
  );

const bucketDays = (days, size) => {
  const out = [];
  for (let i = 0; i < days.length; i += size) {
    const chunk = days.slice(i, i + size);
    const t = totalsOf(chunk);
    out.push({
      date: chunk[0].date,
      label: chunk.length > 1 ? `${chunk[0].label}` : chunk[0].label,
      activityMinutes: chunk.reduce((s, d) => s + d.activityMinutes, 0),
      workoutMinutes: chunk.reduce((s, d) => s + d.workoutMinutes, 0),
      minutes: t.minutes,
      sessions: t.sessions,
      activities: t.activities,
      workouts: t.workouts,
    });
  }
  return out;
};

const distribution = (Model, userId, from, to) =>
  Model.aggregate([
    { $match: { user: oid(userId), date: { $gte: from, $lt: addDays(to, 1) } } },
    { $group: { _id: "$category", minutes: { $sum: "$duration" }, count: { $sum: 1 } } },
    { $sort: { minutes: -1 } },
    { $project: { _id: 0, category: "$_id", minutes: 1, count: 1 } },
  ]);

const goalCounts = async (userId) => {
  const rows = await Goal.aggregate([{ $match: { user: oid(userId) } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const counts = { active: 0, completed: 0, paused: 0 };
  rows.forEach((r) => (counts[r._id] = r.count));
  return counts;
};

export const getDashboard = async (user, todayStr) => {
  const today = resolveToday(todayStr);
  const uid = oid(user._id);
  const weekStart = startOfWeek(today, user.preferences?.weekStartsOn ?? 1);
  const target = user.preferences?.weeklyActivityTarget ?? 3;

  const [actTotals, woTotals, goals, weekly, monthly, activityDist, recentActivities, recentWorkouts, goalsInProgress, unreadCount] =
    await Promise.all([
      Activity.aggregate([{ $match: { user: uid } }, { $group: { _id: null, count: { $sum: 1 }, minutes: { $sum: "$duration" } } }]),
      Workout.aggregate([{ $match: { user: uid } }, { $group: { _id: null, count: { $sum: 1 }, minutes: { $sum: "$duration" } } }]),
      goalCounts(user._id),
      dailySeries(user._id, addDays(today, -6), today),
      getMonthly(user._id, 6, todayStr),
      distribution(Activity, user._id, addDays(today, -29), today),
      Activity.find({ user: uid }).sort({ date: -1, _id: -1 }).limit(6),
      Workout.find({ user: uid }).sort({ date: -1, _id: -1 }).limit(5),
      Goal.find({ user: uid, status: "active" }).sort({ targetDate: 1 }).limit(4),
      Notification.countDocuments({ user: uid, isRead: false }),
    ]);

  const weekDays = weekly.filter((d) => d.date >= toDayKey(weekStart));
  const weekTotals = totalsOf(weekDays);
  const consistency = {
    sessions: weekTotals.sessions,
    target,
    activeDays: weekTotals.activeDays,
    percent: Math.min(100, Math.round((weekTotals.sessions / target) * 100)),
  };

  const reminders = [];
  const todayKey = toDayKey(today);
  if (!weekly.find((d) => d.date === todayKey)?.sessions) {
    reminders.push({ type: "activity", message: "No activity logged today yet.", link: "/activities?new=1" });
  }
  if (consistency.sessions < target) {
    reminders.push({
      type: "consistency",
      message: `You've logged ${consistency.sessions} of ${target} sessions this week.`,
      link: "/workouts?new=1",
    });
  }
  goalsInProgress.forEach((g) => {
    const daysLeft = Math.ceil((g.targetDate.getTime() - today.getTime()) / DAY_MS);
    if (daysLeft >= 0 && daysLeft <= 7) {
      reminders.push({
        type: "goal",
        message: `"${g.title}" ends ${daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`} (${g.progressPercent}% done).`,
        link: "/goals",
      });
    }
  });

  return {
    stats: {
      totalActivities: actTotals[0]?.count ?? 0,
      totalWorkouts: woTotals[0]?.count ?? 0,
      totalDuration: (actTotals[0]?.minutes ?? 0) + (woTotals[0]?.minutes ?? 0),
      weeklyConsistency: consistency,
      activeGoals: goals.active,
      completedGoals: goals.completed,
    },
    weekly,
    monthly,
    activityDistribution: activityDist,
    recentActivities,
    recentWorkouts,
    goalsInProgress,
    reminders,
    unreadCount,
  };
};

export const getWeekly = async (userId, weeks, todayStr) => {
  const today = resolveToday(todayStr);
  const days = await dailySeries(userId, addDays(today, -(weeks * 7 - 1)), today);
  return bucketDays(days, 7).map((b) => ({ ...b, label: `${b.label}` }));
};

export async function getMonthly(userId, months, todayStr) {
  const today = resolveToday(todayStr);
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (months - 1), 1));
  const uid = oid(userId);
  const group = (Model) =>
    Model.aggregate([
      { $match: { user: uid, date: { $gte: start, $lt: addDays(today, 1) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          minutes: { $sum: "$duration" },
          count: { $sum: 1 },
        },
      },
    ]);
  const [a, w] = await Promise.all([group(Activity), group(Workout)]);
  const am = new Map(a.map((r) => [r._id, r]));
  const wm = new Map(w.map((r) => [r._id, r]));
  const out = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const am1 = am.get(key);
    const wm1 = wm.get(key);
    out.push({
      month: key,
      label: `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`,
      activityMinutes: am1?.minutes ?? 0,
      workoutMinutes: wm1?.minutes ?? 0,
      minutes: (am1?.minutes ?? 0) + (wm1?.minutes ?? 0),
      sessions: (am1?.count ?? 0) + (wm1?.count ?? 0),
    });
  }
  return out;
}

export const getDistribution = async (userId, { from, to, today }) => {
  const end = parseDay(to) || resolveToday(today);
  const start = parseDay(from) || addDays(end, -29);
  const [activities, workouts] = await Promise.all([
    distribution(Activity, userId, start, end),
    distribution(Workout, userId, start, end),
  ]);
  return { activities, workouts };
};

export const getOverview = async (userId, { from, to, today }) => {
  const t = resolveToday(today);
  let end = parseDay(to) || t;
  let start = parseDay(from) || addDays(end, -29);
  if (start > end) [start, end] = [end, start];
  const span = Math.round((end - start) / DAY_MS) + 1;
  if (span > 366) throw new AppError("Date range cannot exceed 366 days", 400);

  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(span - 1));

  const [days, prevDays, activityDist, workoutDist, recentWorkouts, goalItems, counts] = await Promise.all([
    dailySeries(userId, start, end),
    dailySeries(userId, prevStart, prevEnd),
    distribution(Activity, userId, start, end),
    distribution(Workout, userId, start, end),
    Workout.find({ user: oid(userId), date: { $gte: start, $lt: addDays(end, 1) } }).sort({ date: -1, _id: -1 }).limit(8),
    Goal.find({ user: oid(userId) }).sort({ status: 1, targetDate: 1 }).limit(50),
    goalCounts(userId),
  ]);

  const size = span <= 31 ? 1 : 7;
  const current = size === 1 ? days : bucketDays(days, size);
  const previous = size === 1 ? prevDays : bucketDays(prevDays, size);
  const totals = totalsOf(days);
  const prevTotals = totalsOf(prevDays);

  return {
    range: { from: toDayKey(start), to: toDayKey(end), days: span, granularity: size === 1 ? "day" : "week" },
    totals: { ...totals, averagePerActiveDay: totals.activeDays ? Math.round(totals.minutes / totals.activeDays) : 0 },
    previous: prevTotals,
    change: { minutes: pctChange(totals.minutes, prevTotals.minutes), sessions: pctChange(totals.sessions, prevTotals.sessions) },
    series: current,
    comparison: current.map((p, i) => ({ label: p.label, current: p.minutes, previous: previous[i]?.minutes ?? 0 })),
    activityDistribution: activityDist,
    workoutDistribution: workoutDist,
    recentWorkouts,
    goals: { counts, items: goalItems },
  };
};

export const getModelStats = async (Model, userId, todayStr) => {
  const today = resolveToday(todayStr);
  const uid = oid(userId);
  const sum = { $group: { _id: null, total: { $sum: 1 }, minutes: { $sum: "$duration" } } };
  const [totals, last30, byCat] = await Promise.all([
    Model.aggregate([{ $match: { user: uid } }, sum]),
    Model.aggregate([{ $match: { user: uid, date: { $gte: addDays(today, -29), $lt: addDays(today, 1) } } }, sum]),
    Model.aggregate([
      { $match: { user: uid } },
      { $group: { _id: "$category", count: { $sum: 1 }, minutes: { $sum: "$duration" } } },
      { $sort: { count: -1 } },
    ]),
  ]);
  const total = totals[0]?.total ?? 0;
  const minutes = totals[0]?.minutes ?? 0;
  return {
    total,
    totalMinutes: minutes,
    averageMinutes: total ? Math.round(minutes / total) : 0,
    last30Sessions: last30[0]?.total ?? 0,
    last30Minutes: last30[0]?.minutes ?? 0,
    topCategory: byCat[0]?._id ?? null,
    categories: byCat.map((c) => ({ category: c._id, count: c.count, minutes: c.minutes })),
  };
};
