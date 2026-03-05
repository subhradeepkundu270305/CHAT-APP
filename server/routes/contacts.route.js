import express from 'express';
import { syncContacts, getContacts, deleteContact } from '../controllers/contacts.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/sync', syncContacts);
router.get('/', getContacts);
router.delete('/:contactUserId', deleteContact);

export default router;
