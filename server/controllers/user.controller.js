import { User } from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, avatar, phoneNumber } = req.body;
        const userId = req.user._id;

        // phoneNumber is mandatory to complete the profile
        if (!phoneNumber || !phoneNumber.trim()) {
            return res.status(400).json({ error: "Mobile number is required to complete your profile." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if another user already has this phone number
        const existing = await User.findOne({ phoneNumber: phoneNumber.trim(), _id: { $ne: userId } });
        if (existing) {
            return res.status(409).json({ error: "This mobile number is already registered to another account." });
        }

        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio;

        // Upload avatar to cloudinary if it's a base64 string
        if (avatar && avatar.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            user.avatar = uploadResponse.secure_url;
        } else if (avatar !== undefined) {
            // In case someone just passes a regular string or empties it
            user.avatar = avatar;
        }

        user.phoneNumber = phoneNumber.trim();
        user.isProfileComplete = true;

        await user.save();

        res.status(200).json(user);

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
