// Spot-checks WCAG 2.x contrast for the colour pairs the UI actually uses (Tailwind v3 palette values).
// Text needs 4.5:1; borders, icons and focus rings need 3:1. This is NOT a full accessibility audit.
const hex = {
  white: "ffffff", "slate-50": "f8fafc", "slate-100": "f1f5f9", "slate-400": "94a3b8", "slate-500": "64748b", "slate-600": "475569",
  "slate-700": "334155", "slate-900": "0f172a",
  "emerald-50": "ecfdf5", "emerald-100": "d1fae5", "emerald-200": "a7f3d0", "emerald-700": "047857", "emerald-800": "065f46", "emerald-900": "064e3b",
  "red-50": "fef2f2", "red-600": "dc2626", "red-700": "b91c1c", "red-800": "991b1b",
  "amber-50": "fffbeb", "amber-700": "b45309", "amber-900": "78350f", "orange-50": "fff7ed", "orange-700": "c2410c",
  "sky-50": "f0f9ff", "sky-700": "0369a1", "violet-50": "f5f3ff", "violet-700": "6d28d9", "rose-50": "fff1f2", "rose-700": "be123c",
  "fuchsia-50": "fdf4ff", "fuchsia-700": "a21caf", "cyan-50": "ecfeff", "cyan-700": "0e7490", "lime-50": "f7fee7", "lime-700": "4d7c0f",
  "indigo-50": "eef2ff", "indigo-700": "4338ca", "teal-50": "f0fdfa", "teal-700": "0f766e",
};
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(rgb(hex[a])), lum(rgb(hex[b]))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const text = [
  ["white", "emerald-700", "Primary button, active tab, badges"], ["white", "red-700", "Danger button"],
  ["slate-900", "white", "Headings"], ["slate-700", "white", "Body text"], ["slate-600", "white", "Secondary text on cards"],
  ["slate-600", "slate-50", "Secondary text on page background"], ["slate-500", "white", "Placeholder text"],
  ["emerald-800", "white", "Links"], ["emerald-800", "slate-50", "Links on page background"], ["emerald-700", "emerald-50", "Active sidebar item"],
  ["red-700", "white", "Field error text"], ["red-800", "red-50", "Error banner"], ["amber-900", "amber-50", "Stale-data warning"],
  ["emerald-700", "emerald-50", "Badge: Walking, Consistency"], ["orange-700", "orange-50", "Badge: Running"], ["sky-700", "sky-50", "Badge: Cycling, Sessions"],
  ["violet-700", "violet-50", "Badge: Sports"], ["rose-700", "rose-50", "Badge: Strength"], ["red-700", "red-50", "Badge: Cardio"],
  ["fuchsia-700", "fuchsia-50", "Badge: Flexibility"], ["indigo-700", "indigo-50", "Badge: Balance"], ["cyan-700", "cyan-50", "Badge: Mixed"],
  ["lime-700", "lime-50", "Badge: Outdoor"], ["teal-700", "teal-50", "Badge: Exercise"], ["amber-700", "amber-50", "Badge: Duration"],
  ["slate-700", "slate-100", "Badge: Other, tags"], ["lime-700", "white", "Password strength: Good"], ["amber-700", "white", "Password strength: Fair"],
  ["white", "slate-700", "Avatar: slate"], ["white", "amber-700", "Avatar: amber"], ["white", "teal-700", "Avatar: teal"], ["white", "rose-700", "Avatar: rose"],
  ["emerald-50", "emerald-800", "Sign-in side panel text"], ["emerald-100", "emerald-800", "Sign-in side panel footnote"],
];
const nonText = [
  ["slate-500", "white", "Input and select borders"], ["emerald-700", "white", "Focus ring on white"], ["slate-500", "white", "Secondary button and filter tab borders"],
  ["emerald-700", "emerald-50", "Icons on tinted tiles"],
];
let fails = 0;
const run = (title, rows, min) => {
  console.log(`\n${title} (minimum ${min}:1)`);
  for (const [fg, bg, use] of rows) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) fails += 1;
    console.log(`${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)}  ${fg} on ${bg}  - ${use}`);
  }
};
run("Text", text, 4.5);
run("Non-text", nonText, 3);
console.log(fails ? `\n${fails} pair(s) below the minimum.` : "\nAll listed pairs meet the minimum.");
process.exit(fails ? 1 : 0);
