import User from "../models/users.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Me Service
 * @param {string} userId - User ID from decoded token
 * @returns {Object} - Sanitized user object or throws AppError
 */
export const meService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    // Return only safe fields
    return {
        statusCode: 200,
        success: true,
        user: {
            id: user._id,
            name: user.name || null,
            email: user.email,
            username: user.username,
            providers: user.providers,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture || null,
        },
    };
};

export default meService;
