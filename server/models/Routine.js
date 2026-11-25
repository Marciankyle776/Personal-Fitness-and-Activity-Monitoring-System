import mongoose from "mongoose";
import { ROUTINE_CATEGORIES } from "../utils/constants.js";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Exercise name is required"], trim: true, maxlength: 100 },
  sets: { type: Number, min: 1, max: 100 },
  reps: { type: Number, min: 1, max: 1000 },
  durationMinutes: { type: Number, min: 1, max: 600 },
  notes: { type: String, trim: true, maxlength: 300, default: "" },
});

const routineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: [true, "Routine name is required"],
      trim: true,
      maxlength: [120, "Name must be at most 120 characters"],
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: ROUTINE_CATEGORIES, message: "Invalid routine category" },
    },
    exercises: {
      type: [exerciseSchema],
      validate: [(v) => v.length <= 50, "A routine can include at most 50 exercises"],
      default: [],
    },
    estimatedDuration: {
      type: Number,
      required: [true, "Estimated duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [1440, "Duration cannot exceed 24 hours"],
    },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    timesCompleted: { type: Number, default: 0, min: 0 },
    lastCompletedAt: { type: Date },
  },
  { timestamps: true }
);

routineSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Routine", routineSchema);
