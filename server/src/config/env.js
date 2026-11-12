import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requiredVars = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

const missing = requiredVars.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Create server/.env and fill it in (see server/.env.example).");
  process.exit(1);
}

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

const secretLooksWeak = (secret) =>
  secret.length < 32 || secret.startsWith("replace-with");

if (secretLooksWeak(accessSecret) || secretLooksWeak(refreshSecret)) {
  console.error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be real random strings of at least 32 characters.");
  process.exit(1);
}

if (accessSecret === refreshSecret) {
  console.error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different from each other.");
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || "development";

const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwt: {
    accessSecret,
    refreshSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
};

export default env;