import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { passport, configurePassport } from "./config/passport.config.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import authRoutes from "./authentication/routes/auth.routes.js";

const app = express();

// ---------------- Middleware ---------------- //
app.use(express.json());
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(helmet());

// Logger
const logger = pinoHttp({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

app.use(logger);

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Passport
app.use(passport.initialize());
configurePassport();

// ---------------- Health Routes ---------------- //

// Liveness check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check
app.get("/ready", (req, res) => {
  const dbState = mongoose.connection.readyState;

  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const isReady = dbState === 1;

  return res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    database: statusMap[dbState],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.send("API is running 🌀");
});

// ---------------- Routes ---------------- //

app.use("/api/v1/auth", authRoutes);

// ---------------- Error Middleware ---------------- //
app.use(errorMiddleware);

export default app;
