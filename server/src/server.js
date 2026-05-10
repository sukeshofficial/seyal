import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import connectDB from "../src/config/db.config.js";
import { passport, configurePassport } from "./config/passport.config.js";

dotenv.config();

const server = express();
const PORT = process.env.PORT || 5000;

// Middleware
server.use(express.json());
server.use(cors());

// Security headers
server.use(helmet());

// Logger
const logger = pinoHttp({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

server.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

server.use(limiter);

// Passport setup
server.use(passport.initialize());

configurePassport();

// Liveness check (is server running?)
server.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check (is DB connected and app ready?)
server.get("/ready", (req, res) => {
  const dbState = mongoose.connection.readyState;

  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const isReady = dbState === 1;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    database: statusMap[dbState],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Optional: detailed internal health (protect in real prod)
server.get("/health/details", (req, res) => {
  res.status(200).json({
    status: "ok",
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState,
  });
});

// ---- Basic Route ---- //
server.get("/", (req, res) => {
  res.send("API is running 🌀");
});

// ---- DB Connection + Server Start ---- //
async function startServer() {
  try {
    connectDB();

    server.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server not connected", error);
    process.exit(1);
  }
}

startServer();

// ---- Graceful Shutdown ---- //
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Termination signal received...");
  await mongoose.connection.close();
  process.exit(0);
});
