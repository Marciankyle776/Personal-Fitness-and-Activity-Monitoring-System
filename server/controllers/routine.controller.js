import Routine from "../models/Routine.js";
import Workout from "../models/Workout.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { startOfUTCDay } from "../utils/dates.js";
import { createNotification } from "../services/notification.service.js";
import { makeCrud } from "./crud.factory.js";

const crud = makeCrud({
  Model: Routine,
  label: "Routine",
  searchFields: ["name", "description"],
  sortable: ["createdAt", "name", "estimatedDuration", "timesCompleted", "lastCompletedAt"],
  defaultSort: { createdAt: -1, _id: -1 },
  dateField: null,
});

// POST /api/routines/:id/log - records a completed routine as a workout session.
const logRoutine = asyncHandler(async (req, res) => {
  const routine = await crud.findOwned(req.params.id, req.user.id);
  const { date, duration, notes } = req.body;

  const workout = await Workout.create({
    user: req.user.id,
    name: routine.name,
    category: routine.category,
    date: date ?? startOfUTCDay(),
    duration: duration ?? routine.estimatedDuration,
    notes: notes ?? "",
    tags: ["routine"],
    routine: routine._id,
  });

  routine.timesCompleted += 1;
  routine.lastCompletedAt = new Date();
  await routine.save();

  await createNotification(req.user.id, {
    title: "Workout recorded",
    message: `You completed the routine "${routine.name}".`,
    type: "workout",
    link: "/workouts",
  });

  res.status(201).json({ success: true, message: "Routine logged as a workout", data: { workout, routine } });
});

export default { ...crud, logRoutine };
