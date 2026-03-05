import { Contact } from '../models/Contact.js';
import { User } from '../models/User.js';

export const syncContacts = async (req, res) => {
    try {
        // Assume req.user is set by an authMiddleware
        const ownerId = req.user.id;
        const { contacts } = req.body;
        // contacts array map: { name: "Friend", email: "...", phoneNumber: "..." }

        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({ error: "Contacts array is required." });
        }

        const syncedContacts = [];

        for (const c of contacts) {
            // Find if this contact is registered in our app (by email OR phone)
            let matchQuery = [];
            if (c.email) matchQuery.push({ email: c.email });
            if (c.phoneNumber) matchQuery.push({ phoneNumber: c.phoneNumber });

            if (matchQuery.length === 0) continue;

            const registeredUser = await User.findOne({ $or: matchQuery });

            if (registeredUser && registeredUser._id.toString() !== ownerId) {
                // Upsert to ensure we don't throw duplicates, but update names if they changed
                const newContact = await Contact.findOneAndUpdate(
                    { ownerId, contactUserId: registeredUser._id },
                    { savedName: c.name },
                    { upsert: true, new: true }
                ).populate('contactUserId', 'fullName avatar bio phoneNumber lastSeen');

                syncedContacts.push(newContact);
            }
        }

        res.status(200).json({ message: "Contacts synced successfully", syncedContacts });

    } catch (error) {
        console.error("Sync Contacts Error:", error);
        res.status(500).json({ error: "Failed to sync contacts" });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { contactUserId } = req.params;

        const result = await Contact.findOneAndDelete({ ownerId, contactUserId });
        if (!result) {
            return res.status(404).json({ error: "Contact not found." });
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Delete Contact Error:", error);
        res.status(500).json({ error: "Failed to delete contact" });
    }
};

export const getContacts = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const contacts = await Contact.find({ ownerId })
            .populate('contactUserId', 'fullName avatar bio phoneNumber lastSeen');

        res.status(200).json(contacts);
    } catch (error) {
        console.error("Get Contacts Error:", error);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
}
