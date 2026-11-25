import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { env } from "../config/env.js";
import { registerUser, loginUser, requestPasswordReset, resetPasswordWithToken } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  setAuthCookie(res, signToken(user._id, false), false);
  res.status(201).json({ success: true, message: "Account created successfully", data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const { rememberMe } = req.body;
  const user = await loginUser(req.body);
  setAuthCookie(res, signToken(user._id, rememberMe), rememberMe);
  res.json({ success: true, message: "Logged in successfully", data: { user } });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const resetUrl = await requestPasswordReset(req.body.email);
  res.json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
    // Local testing convenience only; never sent in production or when SMTP is configured.
    ...(!env.isProduction && !env.smtp.host && resetUrl && { devResetUrl: resetUrl }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordWithToken(req.body);
  clearAuthCookie(res);
  res.json({ success: true, message: "Password reset successfully. Please log in with your new password." });
});
