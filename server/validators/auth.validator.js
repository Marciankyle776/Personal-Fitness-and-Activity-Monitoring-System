import { z } from "zod";

// bcrypt only uses the first 72 bytes, so cap the length.
export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

const emailRule = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please provide a valid email address")
  .max(254, "Email is too long");

export const fullNameRule = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(80, "Full name must be at most 80 characters");

export { emailRule };

export const registerSchema = z
  .object({
    fullName: fullNameRule,
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, { message: "You must accept the terms and privacy policy" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required").max(72),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email: emailRule });

export const resetPasswordSchema = z
  .object({
    token: z.string().length(64, "Invalid reset token"),
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
