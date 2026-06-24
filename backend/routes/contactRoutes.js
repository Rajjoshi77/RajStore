import express from 'express';
import { submitContact, sendTestEmail } from '../controllers/contactController.js';

const router = express.Router();

router.post('/submit', submitContact);
router.get('/test', sendTestEmail);

export default router;
