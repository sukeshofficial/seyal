import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import jwtConfig from "../../config/jwt.config.js";

/**
 * Protect Middleware
 * Verifies JWT access token from cookies or Authorization header
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

        // 2. Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.access.secret);
        } catch (err) {
            throw new AppError(401, "Invalid access token");
        }

        // 3. Attach user to request
        // Decoded payload matches generateTokens.js: { sub, email, providers }
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
