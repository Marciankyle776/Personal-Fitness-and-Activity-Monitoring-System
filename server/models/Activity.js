import mongoose from "mongoose";
import { ACTIVITY_CATEGORIES } from "../utils/constants.js";
import { addSessionIndexes, sessionFields, titleField } from "./fragments.js";

const fields = sessionFields("Activity");
fields.category.enum = { values: ACTIVITY_CATEGORIES, message: "Invalid activity category" };

const activitySchema = new mongoose.Schema(
  { title: titleField("Activity title is required"), ...fields },
  { timestamps: true }
);
addSessionIndexes(activitySchema);

export default mongoose.model("Activity", activitySchema);
