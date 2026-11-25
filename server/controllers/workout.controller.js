import Workout from "../models/Workout.js";
import { makeCrud } from "./crud.factory.js";

export default makeCrud({
  Model: Workout,
  label: "Workout",
  searchFields: ["name", "notes"],
  sortable: ["date", "duration", "name", "createdAt"],
  defaultSort: { date: -1, _id: -1 },
  hasTags: true,
  notifyCreate: (d) => ({
    title: "Workout recorded",
    message: `"${d.name}" (${d.duration} min) was added to your workout history.`,
    type: "workout",
    link: "/workouts",
  }),
});
