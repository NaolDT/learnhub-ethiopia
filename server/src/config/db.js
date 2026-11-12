import mongoose from "mongoose";
import env from "./env.js";

export async function connectDB() {
  mongoose.connection.on("connected", () => {
    console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB error:", error.message);
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}