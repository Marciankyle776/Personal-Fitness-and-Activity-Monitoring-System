import Goal from "../models/Goal.js";
import { makeCrud } from "./crud.factory.js";

export default makeCrud({
  Model: Goal,
  label: "Goal",
  searchFields: ["title", "description"],
  sortable: ["targetDate", "createdAt", "title", "progressValue"],
  defaultSort: { createdAt: -1, _id: -1 },
  dateField: null,
  statusField: "status",
  notifyCreate: (g) => ({
    title: "Goal created",
    message: `You set a new goal: "${g.title}".`,
    type: "goal",
    link: "/goals",
  }),
  notifyUpdate: (g, before) =>
    g.status === "completed" && before.status !== "completed"
      ? { title: "Goal completed", message: `Congratulations! You completed "${g.title}".`, type: "goal", link: "/goals" }
      : { title: "Goal updated", message: `"${g.title}" is now at ${g.progressPercent}%.`, type: "goal", link: "/goals" },
});
