import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import { passport, configurePassport } from "./config/passport.config.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import authRoutes from "./authentication/routes/auth.routes.js";

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// ---------------- Middleware ---------------- //
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim().replace(/\/$/, ""))
  : [
    (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, ""),
    "https://seyal.forgegrid.in"
  ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: origin ${origin} not in allowed list:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logger
const logger = pinoHttp({
  transport:
    process.env.NODE_ENV === "development"
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }
      : undefined,
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
