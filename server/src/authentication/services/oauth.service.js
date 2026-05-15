import User from "../models/users.model.js";

/**
 * OAuth Service
 * Handles find-or-create logic with account linking
 * @param {Object} profile - Passport profile object
 * @param {string} provider - 'google' or 'github'
 * @returns {Object} - User document
 */
export const oauthService = async (profile, provider) => {
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    if (!email) {
        throw new Error(`Email not provided by ${provider}`);
    }

    // 1. Try to find user by providerId
    const providerField = `${provider}Id`; // e.g. googleId, githubId
    let user = await User.findOne({ [providerField]: providerId }).select("+tokenVersion");

    if (user) return user;

    // 2. If not found, try to find user by email (Account Linking)
    user = await User.findOne({ email }).select("+tokenVersion");

    if (user) {
        // Link existing account
        user[providerField] = providerId;
        if (!user.providers.includes(provider)) {
            user.providers.push(provider);
        }
        // OAuth emails are verified
        user.isVerified = true;
        await user.save();
        return user;
    }

    // 3. Create new user if no match found
    const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "User";
    const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "OAuth";

    user = await User.create({
        name: {
            first: firstName,
            last: lastName,
        },
        email: email,
        username: profile.username || email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, ""),
        [providerField]: providerId,
        providers: [provider],
        isVerified: true, // Trusted from OAuth
        profilePicture: profile.photos?.[0]?.value || null,
    });

    // Re-fetch to include tokenVersion (select: false on the model)
    user = await User.findById(user._id).select("+tokenVersion");

    return user;
};

export default oauthService;
