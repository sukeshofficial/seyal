import app from "../src/app.js";
import connectDB from "../src/config/db.config.js";

export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error("Vercel Entry Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error - Database Connection Failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
