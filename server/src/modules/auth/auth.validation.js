import { z } from "zod";

const email = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .pipe(z.email("Please provide a valid email address"));

const newPassword = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  fullName: z
    .string("Full name is required")
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters"),
  email,
  password: newPassword,
});

export const loginSchema = z.object({
  email,
  password: z.string("Password is required").min(1, "Password is required"),
});