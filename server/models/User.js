import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { THEMES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [80, "Full name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: { type: String, default: "" },
    bio: { type: String, trim: true, maxlength: 200, default: "" },
    preferences: {
      theme: { type: String, enum: THEMES, default: "light" },
      weeklyActivityTarget: { type: Number, min: 1, max: 14, default: 3 },
      weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
      notificationsEnabled: { type: Boolean, default: true },
    },
    termsAcceptedAt: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Backdate by 1s so a token issued right after the change stays valid.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
