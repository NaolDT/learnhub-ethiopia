import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.jwt.accessSecret, {
    subject: String(user._id),
    expiresIn: env.jwt.accessExpiresIn,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret, { algorithms: ["HS256"] });
}

export function signRefreshToken(user) {
  return jwt.sign({}, env.jwt.refreshSecret, {
    subject: String(user._id),
    expiresIn: env.jwt.refreshExpiresIn,
    jwtid: crypto.randomUUID(),
    algorithm: "HS256",
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret, { algorithms: ["HS256"] });
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}