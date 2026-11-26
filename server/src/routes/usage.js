import express from 'express';
import { listUserUsage } from '../controllers/usageController.js';

const router = express.Router();

router.get('/', listUserUsage);

export default router;
