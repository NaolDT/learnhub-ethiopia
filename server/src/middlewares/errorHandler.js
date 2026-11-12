import mongoose from "mongoose";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";

function normalizeError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(". ");
    return new AppError(message, 400);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return new AppError(`A record with this ${field} already exists`, 409);
  }

  if (err.type === "entity.parse.failed") {
    return new AppError("Request body contains invalid JSON", 400);
  }

  return err;
}

export default function errorHandler(err, req, res, next) {
  const error = normalizeError(err);
  const isOperational = error instanceof AppError;
  const statusCode = isOperational ? error.statusCode : 500;

  if (!isOperational) {
    console.error("UNEXPECTED ERROR:", err);
  }

  const response = {
    status: statusCode < 500 ? "fail" : "error",
    message:
      isOperational || !env.isProduction
        ? error.message
        : "Something went wrong. Please try again later.",
  };

  if (isOperational && error.details) {
    response.errors = error.details;
  }

  if (!env.isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}