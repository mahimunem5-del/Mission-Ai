import express from 'express';
import { listAttachments } from '../controllers/attachmentsController.js';

const router = express.Router();

router.get('/', listAttachments);

export default router;
