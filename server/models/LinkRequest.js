import mongoose from 'mongoose';

const linkRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'denied'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate pending requests between the same two users
linkRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export const LinkRequest = mongoose.model('LinkRequest', linkRequestSchema);
