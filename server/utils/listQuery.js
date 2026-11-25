import { parseDay, addDays } from "./dates.js";

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildDateRange = ({ from, to }) => {
  const range = {};
  const f = parseDay(from);
  const t = parseDay(to);
  if (f) range.$gte = f;
  if (t) range.$lt = addDays(t, 1); // inclusive of the whole "to" day
  return Object.keys(range).length ? range : null;
};

export const buildFilter = (userId, q, { searchFields = [], dateField = "date", hasTags = false, statusField } = {}) => {
  const filter = { user: userId };
  if (q.category) filter.category = q.category;
  if (q.status && statusField) filter[statusField] = q.status;
  if (dateField) {
    const range = buildDateRange(q);
    if (range) filter[dateField] = range;
  }
  if (q.tag && hasTags) filter.tags = q.tag.toLowerCase();
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [
      ...searchFields.map((field) => ({ [field]: rx })),
      ...(hasTags ? [{ tags: rx }] : []),
    ];
  }
  return filter;
};

export const buildSort = (sort, allowed, fallback) => {
  if (!sort) return fallback;
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  if (!allowed.includes(key)) return fallback;
  return { [key]: desc ? -1 : 1, _id: -1 };
};
