// Record dates are stored as UTC midnight of the calendar day the user picked.
// The client sends its own local "today" (YYYY-MM-DD) so analytics windows match the user's day.
export const DAY_MS = 86400000;

export const parseDay = (s) => {
  if (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
};

export const startOfUTCDay = (d = new Date()) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
export const toDayKey = (d) => d.toISOString().slice(0, 10);
export const resolveToday = (s) => parseDay(s) || startOfUTCDay();

export const startOfWeek = (today, weekStartsOn = 1) => {
  const diff = (today.getUTCDay() - weekStartsOn + 7) % 7;
  return addDays(today, -diff);
};
