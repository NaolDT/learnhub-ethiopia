import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import RefreshToken from "./refreshToken.model.js";
import AppError from "../../utils/AppError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../../utils/tokens.js";

const DUMMY_HASH = bcrypt.hashSync("timing-attack-protection", 12);

const REUSE_GRACE_MS = 10 * 1000;

async function issueTokens(user, meta) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const { exp } = jwt.decode(refreshToken);
  const refreshExpiresAt = new Date(exp * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return { accessToken, refreshToken, refreshExpiresAt };
}

export async function register({ fullName, email, password }, meta) {
  const existing = await User.exists({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ fullName, email, password });
  const tokens = await issueTokens(user, meta);

  return { user, ...tokens };
}

export async function login({ email, password }, meta) {
  const user = await User.findOne({ email }).select("+password");

  const passwordMatches = await bcrypt.compare(
    password,
    user ? user.password : DUMMY_HASH
  );

  if (!user || !passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const tokens = await issueTokens(user, meta);
  return { user, ...tokens };
}

export async function refresh(rawToken, meta) {
  if (!rawToken) {
    throw new AppError("Refresh token missing", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
  if (!stored) {
    throw new AppError("Session not found. Please log in again.", 401);
  }

  if (stored.revokedAt) {
    if (Date.now() - stored.revokedAt.getTime() > REUSE_GRACE_MS) {
      await RefreshToken.deleteMany({ user: stored.user });
    }
    throw new AppError("Session is no longer valid. Please log in again.", 401);
  }

  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: stored._id, revokedAt: null },
    { revokedAt: new Date() }
  );
  if (!claimed) {
    throw new AppError("Session is no longer valid. Please log in again.", 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError("Account not found or deactivated", 401);
  }

  return issueTokens(user, meta);
}
export async function logout(rawToken) {
  if (!rawToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
}