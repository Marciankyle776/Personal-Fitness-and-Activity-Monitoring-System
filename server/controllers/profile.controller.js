import bcrypt from "bcrypt";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { signToken, setAuthCookie } from "../utils/token.js";
import { createNotification } from "../services/notification.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, bio, avatar, preferences } = req.body;
  const user = req.user;

  if (email !== user.email) {
    const taken = await User.findOne({ email, _id: { $ne: user._id } });
    if (taken) {
      throw new AppError("That email is already in use", 409, [{ field: "email", message: "This email is already registered" }]);
    }
  }

  user.fullName = fullName;
  user.email = email;
  user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (preferences) {
    Object.entries(preferences).forEach(([key, value]) => user.set(`preferences.${key}`, value));
  }
  await user.save();

  await createNotification(user._id, {
    title: "Profile updated",
    message: "Your profile and preferences were saved.",
    type: "profile",
    link: "/profile",
  });

  res.json({ success: true, message: "Profile updated", data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new AppError("Current password is incorrect", 400, [
      { field: "currentPassword", message: "Current password is incorrect" },
    ]);
  }

  user.password = newPassword;
  await user.save(); // hashes the password and invalidates older sessions

  // Re-issue the cookie so this device stays signed in (as a session cookie).
  setAuthCookie(res, signToken(user._id, false), false);

  await createNotification(user._id, {
    title: "Password changed",
    message: "Your password was updated. Other devices were signed out.",
    type: "profile",
  }, { force: true });

  res.json({ success: true, message: "Password changed successfully" });
});
