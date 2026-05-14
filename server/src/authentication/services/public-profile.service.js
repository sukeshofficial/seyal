import User from "../models/users.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Get Public Avatar Service
 * @param {string} identifier - Email or Username
 * @returns {Object} - Success response with avatarUrl or default
 */
export const getPublicAvatarService = async (identifier) => {
    if (!identifier || identifier.length < 3) {
        throw new AppError(400, "Identifier too short");
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
        $or: [
            { email: normalizedIdentifier },
            { username: normalizedIdentifier },
        ],
    }).select("profilePicture");

    if (!user) {
        return {
            statusCode: 404,
            success: false,
            message: "User not found",
            data: { avatarUrl: null }
        };
    }

    return {
        statusCode: 200,
        success: true,
        data: {
            avatarUrl: user.profilePicture
        }
    };
};

export default getPublicAvatarService;
