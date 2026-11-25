import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME } from "../utils/token.js";

// Protects private routes. On success, req.user is the Mongoose user document.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError("Authentication required. Please log in.", 401);

  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("The account for this session no longer exists.", 401);

  if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new AppError("Your password was changed. Please log in again.", 401);
  }

  req.user = user;
  next();
});
