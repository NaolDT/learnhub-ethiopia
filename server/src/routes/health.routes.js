import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

const dbStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

router.get("/", (req, res) => {
  const database = dbStates[mongoose.connection.readyState] ?? "unknown";
  const healthy = database === "connected";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  });
});

export default router;