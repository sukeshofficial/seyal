import "./config/env.config.js";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.config.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      if (process.env.NODE_ENV === "development") {
        console.log(`Server running: http://localhost:${PORT}`);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`${signal} received. Shutting down gracefully...`);
      }

      server.close(async () => {
        await mongoose.connection.close();

        if (process.env.NODE_ENV === "development") {
          console.log("MongoDB connection closed");
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
}

startServer();

