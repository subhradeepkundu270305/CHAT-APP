import express from 'express';
import { getMessages, sendMessage, markMessagesAsSeen, deleteMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// All message routes are protected
router.use(protectRoute);

router.get('/:id', getMessages);
router.post('/send/:id', sendMessage);
router.put('/seen/:senderId', markMessagesAsSeen);
router.delete('/:messageId', deleteMessage);

export default router;

