import Activity from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildFilter, buildSort } from "../utils/listQuery.js";
import { toCsv } from "../utils/csv.js";
import { makeCrud } from "./crud.factory.js";

const crud = makeCrud({
  Model: Activity,
  label: "Activity",
  searchFields: ["title", "notes"],
  sortable: ["date", "duration", "title", "createdAt"],
  defaultSort: { date: -1, _id: -1 },
  hasTags: true,
  notifyCreate: (d) => ({
    title: "Activity recorded",
    message: `"${d.title}" (${d.duration} min) was added to your history.`,
    type: "activity",
    link: "/activities",
  }),
});

const exportCsv = asyncHandler(async (req, res) => {
  const q = req.query;
  const filter = buildFilter(req.user.id, q, { searchFields: ["title", "notes"], hasTags: true });
  const sort = buildSort(q.sort, ["date", "duration", "title", "createdAt"], { date: -1, _id: -1 });
  const rows = await Activity.find(filter).sort(sort).limit(10000).lean();

  const csv = toCsv(rows, [
    { label: "Title", value: (r) => r.title },
    { label: "Category", value: (r) => r.category },
    { label: "Date", value: (r) => r.date.toISOString().slice(0, 10) },
    { label: "Duration (min)", value: (r) => r.duration },
    { label: "Tags", value: (r) => (r.tags || []).join("; ") },
    { label: "Notes", value: (r) => r.notes },
  ]);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="activities.csv"');
  res.send(csv);
});

export default { ...crud, exportCsv };
