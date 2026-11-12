import User from "../modules/users/user.model.js";
import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/tokens.js";

export default async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authentication required", 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";
    throw new AppError(message, 401);
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new AppError("Account not found or deactivated", 401);
  }

  req.user = user;
  next();
}