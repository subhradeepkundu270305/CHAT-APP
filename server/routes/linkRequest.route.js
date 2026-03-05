import express from 'express';
import { sendLinkRequest, getPendingRequests, respondToRequest, getSentRequests, cancelRequest } from '../controllers/linkRequest.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/send', sendLinkRequest);
router.get('/pending', getPendingRequests);
router.put('/:id/respond', respondToRequest);
router.get('/sent', getSentRequests);
router.delete('/:id/cancel', cancelRequest);

export default router;
