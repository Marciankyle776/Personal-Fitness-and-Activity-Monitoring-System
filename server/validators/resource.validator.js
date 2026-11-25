import { z } from "zod";
import {
  ACTIVITY_CATEGORIES, WORKOUT_CATEGORIES, ROUTINE_CATEGORIES,
  GOAL_CATEGORIES, GOAL_UNITS, GOAL_STATUSES,
} from "../utils/constants.js";
import { addDays, startOfUTCDay } from "../utils/dates.js";

const dateRule = z.coerce.date({ invalid_type_error: "Please provide a valid date", required_error: "Date is required" });

// Records describe things that already happened. One day of slack covers users whose local date
// is ahead of UTC. Without this, future records would count in totals but never appear in charts.
const recordDateRule = dateRule.refine((d) => d <= addDays(startOfUTCDay(), 1), { message: "Date cannot be in the future" });
const durationRule = z.coerce.number({ invalid_type_error: "Enter a number of minutes" })
  .int("Duration must be a whole number of minutes")
  .min(1, "Duration must be at least 1 minute")
  .max(1440, "Duration cannot exceed 24 hours");
const notesRule = z.string().trim().max(1000, "Notes must be at most 1000 characters").optional().default("");
const tagsRule = z.array(z.string().trim().min(1).max(30, "Tags must be at most 30 characters"))
  .max(10, "A maximum of 10 tags is allowed").optional().default([]);

const optionalInt = (max) =>
  z.preprocess(
    (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    z.coerce.number().int().min(1).max(max).optional()
  );

// Fields shared by activities and workouts.
const sessionFields = { date: recordDateRule, duration: durationRule, notes: notesRule, tags: tagsRule };
const categoryOf = (list) => z.enum(list, { errorMap: () => ({ message: "Choose a valid category" }) });
const titleOf = (message) => z.string().trim().min(1, message).max(120, "Must be at most 120 characters");

export const activitySchema = z.object({
  title: titleOf("Activity title is required"),
  category: categoryOf(ACTIVITY_CATEGORIES),
  ...sessionFields,
});

export const workoutSchema = z.object({
  name: titleOf("Workout name is required"),
  category: categoryOf(WORKOUT_CATEGORIES),
  ...sessionFields,
});

const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required").max(100),
  sets: optionalInt(100),
  reps: optionalInt(1000),
  durationMinutes: optionalInt(600),
  notes: z.string().trim().max(300).optional().default(""),
});

export const routineSchema = z.object({
  name: z.string().trim().min(1, "Routine name is required").max(120),
  description: z.string().trim().max(500).optional().default(""),
  category: z.enum(ROUTINE_CATEGORIES, { errorMap: () => ({ message: "Choose a valid category" }) }),
  exercises: z.array(exerciseSchema).max(50, "A routine can include at most 50 exercises").optional().default([]),
  estimatedDuration: durationRule,
  notes: notesRule,
});

export const logRoutineSchema = z.object({
  date: z.preprocess((v) => (v === "" ? undefined : v), recordDateRule.optional()),
  duration: z.preprocess((v) => (v === "" ? undefined : v), durationRule.optional()),
  notes: z.string().trim().max(1000).optional(),
});

export const goalSchema = z
  .object({
    title: z.string().trim().min(1, "Goal title is required").max(120),
    description: z.string().trim().max(500).optional().default(""),
    category: z.enum(GOAL_CATEGORIES, { errorMap: () => ({ message: "Choose a valid category" }) }),
    targetValue: z.coerce.number({ invalid_type_error: "Enter a number" }).min(1, "Target must be at least 1").max(100000),
    unit: z.enum(GOAL_UNITS).optional().default("sessions"),
    progressValue: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Progress cannot be negative").optional().default(0),
    startDate: dateRule,
    targetDate: dateRule,
    status: z.enum(GOAL_STATUSES).optional().default("active"),
  })
  .refine((d) => d.targetDate >= d.startDate, {
    message: "Target date cannot be before the start date",
    path: ["targetDate"],
  });
