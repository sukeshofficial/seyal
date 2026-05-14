import mongoose from "mongoose";

mongoose.connection.on("connected", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("MongoDB Connected Successfully ✅");
  }
});

mongoose.connection.on("disconnected", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("MongoDB Disconnected ⚠️");
  }
});

mongoose.connection.on("reconnected", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("MongoDB Reconnected 🔄");
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error ❌", err.message);
});

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development and avoids creating multiple connections in serverless env.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (!process.env.MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV === "development") {
        console.log("New MongoDB connection established");
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection failed:", e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
