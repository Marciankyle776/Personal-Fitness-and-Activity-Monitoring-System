import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const COOKIE_NAME = "token";

export const signToken = (userId, remember = false) =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: remember ? env.jwtExpiresIn : "1d",
  });

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction || env.cookieSameSite === "none",
  sameSite: env.cookieSameSite,
  path: "/",
});

// "Remember me" -> persistent cookie lasting as long as the JWT.
// Otherwise -> session cookie that disappears when the browser closes.
export const setAuthCookie = (res, token, remember = false) => {
  const options = baseCookieOptions();
  if (remember) {
    const { exp } = jwt.decode(token);
    options.maxAge = exp * 1000 - Date.now();
  }
  res.cookie(COOKIE_NAME, token, options);
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());
};
