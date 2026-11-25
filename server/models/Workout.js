import mongoose from "mongoose";
import { WORKOUT_CATEGORIES } from "../utils/constants.js";
import { addSessionIndexes, sessionFields, titleField } from "./fragments.js";

const fields = sessionFields("Workout");
fields.category.enum = { values: WORKOUT_CATEGORIES, message: "Invalid workout category" };

const workoutSchema = new mongoose.Schema(
  {
    name: titleField("Workout name is required"),
    ...fields,
    routine: { type: mongoose.Schema.Types.ObjectId, ref: "Routine", default: null },
  },
  { timestamps: true }
);
addSessionIndexes(workoutSchema);

export default mongoose.model("Workout", workoutSchema);
