import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requiredVars = ["MONGODB_URI"];

const missing = requiredVars.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Create server/.env and fill it in (see server/.env.example).");
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || "development";

const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

export default env;