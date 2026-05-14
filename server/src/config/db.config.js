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

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("Initial connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
