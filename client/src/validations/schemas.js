import { z } from "zod";
import { localDateString } from "../utils/format";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

const emailRule = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const nameRule = z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters");

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: nameRule,
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms and privacy policy"),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const forgotSchema = z.object({ email: emailRule });

export const resetSchema = z
  .object({ password: passwordRule, confirmPassword: z.string().min(1, "Confirm your password") })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const dateRule = z.string().min(1, "Date is required");
const pastDateRule = dateRule.refine((v) => v <= localDateString(), "Date cannot be in the future");
const duration = z.coerce.number({ invalid_type_error: "Enter minutes" }).int("Whole minutes only").min(1, "At least 1 minute").max(1440, "At most 24 hours");
const tagsText = z.string().max(400).refine((v) => v.split(",").map((t) => t.trim()).filter(Boolean).length <= 10, "Use at most 10 tags");

export const makeRecordSchema = (titleKey, titleLabel) =>
  z.object({
    [titleKey]: z.string().trim().min(1, `${titleLabel} is required`).max(120, "At most 120 characters"),
    category: z.string().min(1, "Choose a category"),
    date: pastDateRule,
    duration,
    notes: z.string().max(1000, "At most 1000 characters"),
    tagsText,
  });

const optionalNum = z.preprocess(
  (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
  z.coerce.number({ invalid_type_error: "Enter a number" }).int("Whole numbers only").min(1, "At least 1").max(1000).optional()
);

export const routineSchema = z.object({
  name: z.string().trim().min(1, "Routine name is required").max(120),
  description: z.string().max(500, "At most 500 characters"),
  category: z.string().min(1, "Choose a category"),
  estimatedDuration: duration,
  notes: z.string().max(1000),
  exercises: z
    .array(z.object({ name: z.string().trim().min(1, "Exercise name is required").max(100), sets: optionalNum, reps: optionalNum, durationMinutes: optionalNum }))
    .max(50, "At most 50 exercises"),
});

export const logRoutineSchema = z.object({
  date: pastDateRule,
  duration,
  notes: z.string().max(1000),
});

export const goalSchema = z
  .object({
    title: z.string().trim().min(1, "Goal title is required").max(120),
    description: z.string().max(500),
    category: z.string().min(1, "Choose a category"),
    targetValue: z.coerce.number({ invalid_type_error: "Enter a number" }).min(1, "At least 1").max(100000),
    unit: z.string().min(1),
    progressValue: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Cannot be negative"),
    startDate: dateRule,
    targetDate: dateRule,
    status: z.string(),
  })
  .refine((d) => d.targetDate >= d.startDate, { message: "Target date cannot be before the start date", path: ["targetDate"] });

export const progressSchema = z.object({
  progressValue: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Cannot be negative"),
});

export const profileSchema = z.object({
  fullName: nameRule,
  email: emailRule,
  bio: z.string().max(200, "At most 200 characters"),
});

export const preferencesSchema = z.object({
  weeklyActivityTarget: z.coerce.number({ invalid_type_error: "Enter a number" }).int().min(1, "At least 1").max(14, "At most 14"),
  weekStartsOn: z.coerce.number(),
  notificationsEnabled: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })
  .refine((d) => d.newPassword !== d.currentPassword, { message: "Choose a different password", path: ["newPassword"] });
