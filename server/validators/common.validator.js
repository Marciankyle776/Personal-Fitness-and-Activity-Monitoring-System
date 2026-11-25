import { z } from "zod";

const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);

export const optionalString = (max = 100) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

export const dayString = z.preprocess(
  emptyToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD").optional()
);

export const listQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(10)),
  search: optionalString(100),
  category: optionalString(50),
  status: optionalString(20),
  tag: optionalString(30),
  unread: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).optional()),
  from: dayString,
  to: dayString,
  sort: optionalString(30),
}).refine((q) => !q.from || !q.to || q.from <= q.to, {
  message: "The start date must be on or before the end date",
  path: ["to"],
});

export const analyticsQuerySchema = z.object({
  from: dayString,
  to: dayString,
  today: dayString,
  weeks: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(52).default(8)),
  months: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(24).default(6)),
});
