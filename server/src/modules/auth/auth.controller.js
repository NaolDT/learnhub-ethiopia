import env from "../../config/env.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "refreshToken";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  path: "/api/auth",
};

function setRefreshCookie(res, token, expires) {
  res.cookie(REFRESH_COOKIE, token, { ...baseCookieOptions, expires });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
}

function requestMeta(req) {
  return {
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
  };
}

export async function register(req, res) {
  const { user, accessToken, refreshToken, refreshExpiresAt } =
    await authService.register(req.body, requestMeta(req));

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.status(201).json({ status: "success", data: { user, accessToken } });
}

export async function login(req, res) {
  const { user, accessToken, refreshToken, refreshExpiresAt } =
    await authService.login(req.body, requestMeta(req));

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.status(200).json({ status: "success", data: { user, accessToken } });
}

export async function refresh(req, res) {
  try {
    const { accessToken, refreshToken, refreshExpiresAt } =
      await authService.refresh(req.cookies[REFRESH_COOKIE], requestMeta(req));

    setRefreshCookie(res, refreshToken, refreshExpiresAt);
    res.status(200).json({ status: "success", data: { accessToken } });
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
}

export async function logout(req, res) {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(200).json({ status: "success", message: "Logged out" });
}

export async function me(req, res) {
  res.status(200).json({ status: "success", data: { user: req.user } });
}