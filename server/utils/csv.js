// Escapes a value for CSV and neutralizes spreadsheet formula injection.
const cell = (value) => {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const toCsv = (rows, columns) => {
  const header = columns.map((c) => cell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => cell(c.value(row))).join(","));
  return "\uFEFF" + [header, ...lines].join("\r\n");
};
