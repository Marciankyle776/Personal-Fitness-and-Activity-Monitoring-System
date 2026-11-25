import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

// Strict in production, relaxed in development so testing isn't blocked.
const scale = (n) => (env.isProduction ? n : n * 10);

const build = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit: scale(limit),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res, next) => next(new AppError(message, 429)),
  });

export const apiLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: "Too many requests. Please slow down.",
});

export const authLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Too many requests. Please try again in a few minutes.",
});

export const loginLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = build({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many accounts created from this device. Please try again later.",
});

export const passwordResetLimiter = build({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many password reset attempts. Please try again in an hour.",
});
