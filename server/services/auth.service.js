import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sendEmail } from "../utils/mailer.js";
import { createNotification } from "./notification.service.js";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

// Compared against when the email doesn't exist, so response time doesn't
// reveal whether an account is registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const registerUser = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with that email already exists", 409, [
      { field: "email", message: "This email is already registered" },
    ]);
  }

  const user = await User.create({
    fullName,
    email,
    password,
    termsAcceptedAt: new Date(),
    lastLoginAt: new Date(),
  });

  await createNotification(
    user._id,
    {
      title: "Welcome to FitTrack",
      message: "Your account is ready. Record your first activity to get started.",
      type: "system",
      link: "/activities",
    },
    { force: true }
  );

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatches) throw new AppError("Invalid email or password", 401);

  const now = new Date();
  await User.updateOne({ _id: user._id }, { lastLoginAt: now });
  user.lastLoginAt = now;
  return user;
};

// Always resolves without revealing whether the email is registered.
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your FitTrack password",
      text:
        `Hi ${user.fullName},\n\nUse the link below to reset your password. ` +
        `It expires in 15 minutes.\n\n${resetUrl}\n\n` +
        `If you didn't request this, you can ignore this email.`,
      html:
        `<p>Hi ${user.fullName.replace(/[<>&"]/g, "")},</p>` +
        `<p>Use the link below to reset your password. It expires in 15 minutes.</p>` +
        `<p><a href="${resetUrl}">Reset password</a></p>` +
        `<p>If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error(`Password reset email failed: ${error.message}`);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return null;
  }

  return resetUrl;
};

export const resetPasswordWithToken = async ({ token, password }) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) throw new AppError("This reset link is invalid or has expired", 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // pre-save hook hashes the password and sets passwordChangedAt

  await createNotification(
    user._id,
    {
      title: "Password changed",
      message: "Your password was reset. If this wasn't you, contact support.",
      type: "profile",
    },
    { force: true }
  );

  return user;
};
