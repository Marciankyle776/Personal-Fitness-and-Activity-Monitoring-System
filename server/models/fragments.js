import mongoose from "mongoose";

// Fields and indexes shared by "session" records (Activity and Workout).
// The stored field names, types and validation rules are unchanged, so existing data is unaffected.
export const sessionFields = (label) => ({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: [true, "Category is required"] },
  date: { type: Date, required: [true, `${label} date is required`] },
  duration: {
    type: Number,
    required: [true, "Duration is required"],
    min: [1, "Duration must be at least 1 minute"],
    max: [1440, "Duration cannot exceed 24 hours"],
  },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  tags: {
    type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
    validate: [(v) => v.length <= 10, "A maximum of 10 tags is allowed"],
    default: [],
  },
});

export const titleField = (requiredMessage) => ({
  type: String,
  required: [true, requiredMessage],
  trim: true,
  maxlength: [120, "Title must be at most 120 characters"],
});

export const addSessionIndexes = (schema) => {
  schema.index({ user: 1, date: -1 });
  schema.index({ user: 1, category: 1, date: -1 });
};
