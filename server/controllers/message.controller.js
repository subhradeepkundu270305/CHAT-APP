import { Message } from '../models/Message.js';
import { Contact } from '../models/Contact.js';
import { User } from '../models/User.js';
import { io, getSocketId } from '../socket/socket.js';
import cloudinary from '../config/cloudinary.js';

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // ** CORE RESTRICTION LOGIC **
        // Verify that the receiver is in the sender's contact list
        const isContact = await Contact.findOne({ ownerId: senderId, contactUserId: receiverId });

        if (!isContact) {
            return res.status(403).json({
                error: "Access Denied. You can only send messages to users saved in your contacts."
            });
        }

        let imageUrl = null;
        if (image && image.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        } else if (image !== undefined) {
            imageUrl = image; // edge case fallback
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        // ── Real-time delivery via Socket.io ──────────────────────────
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const requesterId = req.user._id.toString();

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        // Only sender or receiver can delete
        if (message.senderId.toString() !== requesterId && message.receiverId.toString() !== requesterId) {
            return res.status(403).json({ error: "Not authorized to delete this message" });
        }

        // Soft-delete: wipe content, mark deleted
        message.text = "";
        message.image = "";
        message.deleted = true;
        await message.save();

        // Emit to both parties so UI updates instantly on both screens
        const senderSocketId = getSocketId(message.senderId.toString());
        const receiverSocketId = getSocketId(message.receiverId.toString());
        const payload = { messageId: message._id.toString() };
        if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", payload);
        if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", payload);

        res.status(200).json({ ok: true, messageId: message._id });
    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        // Verify contact relationship before allowing them to read history too
        const isContact = await Contact.findOne({ ownerId: myId, contactUserId: userToChatId });

        if (!isContact) {
            return res.status(403).json({
                error: "Access Denied. You can only view chats with users saved in your contacts."
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first

        res.status(200).json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { senderId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { senderId, receiverId: myId, seen: false },
            { $set: { seen: true } }
        );

        // Tell sender in real-time — turn their ticks blue
        const senderSocketId = getSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesSeen', { by: myId.toString() });
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Mark Seen Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
