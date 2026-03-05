import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    savedName: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Ensure a user can only have one contact entry per person
contactSchema.index({ ownerId: 1, contactUserId: 1 }, { unique: true });

export const Contact = mongoose.model('Contact', contactSchema);
