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

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    if (process.env.NODE_ENV === "development") {
      console.log("Using existing MongoDB connection");
    }
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    if (process.env.NODE_ENV === "development") {
      console.log("New MongoDB connection established");
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
