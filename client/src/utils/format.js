const pad = (n) => String(n).padStart(2, "0");

// The user's local calendar day as YYYY-MM-DD (used for date inputs and analytics anchoring).
export const localDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Record dates are stored as UTC midnight, so they are formatted in UTC to avoid off-by-one days.
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : "-");
export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const formatLongToday = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date());

export const formatDuration = (minutes = 0) => {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

export const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n ?? 0);

export const timeAgo = (value) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const units = [["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${name}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "Just now";
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

// Removes empty values so they are not sent as query parameters.
export const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined));

export const parseTags = (text = "") =>
  [...new Set(text.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
