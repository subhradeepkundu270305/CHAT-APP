import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    isProfileComplete: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['GOOGLE', 'MOBILE'], required: true },
    lastSeen: { type: Date, default: null }
}, { timestamps: true });

// Ensure at least one authentication method is provided (async pre-save for Mongoose 7+)
userSchema.pre('save', async function () {
    if (!this.googleId && !this.phoneNumber) {
        throw new Error('User must have either a googleId or a phoneNumber.');
    }
});

export const User = mongoose.model('User', userSchema);

