import Activity from "../models/Activity.js";
import Workout from "../models/Workout.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDashboard, getWeekly, getMonthly, getDistribution, getOverview, getModelStats,
} from "../services/analytics.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getDashboard(req.user, req.query.today) });
});

export const weekly = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { weeks: await getWeekly(req.user._id, req.query.weeks, req.query.today) } });
});

export const monthly = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { months: await getMonthly(req.user._id, req.query.months, req.query.today) } });
});

export const activityDistribution = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getDistribution(req.user._id, req.query) });
});

export const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getOverview(req.user._id, req.query) });
});

const statsFor = (Model) =>
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await getModelStats(Model, req.user._id, req.query.today) });
  });

export const activityStats = statsFor(Activity);
export const workoutStats = statsFor(Workout);
