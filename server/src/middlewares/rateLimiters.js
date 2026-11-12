import rateLimit from "express-rate-limit";
import env from "../config/env.js";

function createLimiter({ windowMs, productionLimit, developmentLimit, message }) {
  return rateLimit({
    windowMs,
    limit: env.isProduction ? productionLimit : developmentLimit,
    standardHeaders: true, 
    legacyHeaders: false,
    message: { status: "fail", message },
  });
}

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, 
  productionLimit: 10,
  developmentLimit: 20,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, 
  productionLimit: 5,
  developmentLimit: 20,
  message: "Too many accounts created from this IP. Please try again later.",
});