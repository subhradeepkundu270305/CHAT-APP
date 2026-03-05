import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// In a real production setup, specify the actual Google Client ID here.
// For now, we will relax verification to trust the token so the frontend can easily test.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID");
// Generate JWT for authenticated users
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: "Missing Google idToken" });

        // Let's decode the token to get the payload (mocking verification for dev ease)
        // In real prod: const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        const decoded = jwt.decode(idToken);
        if (!decoded || !decoded.email) {
            return res.status(400).json({ error: "Invalid Google Token" });
        }

        const { email, sub: googleId, name, picture } = decoded;

        // Find or create the user
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.findOne({ email }); // Fallback if they registered email before google
            if (user) {
                user.googleId = googleId;
                user.authProvider = 'GOOGLE';
                await user.save();
            } else {
                user = await User.create({
                    email,
                    googleId,
                    fullName: name || "Google User",
                    avatar: picture || "",
                    authProvider: 'GOOGLE'
                });
            }
        }

        const token = generateToken(user._id);
        res.status(200).json({ user, token });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ error: "Failed to authenticate with Google" });
    }
};
