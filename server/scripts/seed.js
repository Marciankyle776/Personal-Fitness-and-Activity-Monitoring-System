// Creates (or resets) a demo account with ~8 weeks of sample data.
// Usage: npm run seed      Login: demo@example.com / Demo1234x
import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import Workout from "../models/Workout.js";
import Routine from "../models/Routine.js";
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import { addDays, startOfUTCDay } from "../utils/dates.js";

await connectDB();

const EMAIL = "demo@example.com";
const old = await User.findOne({ email: EMAIL });
if (old) {
  await Promise.all([Activity, Workout, Routine, Goal, Notification].map((M) => M.deleteMany({ user: old._id })));
  await old.deleteOne();
}

const user = await User.create({
  fullName: "Demo User", email: EMAIL, password: "Demo1234x",
  bio: "Building a steady movement habit.", avatar: "teal", termsAcceptedAt: new Date(),
});

let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const today = startOfUTCDay();

const activityTitles = {
  Walking: ["Morning walk", "Evening stroll", "Park loop"],
  Running: ["Easy run", "Tempo run", "Interval run"],
  Cycling: ["Commute ride", "Weekend ride"],
  Sports: ["Basketball pickup", "Badminton"],
  Exercise: ["Home exercise", "Stretch session"],
  "Outdoor Activities": ["Trail hike", "Beach day"],
};
const workoutNames = [["Full body strength", "Strength"], ["Core and balance", "Balance"], ["HIIT intervals", "Cardio"], ["Yoga flow", "Flexibility"], ["Mixed circuit", "Mixed"]];

const activities = [];
const workouts = [];
for (let i = 56; i >= 0; i--) {
  const date = addDays(today, -i);
  if (rand() < 0.6) {
    const category = pick(Object.keys(activityTitles));
    activities.push({ user: user._id, title: pick(activityTitles[category]), category, date, duration: 15 + Math.floor(rand() * 60), notes: "", tags: rand() < 0.3 ? ["outdoor"] : [] });
  }
  if (rand() < 0.3) {
    const [name, category] = pick(workoutNames);
    workouts.push({ user: user._id, name, category, date, duration: 20 + Math.floor(rand() * 40), notes: "Felt good.", tags: [] });
  }
}
await Activity.insertMany(activities);
await Workout.insertMany(workouts);

await Routine.insertMany([
  { user: user._id, name: "Morning mobility", category: "Flexibility", description: "Gentle start to the day.", estimatedDuration: 15,
    exercises: [{ name: "Cat-cow", durationMinutes: 3 }, { name: "Hip openers", durationMinutes: 4 }, { name: "Shoulder rolls", reps: 20 }] },
  { user: user._id, name: "Full body strength", category: "Strength", description: "Three sets, rest 60 seconds.", estimatedDuration: 45,
    exercises: [{ name: "Squats", sets: 3, reps: 12 }, { name: "Push-ups", sets: 3, reps: 10 }, { name: "Plank", sets: 3, durationMinutes: 1 }] },
]);

for (const g of [
  { title: "Move 4 days a week", category: "Consistency", targetValue: 32, unit: "days", progressValue: 21, startDate: addDays(today, -40), targetDate: addDays(today, 5) },
  { title: "30 sessions this quarter", category: "Sessions", targetValue: 30, unit: "sessions", progressValue: 12, startDate: addDays(today, -30), targetDate: addDays(today, 60) },
  { title: "First 10 hours of walking", category: "Walking", targetValue: 600, unit: "minutes", progressValue: 600, startDate: addDays(today, -60), targetDate: addDays(today, -5) },
]) await Goal.create({ ...g, user: user._id });

await Notification.create({ user: user._id, title: "Welcome to FitTrack", message: "Demo data has been loaded.", type: "system" });

console.log(`Seeded ${activities.length} activities, ${workouts.length} workouts.`);
console.log(`Login with ${EMAIL} / Demo1234x`);
await disconnectDB();
