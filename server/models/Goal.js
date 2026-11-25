import mongoose from "mongoose";
import { GOAL_CATEGORIES, GOAL_STATUSES, GOAL_UNITS } from "../utils/constants.js";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [120, "Title must be at most 120 characters"],
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: GOAL_CATEGORIES, message: "Invalid goal category" },
    },
    targetValue: {
      type: Number,
      required: [true, "Target value is required"],
      min: [1, "Target must be at least 1"],
      max: [100000, "Target is too large"],
    },
    unit: { type: String, enum: GOAL_UNITS, default: "sessions" },
    progressValue: { type: Number, default: 0, min: [0, "Progress cannot be negative"] },
    startDate: { type: Date, required: [true, "Start date is required"], default: Date.now },
    targetDate: { type: Date, required: [true, "Target date is required"] },
    status: { type: String, enum: GOAL_STATUSES, default: "active" },
    completedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

goalSchema.virtual("progressPercent").get(function () {
  if (!this.targetValue) return 0;
  return Math.min(100, Math.round((this.progressValue / this.targetValue) * 100));
});

goalSchema.pre("validate", function (next) {
  if (this.startDate && this.targetDate && this.targetDate < this.startDate) {
    this.invalidate("targetDate", "Target date cannot be before the start date");
  }
  next();
});

// Auto-complete when the target is reached; reopen if progress is lowered.
goalSchema.pre("save", function (next) {
  if (this.progressValue >= this.targetValue && this.status !== "completed") {
    this.status = "completed";
    this.completedAt = new Date();
  } else if (this.progressValue < this.targetValue && this.status === "completed") {
    this.status = "active";
    this.completedAt = undefined;
  }
  next();
});

goalSchema.index({ user: 1, status: 1, targetDate: 1 });

export default mongoose.model("Goal", goalSchema);
