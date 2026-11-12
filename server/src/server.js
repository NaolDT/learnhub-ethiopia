import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import app from "./app.js";

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
  });

  const shutdown = (reason) => {
    console.log(`${reason} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
    shutdown("unhandledRejection");
  });
}

start();