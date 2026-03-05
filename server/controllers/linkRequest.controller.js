import { LinkRequest } from '../models/LinkRequest.js';
import { Contact } from '../models/Contact.js';
import { User } from '../models/User.js';
import { io, getSocketId } from '../socket/socket.js';

// ── Send a link request ───────────────────────────────────────────────
export const sendLinkRequest = async (req, res) => {
    try {
        const fromId = req.user._id;
        const { phoneNumber } = req.body;

        if (!phoneNumber || !phoneNumber.trim()) {
            return res.status(400).json({ error: "Phone number is required." });
        }

        // Find the target user
        const targetUser = await User.findOne({ phoneNumber: phoneNumber.trim() });
        if (!targetUser) {
            return res.status(404).json({ error: "No user found with that number." });
        }

        if (targetUser._id.toString() === fromId.toString()) {
            return res.status(400).json({ error: "You cannot send a request to yourself." });
        }

        // Check if they are already contacts
        const existingContact = await Contact.findOne({
            ownerId: fromId,
            contactUserId: targetUser._id
        });
        if (existingContact) {
            return res.status(400).json({ error: "This user is already in your contacts." });
        }

        // Check for existing pending request (either direction)
        const existingRequest = await LinkRequest.findOne({
            $or: [
                { from: fromId, to: targetUser._id, status: 'pending' },
                { from: targetUser._id, to: fromId, status: 'pending' }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({ error: "A link request is already pending." });
        }

        // Clean up any old denied/accepted requests so the unique index doesn't block
        await LinkRequest.deleteMany({
            from: fromId,
            to: targetUser._id,
            status: { $in: ['denied', 'accepted'] }
        });

        const linkRequest = await LinkRequest.create({
            from: fromId,
            to: targetUser._id,
            status: 'pending'
        });

        // Populate sender info for the socket event
        const populated = await LinkRequest.findById(linkRequest._id)
            .populate('from', 'fullName avatar bio phoneNumber');

        // Real-time notification to recipient
        const recipientSocketId = getSocketId(targetUser._id);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('linkRequest', populated);
        }

        res.status(201).json({ message: "Link request sent!", request: populated });

    } catch (error) {
        console.error("Send Link Request Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "A link request already exists." });
        }
        res.status(500).json({ error: "Failed to send link request." });
    }
};

// ── Get pending requests for the logged-in user ───────────────────────
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await LinkRequest.find({ to: userId, status: 'pending' })
            .populate('from', 'fullName avatar bio phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Get Pending Requests Error:", error);
        res.status(500).json({ error: "Failed to fetch pending requests." });
    }
};

// ── Respond to a link request (accept / deny) ─────────────────────────
export const respondToRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { action } = req.body; // "accept" or "deny"

        if (!['accept', 'deny'].includes(action)) {
            return res.status(400).json({ error: "Action must be 'accept' or 'deny'." });
        }

        const request = await LinkRequest.findById(id).populate('from', 'fullName avatar bio phoneNumber');
        if (!request) {
            return res.status(404).json({ error: "Link request not found." });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized to respond to this request." });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ error: "This request has already been handled." });
        }

        if (action === 'accept') {
            request.status = 'accepted';
            await request.save();

            // Create contacts on BOTH sides
            const fromUser = await User.findById(request.from._id);
            const toUser = await User.findById(userId);

            await Contact.findOneAndUpdate(
                { ownerId: request.from._id, contactUserId: userId },
                { savedName: toUser.fullName },
                { upsert: true, new: true }
            );
            await Contact.findOneAndUpdate(
                { ownerId: userId, contactUserId: request.from._id },
                { savedName: fromUser.fullName },
                { upsert: true, new: true }
            );

            // Notify sender via socket
            const senderSocketId = getSocketId(request.from._id);
            if (senderSocketId) {
                io.to(senderSocketId).emit('linkRequestAccepted', {
                    requestId: request._id,
                    by: { _id: userId, fullName: toUser.fullName, avatar: toUser.avatar }
                });
            }

            res.status(200).json({ message: "Link request accepted! Contact added." });

        } else {
            // Deny — delete the request so the sender can try again later
            await LinkRequest.findByIdAndDelete(id);

            // Notify sender via socket
            const senderSocketId = getSocketId(request.from._id);
            if (senderSocketId) {
                io.to(senderSocketId).emit('linkRequestDenied', {
                    requestId: request._id
                });
            }

            res.status(200).json({ message: "Link request denied." });
        }

    } catch (error) {
        console.error("Respond to Link Request Error:", error);
        res.status(500).json({ error: "Failed to respond to link request." });
    }
};

// ── Get sent requests by the logged-in user ───────────────────────────
export const getSentRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await LinkRequest.find({ from: userId, status: 'pending' })
            .populate('to', 'fullName avatar bio phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Get Sent Requests Error:", error);
        res.status(500).json({ error: "Failed to fetch sent requests." });
    }
};

// ── Cancel a sent link request ─────────────────────────────────────────
export const cancelRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const request = await LinkRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: "Link request not found." });
        }
        if (request.from.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized to cancel this request." });
        }

        await LinkRequest.findByIdAndDelete(id);

        // Notify recipient via socket so their UI updates
        const recipientSocketId = getSocketId(request.to);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('linkRequestCancelled', {
                requestId: request._id
            });
        }

        res.status(200).json({ message: "Link request cancelled." });
    } catch (error) {
        console.error("Cancel Link Request Error:", error);
        res.status(500).json({ error: "Failed to cancel link request." });
    }
};
