import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import jwtConfig from "../../config/jwt.config.js";
import User from "../models/users.model.js";

/**
 * Protect Middleware
 * Verifies JWT access token from cookies or Authorization header.
 * Also validates the token version against the DB to ensure tokens
 * issued before a logout are rejected immediately (not after expiry).
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Get token from cookies or Authorization header
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new AppError(401, "Access token missing");
        }

        // 2. Verify JWT signature + expiry
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.access.secret);
        } catch (err) {
            throw new AppError(401, "Invalid or expired access token");
        }

        // 3. Check tokenVersion against the database.
        //    This is the key to immediately invalidating tokens after logout.
        //    If the user's tokenVersion in DB is greater than what's in the token,
        //    the token was issued before the last logout and must be rejected.
        const user = await User.findById(decoded.sub).select("+tokenVersion");
        if (!user) {
            throw new AppError(401, "User no longer exists");
        }

        const tokenVersionInDb = user.tokenVersion ?? 0;
        const tokenVersionInJwt = decoded.tv ?? 0;

        if (tokenVersionInJwt !== tokenVersionInDb) {
            throw new AppError(401, "Session has been revoked. Please log in again.");
        }

        // 4. Attach user to request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            providers: decoded.providers,
        };

        next();
    } catch (error) {
        next(error);
    }
};

export default protect;
