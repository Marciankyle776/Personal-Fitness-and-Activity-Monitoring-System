import { z } from "zod";
import { emailRule, fullNameRule, passwordRule } from "./auth.validator.js";

const avatarRule = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^[a-z]{2,20}$/.test(v) || /^https:\/\/\S+$/.test(v), {
    message: "Avatar must be a preset or an https image URL",
  });

export const profileSchema = z.object({
  fullName: fullNameRule,
  email: emailRule,
  bio: z.string().trim().max(200, "Bio must be at most 200 characters").optional().default(""),
  avatar: avatarRule.optional(),
  preferences: z
    .object({
      weeklyActivityTarget: z.coerce.number().int().min(1, "Minimum is 1").max(14, "Maximum is 14"),
      weekStartsOn: z.coerce.number().refine((v) => v === 0 || v === 1, "Choose Sunday or Monday"),
      notificationsEnabled: z.boolean(),
    })
    .partial()
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(72),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });
